import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/flickr": {
        target: "https://www.flickr.com/services/feeds",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/flickr/, "/photos_public.gne"),
      },
    },
  },
});
