import { Layout } from '@/components/layout/Layout';
import { SEO } from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState } from 'react';

type DomainItem = {
  domain: string;
  name: string;
  purpose: string;
  title?: string;
  headers?: Record<string, string>;
};

export default function AIDomainsPage() {
  const [domains, setDomains] = useState<DomainItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [jsonText, setJsonText] = useState('');

  useEffect(() => {
    loadDomains();
  }, []);

  async function loadDomains() {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/domains');
      const data = await res.json();
      if (data?.domains) setDomains(data.domains);
    } catch (err) {
      console.error('Failed to load domains', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSyncFromJson() {
    try {
      const payload = JSON.parse(jsonText);
      const res = await fetch('/api/ai/domains/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data?.domains) setDomains(data.domains);
    } catch (err) {
      console.error('Sync failed', err);
      alert('Invalid JSON or sync failed');
    }
  }

  return (
    <Layout>
      <SEO title="AI Domains" description="Manage domain inventory for AI systems" noindex />

      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">AI Domain Inventory</h1>
            <p className="text-sm text-gray-600">View and sync domain metadata used by AI agents.</p>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Sync Domains (JSON)</CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                value={jsonText}
                onChange={(e) => setJsonText(e.target.value)}
                className="w-full h-40 border rounded p-2 mb-3"
                placeholder='{"domains":[{"domain":"example.com"}]}'
              />
              <div className="flex gap-2">
                <Button onClick={handleSyncFromJson}>Sync JSON</Button>
                <Button variant="ghost" onClick={loadDomains}>Reload</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Domains</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div>Loading…</div>
              ) : (
                <ul className="space-y-3">
                  {domains.map((d) => (
                    <li key={d.domain} className="border rounded p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{d.name}</div>
                          <div className="text-sm text-gray-600">{d.domain}</div>
                        </div>
                        <div className="text-sm text-gray-500">{d.purpose}</div>
                      </div>
                      {d.title && <div className="mt-2 text-sm">Suggested title: {d.title}</div>}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
