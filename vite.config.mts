import { defineConfig, loadEnv } from "vite";
import zaloMiniApp from "zmp-vite-plugin";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { IncomingMessage, ServerResponse } from "node:http";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vitejs.dev/config/
export default ({ mode }: { mode: string }) => {
  const env = loadEnv(mode, process.cwd(), '');

  const blobToken = env.BLOB_READ_WRITE_TOKEN || env.Rex_ZMP_READ_WRITE_TOKEN || "";

  const devBlobProxyPlugin = {
    name: "dev-blob-proxy",
    configureServer(server: { middlewares: { use: (handler: (req: IncomingMessage, res: ServerResponse, next: () => void) => void | Promise<void>) => void } }) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith("/api/blob-proxy")) {
          next();
          return;
        }

        try {
          const parsed = new URL(req.url, "http://localhost");
          const rawUrl = parsed.searchParams.get("url") || "";

          if (!rawUrl) {
            res.statusCode = 400;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ message: "Missing url" }));
            return;
          }

          const target = new URL(rawUrl);
          if (target.protocol !== "https:" || !target.hostname.endsWith(".blob.vercel-storage.com")) {
            res.statusCode = 400;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ message: "Invalid blob url" }));
            return;
          }

          if (!blobToken) {
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ message: "Blob token missing" }));
            return;
          }

          const upstream = await fetch(target.toString(), {
            headers: {
              Authorization: `Bearer ${blobToken}`,
            },
          });

          if (!upstream.ok) {
            res.statusCode = upstream.status;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ message: "Blob fetch failed" }));
            return;
          }

          const body = Buffer.from(await upstream.arrayBuffer());
          res.statusCode = 200;
          res.setHeader("Content-Type", upstream.headers.get("content-type") || "application/octet-stream");
          res.setHeader("Cache-Control", upstream.headers.get("cache-control") || "public, max-age=300");
          res.end(body);
        } catch {
          res.statusCode = 502;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ message: "Cannot proxy blob" }));
        }
      });
    },
  };
  
  return defineConfig({
   base: process.env.VERCEL ? "/" : "./",
    plugins: [devBlobProxyPlugin, zaloMiniApp(), react()],
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
        },
      },
    },
  });
};
