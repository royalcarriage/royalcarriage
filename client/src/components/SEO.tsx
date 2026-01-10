import { Helmet } from "react-helmet-async";

interface SEOProps {
  title: string;
  description: string;
  path: string;
  type?: string;
}

const BASE_URL = "https://chicagoairportblackcar.com";

export function SEO({ title, description, path, type = "website" }: SEOProps) {
  const fullUrl = `${BASE_URL}${path}`;
  const fullTitle = `${title} | Chicago Airport Black Car`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={fullUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta name="robots" content="index, follow" />
    </Helmet>
  );
}
