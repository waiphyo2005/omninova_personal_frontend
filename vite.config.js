import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig({
  plugins: [react(), cloudflare()],
  base: "/omninova/",
  server: {
    port: 5001,
    host: true,
    allowedHosts: ["omninovawai.com", ".omninovawai.com"], // 👈 add this
  },
});