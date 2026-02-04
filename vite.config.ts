import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
    proxy: {
      // Proxy NVIDIA API to avoid CORS issues
      "/api/nvidia": {
        target: "https://integrate.api.nvidia.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/nvidia/, ""),
        secure: true,
        timeout: 120000, // 2 minutes for slow AI responses
        proxyTimeout: 120000,
        configure: (proxy) => {
          proxy.on("error", (err) => {
            console.log("[Proxy Error]", err);
          });
          proxy.on("proxyReq", (_proxyReq, req) => {
            console.log("[Proxy Request]", req.method, req.url);
          });
        },
      },
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
