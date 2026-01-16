import { AdminLayout } from "@/components/admin/AdminLayout";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Rocket, Shield, Clock } from "lucide-react";

export default function PublishPage() {
  return (
    <>
      <SEO
        title="SEO Bot Publish | Royal Carriage Admin"
        description="Publish SEO content to production"
        noindex={true}
      />
      <AdminLayout
        title="SEO Bot Publish"
        subtitle="Publish approved content to production sites"
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "SEO Bot", href: "/admin/seo-bot" },
          { label: "Publish" },
        ]}
      >
        {/* SuperAdmin Warning */}
        <Alert variant="destructive" className="mb-6">
          <Shield className="h-4 w-4" />
          <AlertTitle>SuperAdmin Only</AlertTitle>
          <AlertDescription>
            This action requires SuperAdmin privileges. Publishing content will make it live on production sites.
            Ensure all content has been reviewed and approved before publishing.
          </AlertDescription>
        </Alert>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Publish Controls */}
          <Card>
            <CardHeader>
              <CardTitle>Publish Batch</CardTitle>
              <CardDescription>Publish approved content to production</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="limit">Publish Limit</Label>
                <Input
                  id="limit"
                  type="number"
                  placeholder="Number of articles to publish"
                  defaultValue="10"
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Maximum number of articles to publish in this batch
                </p>
              </div>

              <div className="pt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Articles Ready</span>
                  <Badge variant="secondary">24</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Average Quality Score</span>
                  <span className="text-sm font-semibold text-green-600">92%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Last Publish</span>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    2 days ago
                  </div>
                </div>
              </div>

              <Button className="w-full mt-6" size="lg">
                <Rocket className="h-4 w-4 mr-2" />
                Publish to Production
              </Button>
            </CardContent>
          </Card>

          {/* Publishing Guidelines */}
          <Card>
            <CardHeader>
              <CardTitle>Publishing Guidelines</CardTitle>
              <CardDescription>Important considerations before publishing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-semibold text-primary">1</span>
                </div>
                <div>
                  <p className="text-sm font-medium">Review Content Quality</p>
                  <p className="text-xs text-muted-foreground">
                    Ensure all articles meet quality standards (90%+)
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-semibold text-primary">2</span>
                </div>
                <div>
                  <p className="text-sm font-medium">Check SEO Optimization</p>
                  <p className="text-xs text-muted-foreground">
                    Verify meta tags, keywords, and structure
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-semibold text-primary">3</span>
                </div>
                <div>
                  <p className="text-sm font-medium">Validate Links</p>
                  <p className="text-xs text-muted-foreground">
                    Ensure all internal and external links are functional
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-semibold text-primary">4</span>
                </div>
                <div>
                  <p className="text-sm font-medium">Backup Before Publish</p>
                  <p className="text-xs text-muted-foreground">
                    System automatically creates backup before publishing
                  </p>
                </div>
              </div>

              <Alert className="mt-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  Published content will be immediately visible on live sites
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    </>
  );
}
