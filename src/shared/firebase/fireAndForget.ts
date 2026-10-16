/**
 * Fire-and-forget: run a promise without blocking the UI.
 * Logs errors to console (non-health-data) so they are not silently swallowed.
 */
export function fireAndForget(promise: Promise<unknown>, label?: string): void {
  promise.catch((err: unknown) => {
    const tag = label ? `[fireAndForget:${label}]` : '[fireAndForget]';
    // Only log the error message/code, never health data
    if (err instanceof Error) {
      console.error(tag, err.message);
    } else {
      console.error(tag, 'Unknown error');
    }
  });
}
