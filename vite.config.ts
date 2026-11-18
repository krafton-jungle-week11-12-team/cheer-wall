import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  server: {
    proxy: {
      '/db': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/db/, ''),   // /db/query → /query
      },
      '/redis': { 
        target: 'http://127.0.0.1:6380', 
        changeOrigin: true, 
        rewrite: (p) => p.replace(/^\/redis/, '') },
    },
  },
});