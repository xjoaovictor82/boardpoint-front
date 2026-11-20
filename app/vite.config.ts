import { defineConfig } from 'vitest/config';
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
  // assetsDir diferente de "assets": em produção /assets/ já é usado pelas
  // fotos do site (front/assets), servidas por fora do build (ver
  // front/app/docker/default.conf). Sem isso, o JS/CSS do build cairia no
  // mesmo caminho das fotos e um dos dois "sumiria".
  build: { outDir: 'dist', assetsDir: 'build-assets', sourcemap: false },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/testes/preparar.ts'],
    restoreMocks: true,
  },
});
