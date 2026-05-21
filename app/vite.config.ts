import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/auth': 'http://localhost:3000',
      '/whatsapp-sessions': 'http://localhost:3000',
      '/contacts': 'http://localhost:3000',
      '/messages': 'http://localhost:3000',
      '/users': 'http://localhost:3000',
      '/companies': 'http://localhost:3000',
      '/ws': {
        target: 'ws://localhost:3000',
        ws: true,
      },
    },
  },
});
