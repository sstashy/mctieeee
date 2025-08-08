import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    watch: {
      usePolling: true,
    },
    proxy: {
      "/_status": {
        target: "https://api.sstashy.io",
        changeOrigin: true,
        rewrite: p => p.replace(/^\/_status/, "")
      },
      // Yedek: prefixsiz çağrılırsa yine proxy et
      "/site-status.php": {
        target: "https://api.sstashy.io",
        changeOrigin: true
      }
    }
  }
});
