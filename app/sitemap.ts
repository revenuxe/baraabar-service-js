import type { MetadataRoute } from 'next';
import { siteUrl } from '../lib/site';
import { publicPages } from '../lib/seo';

export default function sitemap(): MetadataRoute.Sitemap {
  if (!siteUrl) return [];
  return Object.keys(publicPages).map(path => ({ url: `${siteUrl}${path}` }));
}
