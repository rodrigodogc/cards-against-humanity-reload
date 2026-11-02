import path from 'node:path';

import react from '@vitejs/plugin-react';
import { defineConfig, Plugin } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

// Sem isso, um deploy mal configurado passa na build e publica uma tela branca.
function checkFirebaseEnv(): Plugin {
  return {
    name: 'check-firebase-env',
    apply: 'build',
    configResolved({ env }) {
      const missing = [
        'VITE_FIREBASE_API_KEY',
        'VITE_FIREBASE_PROJECT_ID',
        'VITE_FIREBASE_APP_ID',
      ].filter((name) => !env[name]);

      if (missing.length > 0) {
        throw new Error(`Variáveis ausentes: ${missing.join(', ')}.`);
      }

      if (process.env.VERCEL && env.VITE_USE_EMULATORS === 'true') {
        throw new Error('VITE_USE_EMULATORS não pode ser true na Vercel.');
      }
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: [
      { find: '@', replacement: path.resolve(__dirname, 'src') },
      {
        // this is required for the SCSS modules
        find: /^~(.*)$/,
        replacement: '$1',
      },
    ],
  },
  plugins: [
    checkFirebaseEnv(),
    react(),
    VitePWA({
      // A atualização é oferecida em `components/app-status`, nunca forçada:
      // recarregar sozinho derrubaria quem está no meio de uma partida.
      registerType: 'prompt',
      includeAssets: ['favicon.png', 'apple-touch-icon.png'],
      manifest: {
        name: 'Cartas Contra a Humanidade',
        short_name: 'Cartas',
        description:
          'Jogo de cartas online em português, com humor adulto, para jogar com os amigos.',
        lang: 'pt-BR',
        start_url: '/',
        display: 'standalone',
        background_color: '#121214',
        theme_color: '#121214',
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'pwa-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // Só o app: o Firestore é on-line por natureza e nunca passa por aqui.
        globPatterns: ['**/*.{js,css,html,png,svg,woff2}'],
        navigateFallback: '/index.html',
        // As páginas estáticas têm HTML próprio.
        navigateFallbackDenylist: [/\.html$/],
      },
    }),
  ],
});
