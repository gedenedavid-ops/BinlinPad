import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Tu peux ajouter des disallow si tu as des routes privées (comme un dashboard admin)
      // disallow: '/admin/',
    },
    sitemap: 'https://binlinpad.com/sitemap.xml',
  };
}
