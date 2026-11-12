import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Em desenvolvimento (npm run dev) a API PHP, as fotos e os assets vêm do
// Docker (nginx na porta 8081). Assim o front React roda em :5173 sem CORS.
const destino = process.env.VITE_PROXY ?? 'http://localhost:8081';

export default defineConfig({
  plugins: [react()],
  publicDir: false, // fotos e vídeo continuam em front/produtos e front/assets
  server: {
    port: 5173,
    proxy: {
      '/admin/api': destino,
      '/produtos': destino,
      '/assets': destino,
    },
  },
  build: { outDir: 'dist', sourcemap: false },
});
