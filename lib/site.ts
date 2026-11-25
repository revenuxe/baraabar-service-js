// Set the production origin before deployment so canonical URLs match the live host.
const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() || 'https://www.baraabar.com';
// Reject path/query configuration rather than silently publishing incorrect canonicals.
function productionOrigin(value: string | undefined) {
  if (!value) return undefined;
  const url = new URL(value);
  if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password || url.pathname !== '/' || url.search || url.hash) {
    throw new Error('NEXT_PUBLIC_SITE_URL must be an HTTP(S) origin, such as https://your-domain.com');
  }
  return url.origin;
}
export const siteUrl = productionOrigin(configuredUrl);
export const bangalorePath = '/washing-machine-repair-bangalore';
