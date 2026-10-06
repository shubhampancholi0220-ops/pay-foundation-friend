import { createServerFn } from "@tanstack/react-start";
import { useSession, setResponseHeader } from "@tanstack/react-start/server";
import { z } from "zod";

type AccessSession = {
  keyHash?: string;
  deviceId?: string;
};

async function sha256(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function getSessionConfig() {
  return {
    password: process.env["ACCESS_SESSION_SECRET"]!,
    name: "simple-pay-access",
    maxAge: 60 * 60 * 24 * 365 * 10,
    cookie: { httpOnly: true, secure: true, sameSite: "lax" as const, path: "/" },
  };
}

export const getAccessStatus = createServerFn({ method: "GET" }).handler(async () => {
  setResponseHeader("cache-control", "private, no-store");
  const session = await useSession<AccessSession>(getSessionConfig());

  if (!session.data.keyHash || !session.data.deviceId) return { granted: false };

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("access_keys")
    .select("id")
    .eq("key_hash", session.data.keyHash)
    .eq("claimed_device_hash", await sha256(session.data.deviceId))
    .maybeSingle();

  if (error) throw new Error("Access verification is temporarily unavailable.");
  return { granted: Boolean(data) };
});

export const redeemAccessKey = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({ key: z.string().trim().min(1).max(256) }),
  )
  .handler(async ({ data }) => {
    setResponseHeader("cache-control", "private, no-store");
    const session = await useSession<AccessSession>(getSessionConfig());

    const normalizedKey = data.key.trim().toUpperCase();
    const keyHash = await sha256(normalizedKey);
    const deviceId = session.data.deviceId ?? crypto.randomUUID();
    const deviceHash = await sha256(deviceId);

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: claimed, error } = await supabaseAdmin
      .from("access_keys")
      .update({ claimed_device_hash: deviceHash, claimed_at: new Date().toISOString() })
      .eq("key_hash", keyHash)
      .or(`claimed_device_hash.is.null,claimed_device_hash.eq.${deviceHash}`)
      .select("id")
      .maybeSingle();

    if (error) throw new Error("Access verification is temporarily unavailable.");
    if (!claimed) return { ok: false as const };

    await session.update({ keyHash, deviceId });
    return { ok: true as const };
  });