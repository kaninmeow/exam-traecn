import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from "vite-tsconfig-paths";
import { viteSingleFile } from 'vite-plugin-singlefile';

// https://vite.dev/config/
export default defineConfig({
  build: {
    sourcemap: false,
    assetsInlineLimit: 100000000,
    cssCodeSplit: false,
  },
  plugins: [
    react(),
    tsconfigPaths(),
    viteSingleFile(),
  ],
})
