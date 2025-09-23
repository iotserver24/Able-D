import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [tailwindcss(), reactRouter()],
  server: {
    // Add middleware to handle Chrome DevTools and other .well-known requests
    middlewareMode: false,
    configure: (server) => {
      server.middlewares.use((req, res, next) => {
        // Ignore .well-known paths and Chrome DevTools requests
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
