import path from "path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");

  return {
    plugins: [react()],
    server: {
      host: "0.0.0.0",
      port: 5001, // mude aqui se quiser outra porta-dev
      strictPort: false, // se TRUE, falha se 5000 estiver ocupada
      allowedHosts: [".replit.dev", ".repl.co", "localhost"],
      proxy: {
        // todas as chamadas que começam com /api
        "/api": "http://localhost:3001",
      },
      hmr: {
        port: 443, // mantém o túnel HTTPS do Replit
        clientPort: 443,
      },
    },
    define: {
      "process.env.API_KEY": JSON.stringify(env.GEMINI_API_KEY),
      "process.env.GEMINI_API_KEY": JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "."),
      },
    },
  };
});
