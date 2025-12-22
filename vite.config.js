import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: '/natal-engine/',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        docs: resolve(__dirname, 'docs.html'),
        mcp: resolve(__dirname, 'mcp.html'),
      },
    },
  },
});
