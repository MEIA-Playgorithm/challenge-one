import type { IncomingMessage, ServerResponse } from "node:http";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";

// GET /health, in development and in "vite preview" (the server that runs in Docker).
const health: Plugin = {
  name: "health",
  configureServer: (server) => {
    server.middlewares.use(answerHealth);
  },
  configurePreviewServer: (server) => {
    server.middlewares.use(answerHealth);
  },
};

function answerHealth(req: IncomingMessage, res: ServerResponse, next: () => void) {
  if (req.url !== "/health") return next();
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify({ status: "ok" }));
}

export default defineConfig({
  plugins: [react(), health],
});
