import { company } from '../lib/company';
import { publicPages, type PublicPath } from '../lib/seo';
import { siteUrl } from '../lib/site';
import { services } from '../lib/services';

export function PageSchema({ path }: { path: PublicPath }) {
  const page = publicPages[path];
  const origin = siteUrl || '';
  const businessId = `${origin}/#business`;
  const websiteId = `${origin}/#website`;
  const url = `${origin}${path}`;
  const servicePage = path === '/' || path === '/washing-machine-repair-bangalore';
  const graph = [
    { '@type': 'LocalBusiness', '@id': businessId, name: company.name, telephone: company.phone, email: company.email,
      ...(siteUrl ? { url: siteUrl, image: `${siteUrl}/services/washer-diagnosis.webp`, logo: `${siteUrl}/brand/baraabar-logo.webp` } : {}),
      hasMap: company.mapHref, address: { '@type': 'PostalAddress', streetAddress: company.streetAddress, addressLocality: 'Bengaluru', addressRegion: 'Karnataka', postalCode: '560045', addressCountry: 'IN' },
      areaServed: { '@type': 'City', name: 'Bengaluru' },
    },
    { '@type': 'WebSite', '@id': websiteId, name: 'Baraabar', inLanguage: 'en-IN', publisher: { '@id': businessId }, ...(siteUrl ? { url: `${siteUrl}/` } : {}) },
    { '@type': page.type, '@id': `${url}#webpage`, name: page.title, description: page.description, inLanguage: 'en-IN', isPartOf: { '@id': websiteId }, about: { '@id': businessId }, ...(siteUrl ? { url, ...(path !== '/' ? { breadcrumb: { '@id': `${url}#breadcrumb` } } : {}) } : {}), ...(servicePage ? { mainEntity: { '@id': `${url}#service` } } : {}) },
    ...(siteUrl && path !== '/' ? [{ '@type': 'BreadcrumbList', '@id': `${url}#breadcrumb`, itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: `${siteUrl}/` }, { '@type': 'ListItem', position: 2, name: page.name, item: url }] }] : []),
    ...(servicePage ? [{ '@type': 'Service', '@id': `${url}#service`, name: page.name, serviceType: 'Washing machine repair, installation and maintenance', provider: { '@id': businessId }, areaServed: { '@type': 'City', name: 'Bengaluru' }, description: 'Availability and appointments are confirmed for your PIN code. Spare parts and additional repairs are quoted separately.', hasOfferCatalog: { '@type': 'OfferCatalog', name: 'Washing machine services', itemListElement: services.map(service => ({ '@type': 'Offer', price: service.price, priceCurrency: 'INR', description: `${service.starting ? 'Starting price. ' : ''}${service.detail} Spare parts and additional repairs are quoted separately.`, itemOffered: { '@type': 'Service', name: service.title } })) } }] : []),
  ];
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(/</g, '\\u003c') }}/>;
}
