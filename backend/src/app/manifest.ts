import { type MetadataRoute } from 'next';
import { readDb } from '@/lib/server/superadmin/store';

export default function manifest(): MetadataRoute.Manifest {
  const { pwa } = readDb().settings;

  return {
    name: pwa?.appName ? `${pwa.appName} Admin` : 'NutriAID Admin',
    short_name: pwa?.appShortName || 'NutriAID',
    description: 'NutriAID Admin Console — platform management for superadmin',
    start_url: '/dashboard',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait-primary',
    background_color: pwa?.backgroundColor || '#f8faf8',
    theme_color: pwa?.themeColor || '#16a34a',
    categories: ['productivity', 'utilities'],
    icons: [
      { src: '/icons/icon-72.png',  sizes: '72x72',   type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-96.png',  sizes: '96x96',   type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-128.png', sizes: '128x128', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-144.png', sizes: '144x144', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-152.png', sizes: '152x152', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-384.png', sizes: '384x384', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
    ],
  };
}
