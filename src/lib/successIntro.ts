// Session-level flag for the /success intro sequence. Lives in its own
// module (not the route file) so importing it from the PIN screen does not
// break the route's automatic code splitting.

let introPlayed = false;

export function shouldPlaySuccessIntro() {
  return !introPlayed;
}

export function markSuccessIntroPlayed() {
  introPlayed = true;
}

// Called whenever a brand-new payment is confirmed (PIN screen → success),
// so the intro animation replays for each transaction while still being
// skipped when returning from /success-details.
export function resetSuccessIntro() {
  introPlayed = false;
}
