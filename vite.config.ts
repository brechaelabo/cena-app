import path from "path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

/**
 * DEV
 * - Vite sobe em http://localhost:5001
 * - Qualquer chamada que comece por /api é encaminhada ao backend em http://localhost:3001
 *
 * PRODUÇÃO
 * - Este proxy é ignorado; o Express serve /dist e a API na mesma porta process.env.PORT
 */
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");

  return {
    plugins: [react()],
    server: {
      host: "0.0.0.0",
      port: 5001, // Vite dev-server
      strictPort: false, // se 5001 estiver ocupada, pula para a próxima
      proxy: {
        "/api": "http://localhost:3001",
      },
      // Allow all hosts for Replit
      hmr: {
        port: 443,
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
