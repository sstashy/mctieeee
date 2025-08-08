import React from "react";
import PropTypes from "prop-types";
import clsx from "clsx";

/**
 * Signature:
 * - Erişilebilir isim
 * - Opsiyonel gizleme (show prop)
 * - Responsive davranış
 * - Kontrast iyileştirme
 */
export default function Signature({
  url = "https://sstashy.io",
  label = "Made by satasii",
  text = "satasii ;)",
  show = true,
  className = "",
  newTab = true,
  hideOnMobile = false,
  srOnly = false
}) {
  if (!show) return null;

  return (
    <a
      href={url}
      target={newTab ? "_blank" : "_self"}
      rel={newTab ? "noopener noreferrer" : undefined}
      aria-label={`${label} (Yeni sekmede açılır)`}
      className={clsx(
        "fixed left-3 bottom-3 z-40 font-semibold select-none",
        "text-[11px] rounded px-2 py-1",
        "bg-black/30 backdrop-blur-sm",
        "text-yellow-300 hover:text-yellow-200",
        "opacity-70 hover:opacity-100 transition",
        hideOnMobile && "hidden sm:inline-flex",
        srOnly && "sr-only",
        "shadow-sm",
        className
      )}
      style={{ pointerEvents: "auto" }}
    >
      {text}
    </a>
  );
}

Signature.propTypes = {
  url: PropTypes.string,
  label: PropTypes.string,
  text: PropTypes.string,
  show: PropTypes.bool,
  className: PropTypes.string,
  newTab: PropTypes.bool,
  hideOnMobile: PropTypes.bool,
  srOnly: PropTypes.bool
};