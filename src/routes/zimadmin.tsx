import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Copy, KeyRound, LockKeyhole, ShieldCheck } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  generateAccessKey,
  getAdminStatus,
  lockAdmin,
  unlockAdmin,
} from "@/lib/admin.functions";

export const Route = createFileRoute("/zimadmin")({
  head: () => ({
    meta: [
      { title: "Key Generator — Simple Pay" },
      { name: "description", content: "Create single-use access keys for Simple Pay." },
      { property: "og:title", content: "Key Generator — Simple Pay" },
      { property: "og:description", content: "Create single-use access keys for Simple Pay." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ZimAdminPage,
});

type PageStatus = "checking" | "locked" | "unlocked" | "unavailable";

function ZimAdminPage() {
  const readStatus = useServerFn(getAdminStatus);
  const authorize = useServerFn(unlockAdmin);
  const createKey = useServerFn(generateAccessKey);
  const endAdminSession = useServerFn(lockAdmin);
  const [status, setStatus] = useState<PageStatus>("checking");
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState("");
  const [generatedKey, setGeneratedKey] = useState("");
  const [isBusy, setIsBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let active = true;
    readStatus()
      .then(({ unlocked }) => {
        if (active) setStatus(unlocked ? "unlocked" : "locked");
      })
      .catch(() => {
        if (active) {
          setStatus("unavailable");
          setError("Admin access is temporarily unavailable. Please refresh and try again.");
        }
      });
    return () => {
      active = false;
    };
  }, [readStatus]);

  async function handleUnlock(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsBusy(true);
    try {
      const result = await authorize({ data: { key: passcode } });
      if (!result.ok) {
        setError("That passcode isn't correct.");
        return;
      }
      setPasscode("");
      setStatus("unlocked");
    } catch {
      setError("We couldn't verify the passcode. Please try again.");
    } finally {
      setIsBusy(false);
    }
  }

  async function handleGenerate() {
    setError("");
    setGeneratedKey("");
    setCopied(false);
    setIsBusy(true);
    try {
      const result = await createKey();
      setGeneratedKey(result.key);
    } catch {
      setError("We couldn't create a key right now. Please sign in again or try once more.");
    } finally {
      setIsBusy(false);
    }
  }

  async function handleCopy() {
    if (!generatedKey) return;
    try {
      await navigator.clipboard.writeText(generatedKey);
      setCopied(true);
    } catch {
      setError("Copy isn't available here. Select the key and copy it manually.");
    }
  }

  async function handleLock() {
    setError("");
    setIsBusy(true);
    try {
      await endAdminSession();
      setGeneratedKey("");
      setStatus("locked");
    } catch {
      setError("We couldn't close the admin session. Please refresh the page.");
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-access-screen px-5 py-10 text-access-text">
      <section className="w-full max-w-[420px]">
        <div className="mb-10 flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl bg-access-accent/15 text-access-accent">
            {status === "unlocked" ? (
              <KeyRound aria-hidden="true" className="size-5" />
            ) : (
              <LockKeyhole aria-hidden="true" className="size-5" />
            )}
          </div>
          <span className="text-lg font-semibold">Simple Pay</span>
        </div>

        {status === "checking" ? (
          <p role="status" className="text-sm text-access-muted">Checking admin access…</p>
        ) : status === "unlocked" ? (
          <>
            <div className="mb-8 flex items-start justify-between gap-4">
              <div>
                <p className="mb-3 text-sm font-medium text-access-accent">KEY MANAGEMENT</p>
                <h1 className="text-3xl font-semibold leading-tight">Generate access key</h1>
                <p className="mt-3 text-sm leading-6 text-access-muted">
                  Each key works for one account and can only be redeemed once.
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Lock admin page"
                title="Lock admin page"
                disabled={isBusy}
                onClick={handleLock}
                className="shrink-0 text-access-muted hover:text-access-text"
              >
                <LockKeyhole aria-hidden="true" />
              </Button>
            </div>

            <Button
              type="button"
              disabled={isBusy}
              onClick={handleGenerate}
              className="h-12 w-full rounded-lg bg-access-accent text-access-text hover:bg-access-accent/90"
            >
              <KeyRound aria-hidden="true" />
              {isBusy ? "Creating key…" : "Generate a key"}
            </Button>

            {generatedKey ? (
              <div className="mt-6 border-t border-access-border pt-6">
                <label htmlFor="generated-key" className="mb-2 block text-sm font-medium">
                  New access key
                </label>
                <div className="flex gap-2">
                  <Input
                    id="generated-key"
                    readOnly
                    value={generatedKey}
                    className="h-12 min-w-0 border-access-border bg-access-surface px-3 font-mono text-sm text-access-text"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    aria-label={copied ? "Key copied" : "Copy key"}
                    title={copied ? "Copied" : "Copy key"}
                    onClick={handleCopy}
                    className="size-12 shrink-0 border-access-border bg-access-surface text-access-text hover:bg-access-surface"
                  >
                    <Copy aria-hidden="true" />
                  </Button>
                </div>
                <p className="mt-3 flex items-start gap-2 text-xs leading-5 text-access-muted">
                  <ShieldCheck aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                  Save this key now. It is shown only once; the database stores its hash.
                </p>
              </div>
            ) : null}
          </>
        ) : status === "locked" ? (
          <>
            <div className="mb-8">
              <p className="mb-3 text-sm font-medium text-access-accent">ADMIN ACCESS</p>
              <h1 className="text-3xl font-semibold leading-tight">Key generator</h1>
              <p className="mt-3 text-sm leading-6 text-access-muted">
                Enter the admin passcode to manage access keys.
              </p>
            </div>

            <form onSubmit={handleUnlock} className="space-y-4">
              <label htmlFor="admin-passcode" className="block text-sm font-medium">
                Admin passcode
              </label>
              <Input
                id="admin-passcode"
                type="password"
                autoComplete="current-password"
                value={passcode}
                onChange={(event) => setPasscode(event.target.value)}
                required
                aria-invalid={Boolean(error)}
                aria-describedby={error ? "admin-error" : undefined}
                className="h-12 rounded-lg border-access-border bg-access-surface px-4 text-base text-access-text focus-visible:ring-access-accent"
              />
              {error ? <p id="admin-error" role="alert" className="text-sm text-destructive">{error}</p> : null}
              <Button
                type="submit"
                disabled={isBusy}
                className="h-12 w-full rounded-lg bg-access-accent text-access-text hover:bg-access-accent/90"
              >
                {isBusy ? "Checking…" : "Unlock key generator"}
              </Button>
            </form>
          </>
        ) : (
          <div>
            <h1 className="text-3xl font-semibold leading-tight">Admin unavailable</h1>
            <p role="alert" className="mt-3 text-sm leading-6 text-destructive">
              {error || "Please refresh the page and try again."}
            </p>
          </div>
        )}

        {status === "unlocked" && error ? (
          <p role="alert" className="mt-4 text-sm text-destructive">{error}</p>
        ) : null}
      </section>
    </main>
  );
}