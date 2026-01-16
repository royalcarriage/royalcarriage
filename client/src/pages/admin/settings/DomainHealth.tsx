import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PrimaryButton } from '@/components/admin/buttons';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Globe, CheckCircle2, XCircle, AlertTriangle, RefreshCw, ExternalLink } from 'lucide-react';

interface DomainCheck {
  domain: string;
  customDomain: string;
  redirectStatus: 'passing' | 'failing' | 'pending';
  canonicalStatus: 'passing' | 'failing' | 'pending';
  dnsStatus: 'active' | 'inactive' | 'pending';
  lastChecked: string;
}

// Mock data - replace with actual API call
const MOCK_DOMAINS: DomainCheck[] = [
  {
    domain: 'royalcarriagelimoseo.web.app',
    customDomain: 'royalcarriagelimo.com',
    redirectStatus: 'passing',
    canonicalStatus: 'passing',
    dnsStatus: 'active',
    lastChecked: '2024-01-17T14:30:00Z',
  },
  {
    domain: 'royalcarriagelimoseo-airport.web.app',
    customDomain: 'airport.royalcarriagelimo.com',
    redirectStatus: 'passing',
    canonicalStatus: 'failing',
    dnsStatus: 'active',
    lastChecked: '2024-01-17T14:25:00Z',
  },
  {
    domain: 'royalcarriagelimoseo-corporate.web.app',
    customDomain: 'corporate.royalcarriagelimo.com',
    redirectStatus: 'failing',
    canonicalStatus: 'passing',
    dnsStatus: 'active',
    lastChecked: '2024-01-17T14:20:00Z',
  },
];

const StatusBadge: React.FC<{ status: 'passing' | 'failing' | 'pending' | 'active' | 'inactive' }> = ({ status }) => {
  const variants = {
    passing: { variant: 'default' as const, color: 'bg-green-100 text-green-800 border-green-300', icon: CheckCircle2 },
    active: { variant: 'default' as const, color: 'bg-green-100 text-green-800 border-green-300', icon: CheckCircle2 },
    failing: { variant: 'destructive' as const, color: 'bg-red-100 text-red-800 border-red-300', icon: XCircle },
    inactive: { variant: 'destructive' as const, color: 'bg-red-100 text-red-800 border-red-300', icon: XCircle },
    pending: { variant: 'secondary' as const, color: 'bg-yellow-100 text-yellow-800 border-yellow-300', icon: AlertTriangle },
  };

  const config = variants[status];
  const Icon = config.icon;

  return (
    <Badge className={config.color}>
      <Icon className="h-3 w-3 mr-1" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};

export default function DomainHealth() {
  const [domains, setDomains] = useState<DomainCheck[]>(MOCK_DOMAINS);
  const [testing, setTesting] = useState<string | null>(null);

  const handleTestDomain = async (domain: string) => {
    setTesting(domain);
    // TODO: Implement actual domain testing logic
    setTimeout(() => {
      setTesting(null);
      // Mock update
      setDomains(domains.map(d =>
        d.domain === domain
          ? { ...d, lastChecked: new Date().toISOString() }
          : d
      ));
    }, 2000);
  };

  const handleTestAll = async () => {
    setTesting('all');
    // TODO: Implement test all logic
    setTimeout(() => {
      setTesting(null);
      setDomains(domains.map(d => ({
        ...d,
        lastChecked: new Date().toISOString()
      })));
    }, 3000);
  };

  const healthScore = useMemo(() => {
    const total = domains.length * 3; // 3 checks per domain
    const passing = domains.reduce((count, domain) => {
      return count +
        (domain.redirectStatus === 'passing' ? 1 : 0) +
        (domain.canonicalStatus === 'passing' ? 1 : 0) +
        (domain.dnsStatus === 'active' ? 1 : 0);
    }, 0);
    return Math.round((passing / total) * 100);
  }, [domains]);

  const failingChecks = useMemo(() => {
    return domains.reduce((count, domain) => {
      return count +
        (domain.redirectStatus === 'failing' ? 1 : 0) +
        (domain.canonicalStatus === 'failing' ? 1 : 0) +
        (domain.dnsStatus === 'inactive' ? 1 : 0);
    }, 0);
  }, [domains]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Globe className="h-8 w-8" />
            Domain Health
          </h1>
          <p className="text-muted-foreground mt-2">
            Monitor domain redirects, canonical tags, and DNS status
          </p>
        </div>
        <PrimaryButton onClick={handleTestAll} loading={testing === 'all'}>
          <RefreshCw className="h-4 w-4" />
          Test All Domains
        </PrimaryButton>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Health Score</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{healthScore}%</div>
            <p className="text-xs text-muted-foreground">
              Overall domain health
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Domains</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{domains.length}</div>
            <p className="text-xs text-muted-foreground">
              Configured domains
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failing Checks</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{failingChecks}</div>
            <p className="text-xs text-muted-foreground">
              Requires attention
            </p>
          </CardContent>
        </Card>
      </div>

      {failingChecks > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {failingChecks} domain check{failingChecks > 1 ? 's' : ''} failing. Please review and fix issues below.
          </AlertDescription>
        </Alert>
      )}

      {/* Domain Status Table */}
      <Card>
        <CardHeader>
          <CardTitle>Domain Status</CardTitle>
          <CardDescription>
            Monitor redirect, canonical, and DNS status for all domains
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Firebase Domain</TableHead>
                <TableHead>Custom Domain</TableHead>
                <TableHead>Redirect Status</TableHead>
                <TableHead>Canonical Tags</TableHead>
                <TableHead>DNS Status</TableHead>
                <TableHead>Last Checked</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {domains.map((domain) => (
                <TableRow key={domain.domain}>
                  <TableCell>
                    <code className="text-sm bg-muted px-2 py-1 rounded">
                      {domain.domain}
                    </code>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <code className="text-sm bg-muted px-2 py-1 rounded">
                        {domain.customDomain}
                      </code>
                      <a
                        href={`https://${domain.customDomain}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={domain.redirectStatus} />
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={domain.canonicalStatus} />
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={domain.dnsStatus} />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(domain.lastChecked).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTestDomain(domain.domain)}
                      disabled={testing === domain.domain}
                    >
                      {testing === domain.domain ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <RefreshCw className="h-4 w-4" />
                          Test
                        </>
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Help Section */}
      <Card>
        <CardHeader>
          <CardTitle>Understanding Domain Checks</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <h4 className="font-semibold mb-1">Redirect Status</h4>
            <p className="text-sm text-muted-foreground">
              Verifies that .web.app domains correctly redirect to custom domains
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-1">Canonical Tags</h4>
            <p className="text-sm text-muted-foreground">
              Ensures canonical meta tags point to the correct custom domain URLs
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-1">DNS Status</h4>
            <p className="text-sm text-muted-foreground">
              Checks that DNS records are properly configured and active
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
