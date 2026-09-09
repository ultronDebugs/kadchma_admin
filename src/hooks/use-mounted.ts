import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * True only once the client has hydrated. Needed before rendering anything
 * derived from browser-only state (e.g. next-themes' resolvedTheme) so the
 * server-rendered markup matches the first client render.
 */
export function useMounted() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
