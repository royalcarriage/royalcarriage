import { GoogleAuth } from 'google-auth-library';

const BASE = 'https://firebasehosting.googleapis.com/v1beta1';

export async function discoverHostingDomains(projectId: string) {
  if (!projectId) throw new Error('projectId required');

  const auth = new GoogleAuth({
    keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    scopes: ['https://www.googleapis.com/auth/cloud-platform'],
  });

  const client = await auth.getClient();

  // List sites under the project
  const sitesRes = await client.request({ url: `${BASE}/projects/${projectId}/sites` });
  const sites = (sitesRes.data && sitesRes.data.sites) || [];

  const domains: Array<{ domain: string; site: string; domainData?: any }> = [];

  for (const s of sites) {
    const siteName = s.name; // e.g. projects/projectId/sites/siteId
    try {
      const domRes = await client.request({ url: `${BASE}/${siteName}/domains` });
      const ds = (domRes.data && domRes.data.domains) || [];
      for (const d of ds) {
        domains.push({ domain: d.domain, site: siteName, domainData: d });
      }
    } catch (err) {
      // ignore per-site errors but continue
      console.warn('Failed to list domains for site', siteName, err);
    }
  }

  return { sites, domains };
}
