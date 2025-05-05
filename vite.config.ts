import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [sveltekit()],
  css: {
    preprocessorOptions: {
      scss: {
        api: "modern"
      }
    }
  },
  server: {
    proxy: {
      "/questy/api2": {
        target: "http://127.0.0.1:3333",
        rewrite: path => path.replace("/questy/api2", "/api"),
        ws: true
      }
    }
  }
});
