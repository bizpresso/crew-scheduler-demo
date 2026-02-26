import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: process.env.GITHUB_PAGES ? "/crew-scheduler-demo/" : "/",
  server: {
    port: 5174,
    host: true,
  },
});
