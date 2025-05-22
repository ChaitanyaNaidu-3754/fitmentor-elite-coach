import react from "@vitejs/plugin-react-swc";
import { componentTagger } from "lovable-tagger";
import path from "path";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'mediapipe': ['@mediapipe/pose', '@mediapipe/drawing_utils', '@mediapipe/camera_utils'],
        },
      },
    },
  },
  optimizeDeps: {
    include: ['@mediapipe/pose', '@mediapipe/drawing_utils', '@mediapipe/camera_utils'],
  },
}));
