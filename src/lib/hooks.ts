"use client";

import { useSyncExternalStore } from "react";

/** Live media-query match; `server` is what's rendered before hydration. */
export function useMediaQuery(query: string, server = false) {
  return useSyncExternalStore(
    (cb) => {
      const m = window.matchMedia(query);
      m.addEventListener("change", cb);
      return () => m.removeEventListener("change", cb);
    },
    () => window.matchMedia(query).matches,
    () => server,
  );
}

const isoToday = () => {
  const t = new Date();
  return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`;
};

/** Today's local date as YYYY-MM-DD on the client, "" on the server. */
export function useTodayISO() {
  return useSyncExternalStore(
    () => () => {},
    isoToday,
    () => "",
  );
}
