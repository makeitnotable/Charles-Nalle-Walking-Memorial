import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from '@tailwindcss/vite'


export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: "/Charles-Nalle-Walking-Memorial/",
  server: {
    historyApiFallback: true, // Ensures client-side routing works in development
    allowedHosts: ['3b49-73-169-38-78.ngrok-free.app'],
  },
});