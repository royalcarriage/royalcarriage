import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertCircle,
  AlertTriangle,
  XCircle,
  Image,
  Link as LinkIcon,
  FileText,
  Search,
  Zap,
  ExternalLink,
} from "lucide-react";

interface SEOIssue {
  id: string;
  type: 'error' | 'warning';
  category: string;
  message: string;
  page: string;
  count?: number;
}

interface CrawlIssue {
  type: string;
  description: string;
  count: number;
  severity: 'critical' | 'high' | 'medium';
  items: { page?: string; url?: string; from?: string; to?: string }[];
}

export default function AuditPanel() {
  const [seoErrors] = useState<SEOIssue[]>([
    {
      id: '1',
      type: 'error',
      category: 'Content Quality',
      message: 'Content below minimum word count (1500 words)',
      page: 'topic-003-chicago-wedding-limo.json',
    },
    {
      id: '2',
      type: 'error',
      category: 'Local Value',
      message: 'No Chicago/local area mentions found',
      page: 'topic-005-corporate-transportation.json',
    },
    {
      id: '3',
      type: 'warning',
      category: 'Images',
      message: 'Only 2 images specified (minimum 3 required)',
      page: 'topic-007-airport-shuttle.json',
    },
    {
      id: '4',
      type: 'error',
      category: 'Schema',
      message: 'Missing FAQ section (required)',
      page: 'topic-009-party-bus-rental.json',
    },
    {
      id: '5',
      type: 'warning',
      category: 'CTA',
      message: 'Only one CTA found (recommend 2+ for better conversion)',
      page: 'topic-011-limousine-service.json',
    },
  ]);

  const [indexingIssues] = useState([
    {
      type: 'Deindexed Pages',
      count: 3,
      severity: 'critical' as const,
      description: '3 pages removed from Google index',
      items: [
        { page: '/old-pricing-page' },
        { page: '/outdated-fleet-info' },
        { page: '/deprecated-contact' },
      ]
    },
    {
      type: 'Impression Drops',
      count: 5,
      severity: 'high' as const,
      description: '5 pages with significant impression drops (>50%)',
      items: [
        { page: '/chicago-airport-limo' },
        { page: '/corporate-transportation' },
      ]
    },
    {
      type: 'Cannibalization',
      count: 8,
      severity: 'medium' as const,
      description: '8 keywords with multiple ranking pages',
      items: [
        { page: 'chicago limo: /limo, /chicago-limo, /limo-service' },
      ]
    },
  ]);

  const [crawlIssues] = useState<CrawlIssue[]>([
    {
      type: 'Broken Links',
      count: 12,
      severity: 'critical',
      description: '12 broken internal links detected',
      items: [
        { from: '/pricing', to: '/old-fleet-page' },
        { from: '/about', to: '/team-member-404' },
        { from: '/services', to: '/deleted-service' },
      ]
    },
    {
      type: 'Missing H1',
      count: 7,
      severity: 'high',
      description: '7 pages missing H1 tags',
      items: [
        { page: '/contact' },
        { page: '/testimonials' },
        { page: '/careers' },
      ]
    },
    {
      type: 'Duplicate Titles',
      count: 5,
      severity: 'medium',
      description: '5 duplicate title tags',
      items: [
        { page: 'Multiple pages: "Chicago Limo Service"' },
      ]
    },
    {
      type: 'Orphan Pages',
      count: 3,
      severity: 'medium',
      description: '3 pages with no inbound links',
      items: [
        { page: '/hidden-promo-page' },
        { page: '/test-landing-page' },
      ]
    },
  ]);

  const [imageIssues] = useState([
    {
      type: 'Missing Images',
      count: 8,
      severity: 'critical' as const,
      description: '8 missing images (404s)',
      items: [
        { page: '/fleet', url: '/images/sedan-luxury.jpg' },
        { page: '/services', url: '/images/corporate-hero.jpg' },
      ]
    },
    {
      type: 'Overused Images',
      count: 3,
      severity: 'medium' as const,
      description: '3 images used on 5+ pages',
      items: [
        { page: 'generic-car.jpg used on 8 pages' },
      ]
    },
    {
      type: 'Missing Alt Text',
      count: 15,
      severity: 'high' as const,
      description: '15 images without alt text',
      items: [
        { page: '/home', url: '/images/hero-banner.jpg' },
      ]
    },
  ]);

  const [performanceIssues] = useState([
    {
      type: 'Performance Score',
      count: 2,
      severity: 'critical' as const,
      description: '2 pages below performance threshold (< 70)',
      items: [
        { page: '/home: 65' },
        { page: '/fleet: 68' },
      ]
    },
    {
      type: 'LCP Issues',
      count: 3,
      severity: 'high' as const,
      description: '3 pages with slow Largest Contentful Paint (> 2.5s)',
      items: [
        { page: '/home: 3.2s' },
        { page: '/pricing: 2.8s' },
      ]
    },
  ]);

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Critical</Badge>;
      case 'high':
        return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">High</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Medium</Badge>;
      default:
        return <Badge variant="outline">Low</Badge>;
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'high':
        return <AlertCircle className="h-5 w-5 text-orange-600" />;
      case 'medium':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-600" />;
    }
  };

  const totalIssues = 
    seoErrors.length + 
    indexingIssues.reduce((sum, i) => sum + i.count, 0) +
    crawlIssues.reduce((sum, i) => sum + i.count, 0) +
    imageIssues.reduce((sum, i) => sum + i.count, 0) +
    performanceIssues.reduce((sum, i) => sum + i.count, 0);

  return (
    <AdminLayout>
      <SEO
        title="Audit Panel | Admin Dashboard"
        description="Review SEO errors, indexing issues, and performance problems"
        noindex={true}
      />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Audit Panel</h1>
            <p className="text-muted-foreground">
              Review and fix SEO, indexing, and performance issues
            </p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Issues
              </CardTitle>
              <AlertCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalIssues}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Across all systems
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                SEO Errors
              </CardTitle>
              <FileText className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{seoErrors.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Gate failures
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Indexing Issues
              </CardTitle>
              <Search className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {indexingIssues.reduce((sum, i) => sum + i.count, 0)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                From GSC
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Broken Links
              </CardTitle>
              <LinkIcon className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {crawlIssues.find(i => i.type === 'Broken Links')?.count || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                From crawler
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Missing Images
              </CardTitle>
              <Image className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {imageIssues.find(i => i.type === 'Missing Images')?.count || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                404 errors
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Issues Tabs */}
        <Tabs defaultValue="seo" className="space-y-6">
          <TabsList>
            <TabsTrigger value="seo">SEO Errors ({seoErrors.length})</TabsTrigger>
            <TabsTrigger value="indexing">
              Indexing ({indexingIssues.reduce((sum, i) => sum + i.count, 0)})
            </TabsTrigger>
            <TabsTrigger value="crawl">
              Crawl ({crawlIssues.reduce((sum, i) => sum + i.count, 0)})
            </TabsTrigger>
            <TabsTrigger value="images">
              Images ({imageIssues.reduce((sum, i) => sum + i.count, 0)})
            </TabsTrigger>
            <TabsTrigger value="performance">
              Performance ({performanceIssues.reduce((sum, i) => sum + i.count, 0)})
            </TabsTrigger>
          </TabsList>

          {/* SEO Errors Tab */}
          <TabsContent value="seo">
            <Card>
              <CardHeader>
                <CardTitle>SEO Gate Failures</CardTitle>
                <CardDescription>
                  Content that failed quality checks and cannot be published
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead>Page</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {seoErrors.map((error) => (
                      <TableRow key={error.id}>
                        <TableCell>
                          {error.type === 'error' ? (
                            <XCircle className="h-5 w-5 text-red-600" />
                          ) : (
                            <AlertTriangle className="h-5 w-5 text-yellow-600" />
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">{error.category}</span>
                        </TableCell>
                        <TableCell>{error.message}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {error.page}
                        </TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">
                            <ExternalLink className="h-3 w-3 mr-1" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Indexing Issues Tab */}
          <TabsContent value="indexing">
            <div className="space-y-4">
              {indexingIssues.map((issue, idx) => (
                <Card key={idx}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        {getSeverityIcon(issue.severity)}
                        <div>
                          <CardTitle className="text-lg">{issue.type}</CardTitle>
                          <CardDescription className="mt-1">
                            {issue.description}
                          </CardDescription>
                        </div>
                      </div>
                      {getSeverityBadge(issue.severity)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {issue.items.slice(0, 3).map((item, i) => (
                        <div key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                          <span>•</span>
                          <span>{item.page}</span>
                        </div>
                      ))}
                      {issue.items.length > 3 && (
                        <p className="text-sm text-muted-foreground">
                          ... and {issue.items.length - 3} more
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Crawl Issues Tab */}
          <TabsContent value="crawl">
            <div className="space-y-4">
              {crawlIssues.map((issue, idx) => (
                <Card key={idx}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        {getSeverityIcon(issue.severity)}
                        <div>
                          <CardTitle className="text-lg">{issue.type}</CardTitle>
                          <CardDescription className="mt-1">
                            {issue.description}
                          </CardDescription>
                        </div>
                      </div>
                      {getSeverityBadge(issue.severity)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {issue.items.slice(0, 3).map((item, i) => (
                        <div key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                          <span>•</span>
                          {item.from && item.to ? (
                            <span>{item.from} → {item.to}</span>
                          ) : (
                            <span>{item.page}</span>
                          )}
                        </div>
                      ))}
                      {issue.items.length > 3 && (
                        <p className="text-sm text-muted-foreground">
                          ... and {issue.items.length - 3} more
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Image Issues Tab */}
          <TabsContent value="images">
            <div className="space-y-4">
              {imageIssues.map((issue, idx) => (
                <Card key={idx}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        {getSeverityIcon(issue.severity)}
                        <div>
                          <CardTitle className="text-lg">{issue.type}</CardTitle>
                          <CardDescription className="mt-1">
                            {issue.description}
                          </CardDescription>
                        </div>
                      </div>
                      {getSeverityBadge(issue.severity)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {issue.items.slice(0, 3).map((item, i) => (
                        <div key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                          <span>•</span>
                          {item.page && item.url ? (
                            <span>{item.page}: {item.url}</span>
                          ) : (
                            <span>{item.page}</span>
                          )}
                        </div>
                      ))}
                      {issue.items.length > 3 && (
                        <p className="text-sm text-muted-foreground">
                          ... and {issue.items.length - 3} more
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Performance Issues Tab */}
          <TabsContent value="performance">
            <div className="space-y-4">
              {performanceIssues.map((issue, idx) => (
                <Card key={idx}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        {getSeverityIcon(issue.severity)}
                        <div>
                          <CardTitle className="text-lg">{issue.type}</CardTitle>
                          <CardDescription className="mt-1">
                            {issue.description}
                          </CardDescription>
                        </div>
                      </div>
                      {getSeverityBadge(issue.severity)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {issue.items.slice(0, 3).map((item, i) => (
                        <div key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                          <span>•</span>
                          <span>{item.page}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
