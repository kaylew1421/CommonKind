// vite.config.ts
import path from 'node:path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Loads .env, .env.development, etc. but you only need VITE_* in the client.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    server: {
      host: '0.0.0.0',
      port: 3000,     // dev only; Cloud Run uses server.web.js and $PORT
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './'),   // or './src' if you prefer
      },
    },
    // No 'define' block needed—use import.meta.env.VITE_* directly
    build: {
      outDir: 'dist',
      sourcemap: true,
    },
    // optional: helps some leaflet setups during dev
    optimizeDeps: {
      include: ['react', 'react-dom', 'leaflet', 'react-leaflet'],
    },
  };
});
