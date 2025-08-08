import { useEffect, useRef } from "react";

/**
 * items: [
 *   { ref: React.ref(HTMLElement), value: any, disabled?: boolean }
 * ]
 *
 * options:
 *  - loop (default true)
 *  - orientation: 'horizontal' | 'vertical' | 'both'
 *  - onSelect: (value) => void (Enter/Space veya focus ile tetiklenebilir)
 *  - activation: 'focus' | 'manual' (focus'ta mı seçsin yoksa Enter/Space mi?)
 *  - initialIndex
 *  - preventScrollOnFocus
 *  - homeEnd (default true)
 *  - pageKeys (default false)
 *  - roving (default true) -> tabindex yönet
 */
export default function useTabKeyboardNav(
  containerRef,
  items,
  onSelect,
  {
    loop = true,
    orientation = "horizontal",
    activation = "focus",
    initialIndex = 0,
    preventScrollOnFocus = true,
    homeEnd = true,
    pageKeys = false,
    roving = true
  } = {}
) {
  const currentIndexRef = useRef(initialIndex);

  // Başlangıç tabindex ayarı (roving)
  useEffect(() => {
    if (!roving) return;
    items.forEach((item, idx) => {
      const el = item.ref?.current;
      if (el) {
        el.setAttribute("tabindex", idx === initialIndex ? "0" : "-1");
      }
    });
    currentIndexRef.current = Math.min(initialIndex, items.length - 1);
  }, [items, initialIndex, roving]);

  const focusItem = (nextIdx) => {
    if (nextIdx < 0 || nextIdx >= items.length) return;
    const item = items[nextIdx];
    if (!item || item.disabled) return;

    const el = item.ref?.current;
    if (el) {
      el.focus({ preventScroll: preventScrollOnFocus });
      if (roving) {
        // Aktif item tabindex=0, diğerleri -1
        items.forEach((it, i) => {
          const node = it.ref?.current;
            if (node) node.setAttribute("tabindex", i === nextIdx ? "0" : "-1");
        });
      }
      currentIndexRef.current = nextIdx;
      if (activation === "focus") onSelect?.(item.value);
    }
  };

  const move = (delta) => {
    const len = items.length;
    if (!len) return;
    let idx = currentIndexRef.current;
    for (let attempt = 0; attempt < len; attempt++) {
      idx += delta;
      if (loop) {
        if (idx < 0) idx = len - 1;
        if (idx >= len) idx = 0;
      } else {
        if (idx < 0 || idx >= len) return;
      }
      if (!items[idx]?.disabled) {
        focusItem(idx);
        return;
      }
    }
  };

  const findFirstEnabled = () => {
    for (let i = 0; i < items.length; i++) {
      if (!items[i].disabled) return i;
    }
    return -1;
  };
  const findLastEnabled = () => {
    for (let i = items.length - 1; i >= 0; i--) {
      if (!items[i].disabled) return i;
    }
    return -1;
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    function keyHandler(e) {
      const key = e.key;
      const horizontal = orientation === "horizontal" || orientation === "both";
      const vertical = orientation === "vertical" || orientation === "both";

      if (horizontal && (key === "ArrowRight" || key === "ArrowLeft")) {
        e.preventDefault();
        move(key === "ArrowRight" ? +1 : -1);
        return;
      }
      if (vertical && (key === "ArrowDown" || key === "ArrowUp")) {
        e.preventDefault();
        move(key === "ArrowDown" ? +1 : -1);
        return;
      }

      if (homeEnd && key === "Home") {
        e.preventDefault();
        const first = findFirstEnabled();
        if (first >= 0) focusItem(first);
        return;
      }
      if (homeEnd && key === "End") {
        e.preventDefault();
        const last = findLastEnabled();
        if (last >= 0) focusItem(last);
        return;
      }

      if (pageKeys && (key === "PageUp" || key === "PageDown")) {
        e.preventDefault();
        // Basit örnek: PageUp -> ilk, PageDown -> son
        if (key === "PageUp") {
          const first = findFirstEnabled();
          if (first >= 0) focusItem(first);
        } else {
          const last = findLastEnabled();
          if (last >= 0) focusItem(last);
        }
        return;
      }

      if (activation === "manual" && (key === "Enter" || key === " ")) {
        // manual modda Enter/Space seçimi tetikler
        const idx = currentIndexRef.current;
        const item = items[idx];
        if (item && !item.disabled) {
          e.preventDefault();
          onSelect?.(item.value);
        }
      }

      // (Opsiyonel) Typeahead: tek harf ile başlayan arama
      if (key.length === 1 && /^[\w\dğüşiöç]$/i.test(key)) {
        const char = key.toLowerCase();
        const start = (currentIndexRef.current + 1) % items.length;
        for (let i = 0; i < items.length; i++) {
          const idx = (start + i) % items.length;
          const item = items[idx];
          if (item?.disabled) continue;
          const text = item.ref?.current?.textContent?.trim().toLowerCase();
          if (text && text.startsWith(char)) {
            focusItem(idx);
            break;
          }
        }
      }
    }

    el.addEventListener("keydown", keyHandler);
    return () => el.removeEventListener("keydown", keyHandler);
  }, [
    containerRef,
    items,
    orientation,
    activation,
    loop,
    homeEnd,
    pageKeys,
    preventScrollOnFocus,
    roving,
    onSelect
  ]);
}