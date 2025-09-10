import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  server: {
    port: 5000,
    open: 'index.html',
    watch: {
      ignored: ['**/node_modules/**', '**/coverage/**', '**/.git/**']
    }
  }
  // Remove publicDir: '.' completely!
});