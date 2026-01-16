export interface SEOProps {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  ogType?: string;
  noindex?: boolean;
  nofollow?: boolean;
}

export function generateMetaTags(props: SEOProps) {
  const {
    title,
    description,
    canonical,
    ogImage = '/images/og-default.jpg',
    ogType = 'website',
    noindex = false,
    nofollow = false
  } = props;

  const robotsContent = [];
  if (noindex) robotsContent.push('noindex');
  if (nofollow) robotsContent.push('nofollow');
  if (robotsContent.length === 0) robotsContent.push('index', 'follow');

  return {
    title,
    description,
    canonical,
    ogImage,
    ogType,
    robots: robotsContent.join(', ')
  };
}

export function generateRobotsTxt(domain: string): string {
  return `User-agent: *
Allow: /

Sitemap: ${domain}/sitemap-index.xml
`;
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export function generateBreadcrumbSchema(items: BreadcrumbItem[], domain: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${domain}${item.url}`
    }))
  };
}
