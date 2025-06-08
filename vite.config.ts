import path from "path";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");
  return {
    server: {
      host: "0.0.0.0",
      port: 5001,
      strictPort: false,
      allowedHosts: [".replit.dev", ".repl.co", "localhost"],
      hmr: {
        port: 5001,
        clientPort: 5001,
      },
      proxy: {
        '/api': {
          target: 'http://0.0.0.0:3001',
          changeOrigin: true,
          secure: false,
        },
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
