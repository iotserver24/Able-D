// vite.config.js
import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    tailwindcss(),
    reactRouter()
  ],
  server: {
    host: true,  // Expose to the network
    
    // Your existing middleware configuration
    middlewareMode: false,
    configure: (server) => {
      server.middlewares.use((req, res, next) => {
        if (req.url?.includes('/.well-known/') ||
          req.url?.includes('/com.chrome.devtools.json')) {
          res.statusCode = 404;
          res.end();
          return;
        }
        next();
      });
    },
  },
});