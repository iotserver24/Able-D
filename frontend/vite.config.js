// vite.config.js
import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import basicSsl from '@vitejs/plugin-basic-ssl'; // 1. Import the SSL plugin

export default defineConfig({
  plugins: [
    tailwindcss(),
    reactRouter(),
    basicSsl() // 2. Add the plugin here
  ],
  server: {
    https: true, // 3. Enable HTTPS
    host: true,  // 4. Expose to the network
    
    // Your existing middleware configuration remains the same
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