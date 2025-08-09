import { useEffect } from "react";

export default function useIdleCallback(cb, deps = [], { timeout = 2000 } = {}) {
  useEffect(() => {
    let id;
    if ("requestIdleCallback" in window) {
      id = window.requestIdleCallback(cb, { timeout });
      return () => window.cancelIdleCallback(id);
    }
    const t = setTimeout(cb, timeout);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}