# Add a payment access-key gate

## User experience
- Show a dark, mobile-friendly key-entry screen before the existing payment demo.
- Check keys through the server and open the existing app only after a successful check.
- Show one clear error for invalid, unavailable, or already-claimed keys.

## Access and security
- Use Lovable Cloud to store key hashes and the first-browser claim, never plaintext keys.
- Atomically allow one browser to claim a key, then keep its access in an encrypted, secure browser session.
- Gate every app route on the server; leave only the key-entry screen public.
- Add no user profiles or role system, as requested.

## Technical details
- Add a locked-down Cloud table accessed only by server-side functions.
- Keep access verification and redemption in TanStack Start server functions; validate and hash submitted keys before database lookups.
- Do not add a key generator or preloaded key: both are deferred. The gate will remain closed until a key is issued into Cloud.
- Verify the gate screen, rejected keys, successful one-browser redemption, and protected-route blocking, then check preview diagnostics.
