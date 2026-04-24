import { defineConfig, loadEnv } from "vite";
import zaloMiniApp from "zmp-vite-plugin";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vitejs.dev/config/
export default ({ mode }: { mode: string }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  return defineConfig({
   base: process.env.VERCEL ? "/" : "./",
    plugins: [zaloMiniApp(), react()],
    build: {
      outDir: "www",
      assetsInlineLimit: 0,
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },
    server: {
      port: 3000,
      proxy: {
        '/api': {
          target: env.VITE_BACKEND_URL,
          changeOrigin: true,
          secure: false,
          bypass: (req) => {
            if (req.url?.startsWith('/api/blob-proxy')) {
              return req.url;
            }
            return undefined;
          },
        },
      },
    },
  });
};
