import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: '/starchart/',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        about: resolve(__dirname, 'about.html'),
        docs: resolve(__dirname, 'docs.html'),
        mcp: resolve(__dirname, 'mcp.html'),
      },
    },
  },
});
