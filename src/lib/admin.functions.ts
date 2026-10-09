import { createServerFn } from "@tanstack/react-start";
import { setResponseHeader, useSession } from "@tanstack/react-start/server";
import { z } from "zod";

type AdminSession = {
  authorized?: boolean;
};

function getAdminSessionConfig() {
  const password = process.env["ACCESS_SESSION_SECRET"];
  if (!password) throw new Error("Admin access is temporarily unavailable.");

  return {
    password,
    name: "simple-pay-zimadmin",
    maxAge: 60 * 60 * 12,
    cookie: { httpOnly: true, secure: true, sameSite: "none" as const, path: "/" },
  };
}

async function sha256(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function matchesSecret(candidate: string, expected: string) {
  const [candidateDigest, expectedDigest] = await Promise.all([
    crypto.subtle.digest("SHA-256", new TextEncoder().encode(candidate)),
    crypto.subtle.digest("SHA-256", new TextEncoder().encode(expected)),
  ]);
  const candidateBytes = new Uint8Array(candidateDigest);
  const expectedBytes = new Uint8Array(expectedDigest);
  let difference = 0;
  for (let index = 0; index < candidateBytes.length; index += 1) {
    difference |= (candidateBytes[index] ?? 0) ^ (expectedBytes[index] ?? 0);
  }
  return difference === 0;
}

export const getAdminStatus = createServerFn({ method: "GET" }).handler(async () => {
  setResponseHeader("cache-control", "private, no-store");
  const session = await useSession<AdminSession>(getAdminSessionConfig());
  return { unlocked: session.data.authorized === true };
});

export const unlockAdmin = createServerFn({ method: "POST" })
  .validator(z.object({ key: z.string().trim().min(1).max(256) }))
  .handler(async ({ data }) => {
    setResponseHeader("cache-control", "private, no-store");

    const expectedKey = process.env["ZIMADMIN_PASSWORD"];
    if (!expectedKey) throw new Error("Admin access is temporarily unavailable.");
    if (!(await matchesSecret(data.key.trim(), expectedKey))) return { ok: false as const };

    const session = await useSession<AdminSession>(getAdminSessionConfig());
    await session.update({ authorized: true });
    return { ok: true as const };
  });

export const lockAdmin = createServerFn({ method: "POST" }).handler(async () => {
  setResponseHeader("cache-control", "private, no-store");
  const session = await useSession<AdminSession>(getAdminSessionConfig());
  await session.update({ authorized: false });
  return { ok: true as const };
});

export const generateAccessKey = createServerFn({ method: "POST" }).handler(async () => {
  setResponseHeader("cache-control", "private, no-store");
  const session = await useSession<AdminSession>(getAdminSessionConfig());
  if (session.data.authorized !== true) throw new Error("Admin access is required.");

  const bytes = crypto.getRandomValues(new Uint8Array(16));
  const randomPart = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
  const groupedPart = randomPart.match(/.{4}/g)?.join("-") ?? randomPart;
  const key = `ZIM-${groupedPart}`;
  const keyHash = await sha256(key);

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { error } = await supabaseAdmin.from("access_keys").insert({ key_hash: keyHash });
  if (error) throw new Error("We couldn't create a key right now. Please try again.");

  return { key };
});