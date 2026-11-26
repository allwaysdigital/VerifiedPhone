// Button text while a purchase is being saved (VP-07): upload percentage while
// photos are sending, then "Saving…" while the server stores them.
export function savingLabel(progress: number | null): string {
  if (progress === null || progress >= 1) {
    return 'Saving…';
  }
  return `Uploading photos… ${Math.round(Math.max(0, progress) * 100)}%`;
}
