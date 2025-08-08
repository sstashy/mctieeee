import { useEffect } from "react";

/**
 * Basit focus trap: container içindeki odaklanabilir elemanlar arasında tab döngüsü.
 */
export default function useFocusTrap(ref, active) {
  useEffect(() => {
    if (!active) return;
    const root = ref.current;
    if (!root) return;

    const selector = [
      "a[href]",
      "button:not([disabled])",
      "textarea:not([disabled])",
      "input:not([disabled])",
      "select:not([disabled])",
      "[tabindex]:not([tabindex='-1'])"
    ].join(",");

    const getFocusable = () =>
      Array.from(root.querySelectorAll(selector))
        .filter(el => !el.hasAttribute("disabled") && !el.getAttribute("aria-hidden"));

    // İlk odak
    const focusables = getFocusable();
    if (focusables.length) {
      // İlk form elemanını veya butonu seç
      const firstInput = focusables.find(el => ["INPUT","BUTTON","TEXTAREA","SELECT"].includes(el.tagName));
      (firstInput || focusables[0]).focus();
    } else {
      root.focus();
    }

    function handleKey(e) {
      if (e.key !== "Tab") return;
      const items = getFocusable();
      if (!items.length) return;
      const idx = items.indexOf(document.activeElement);
      let nextIdx = idx;
      if (e.shiftKey) {
        nextIdx = idx <= 0 ? items.length - 1 : idx - 1;
      } else {
        nextIdx = idx === items.length - 1 ? 0 : idx + 1;
      }
      if (nextIdx !== idx) {
        e.preventDefault();
        items[nextIdx].focus();
      }
    }

    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [ref, active]);
}