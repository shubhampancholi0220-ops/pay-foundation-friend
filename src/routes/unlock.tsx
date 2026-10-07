import { useServerFn } from "@tanstack/react-start";
import { createFileRoute } from "@tanstack/react-router";
import { KeyRound, ShieldCheck } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { redeemAccessKey } from "@/lib/access.functions";

export const Route = createFileRoute("/unlock")({
  head: () => ({
    meta: [
      { title: "Enter Access Key — Simple Pay" },
      { name: "description", content: "Enter your paid access key to continue to Simple Pay." },
      { property: "og:title", content: "Enter Access Key — Simple Pay" },
      {
        property: "og:description",
        content: "Enter your paid access key to continue to Simple Pay.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: UnlockPage,
});

function UnlockPage() {
  const redeem = useServerFn(redeemAccessKey);
  const [key, setKey] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const result = await redeem({ data: { key } });
      if (!result.ok) {
        setError("This key is invalid or has already been used on another device.");
        return;
      }
      window.location.replace("/");
    } catch {
      setError("We couldn't verify your key right now. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-access-screen px-5 py-10 text-access-text">
      <section className="w-full max-w-[380px]">
        <div className="mb-10 flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl bg-access-accent/15 text-access-accent">
            <KeyRound aria-hidden="true" className="size-5" />
          </div>
          <span className="text-lg font-semibold">Simple Pay</span>
        </div>

        <div className="mb-8">
          <p className="mb-3 text-sm font-medium text-access-accent">PAYMENT ACCESS</p>
          <h1 className="text-3xl font-semibold leading-tight">Enter your access key</h1>
          <p className="mt-3 text-sm leading-6 text-access-muted">
            Use the key shared after your payment is confirmed.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label htmlFor="access-key" className="block text-sm font-medium">
            Access key
          </label>
          <Input
            id="access-key"
            name="key"
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            value={key}
            onChange={(event) => setKey(event.target.value.toUpperCase())}
            placeholder="Enter your key"
            required
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "access-key-error" : undefined}
            className="h-12 rounded-lg border-access-border bg-access-surface px-4 font-mono text-base tracking-[0.08em] text-access-text placeholder:font-sans placeholder:tracking-normal placeholder:text-access-muted focus-visible:ring-access-accent"
          />
          {error ? (
            <p id="access-key-error" role="alert" className="text-sm text-destructive">
              {error}
            </p>
          ) : null}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-12 w-full rounded-lg bg-access-accent text-access-text hover:bg-access-accent/90"
          >
            {isSubmitting ? "Checking key…" : "Continue to Simple Pay"}
          </Button>
        </form>

        <div className="mt-8 flex items-start gap-3 border-t border-access-border pt-5 text-xs leading-5 text-access-muted">
          <ShieldCheck aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          <p>Each key can be used on one device only.</p>
        </div>
      </section>
    </main>
  );
}