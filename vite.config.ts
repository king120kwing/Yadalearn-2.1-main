import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import jwt from "jsonwebtoken";

// Plugin to serve stream tokens securely without exposing the secret to the frontend
const streamTokenPlugin = () => ({
  name: 'stream-token-plugin',
  configureServer(server: any) {
    server.middlewares.use('/api/get-stream-token', (req: any, res: any) => {
      // Load env vars, including .env.local
      const env = loadEnv(server.config.mode, process.cwd(), '');
      const secret = env.STREAM_SECRET;
      
      if (!secret) {
        res.statusCode = 500;
        return res.end(JSON.stringify({ error: "STREAM_SECRET not found in environment" }));
      }

      // Extract user_id from query params: /api/get-stream-token?user_id=123
      const url = new URL(req.url, `http://${req.headers.host}`);
      const userId = url.searchParams.get('user_id');

      if (!userId) {
        res.statusCode = 400;
        return res.end(JSON.stringify({ error: "user_id query parameter is required" }));
      }

      try {
        // Create Stream JWT
        const token = jwt.sign({ user_id: userId }, secret, { algorithm: 'HS256', noTimestamp: true });
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ token }));
      } catch (err: any) {
        res.statusCode = 500;
        res.end(JSON.stringify({ error: err.message }));
      }
    });
  }
});

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), streamTokenPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
