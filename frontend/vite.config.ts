import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  return {
    server: {
      port: 5173, // fixed dev server port
    },
    plugins: [
      react(),
      mode === "development" ? componentTagger() : undefined, // safer syntax
    ].filter(Boolean), // removes undefined
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"), // '@' points to ./src
      },
    },
  };
});
