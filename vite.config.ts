import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import {VitePWA} from 'vite-plugin-pwa';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'prompt',
        injectRegister: null,
        includeAssets: ['icons/*.svg', 'offline.html'],
        manifest: {
          name: 'Eleven Craft Studio',
          short_name: 'Eleven Craft',
          description: 'Eleven Craft Studio — offline business document & letterhead editor',
          theme_color: '#0f172a',
          background_color: '#0f172a',
          display: 'standalone',
          orientation: 'any',
          start_url: '/',
          scope: '/',
          id: '/',
          icons: [
            { src: 'icons/icon.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'any' },
            { src: 'icons/icon.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'maskable' },
          ],
          screenshots: [],
          categories: ['business', 'productivity'],
          lang: 'en',
          dir: 'ltr',
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2,woff,ttf}'],
          cleanupOutdatedCaches: true,
          navigateFallback: 'index.html',
          runtimeCaching: [
            {
              urlPattern: ({ request, sameOrigin }) =>
                sameOrigin && (request.destination === 'image' || request.destination === 'font'),
              handler: 'CacheFirst',
              options: {
                cacheName: 'app-assets',
                expiration: { maxEntries: 300, maxAgeSeconds: 30 * 24 * 60 * 60 },
                cacheableResponse: { statuses: [0, 200] },
              },
            },
            {
              urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts',
                expiration: { maxEntries: 20, maxAgeSeconds: 365 * 24 * 60 * 60 },
              },
            },
          ],
        },
        pwaAssets: {
          disabled: true,
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-react': ['react', 'react-dom'],
            'vendor-motion': ['motion'],
            'vendor-ui': ['lucide-react'],
            'vendor-idb': ['idb'],
          },
        },
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
