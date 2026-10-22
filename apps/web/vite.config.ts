import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Aplikasi statis tanpa server. Semua aset dibundel agar bisa berjalan offline.
export default defineConfig({
  plugins: [react()],
  base: "./",
});
