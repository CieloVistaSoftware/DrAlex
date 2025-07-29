import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  server: {
    port: 5000,
    open: 'index.html',
  },
  publicDir: '.',
});
