import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/omninova/",
  server: {
    port: 5001,
    host: true,
    allowedHosts: ["omninovawai.com", ".omninovawai.com"], // 👈 add this
  },
});
