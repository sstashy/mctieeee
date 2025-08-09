import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import licenseEnforcerPlugin from "./build/licenseEnforcerPlugin.js";
import { visualizer } from "rollup-plugin-visualizer";

const analyze = process.env.ANALYZE === "1";

export default defineConfig(({ command }) => {
  const isBuild = command === "build";
  return {
    plugins: [
      react(),
      tailwindcss(),
      licenseEnforcerPlugin({ failOnMismatch: true }),
      ...(isBuild && analyze
        ? [visualizer({ filename: "dist/stats.html", gzipSize: true, brotliSize: true })]
        : [])
    ],
    build: {
      target: "es2022",
      cssMinify: "lightningcss",
      modulePreload: { polyfill: false },
      sourcemap: false,
      reportCompressedSize: true,
      minify: "esbuild",
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("node_modules")) {
              if (id.includes("react") || id.includes("scheduler")) return "vendor-react";
              if (id.includes("framer-motion")) return "vendor-motion";
              if (id.includes("@radix-ui")) return "vendor-radix";
              return "vendor";
            }
          }
        }
      }
    },
    optimizeDeps: {
      include: ["react", "react-dom", "framer-motion", "@tanstack/react-virtual"]
    },
    server: {
      watch: { usePolling: true },
      proxy: {
        "/_status": {
          target: "https://api.sstashy.io",
          changeOrigin: true,
          rewrite: p => p.replace(/^\/_status/, "")
        },
        "/site-status.php": {
          target: "https://api.sstashy.io",
          changeOrigin: true
        }
      }
    },
    esbuild: { legalComments: "none" }
  };
});