import { useSyncExternalStore } from "react";

function subscribe(callback) {
  const query = window.matchMedia("(prefers-color-scheme: dark)");
  query.addEventListener("change", callback);
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => {
    query.removeEventListener("change", callback);
    observer.disconnect();
  };
}

function getSnapshot() {
  const theme = document.documentElement.getAttribute("data-theme");
  if (theme) return theme === "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function useIsDark() {
  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}
