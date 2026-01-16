import { AdminLayout } from "@/components/admin/AdminLayout";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Rocket, GitBranch, CheckCircle, Clock, AlertTriangle } from "lucide-react";

export default function DeployPage() {
  return (
    <>
      <SEO
        title="Deploy | Royal Carriage Admin"
        description="Deploy to production"
        noindex={true}
      />
      <AdminLayout
        title="Deploy"
        subtitle="Deploy changes to production environment"
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Deploy" },
        ]}
      >
        <Alert className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Production Deployment</AlertTitle>
          <AlertDescription>
            Deploying to production will make changes immediately visible to all users.
            Ensure all changes have been tested and approved.
          </AlertDescription>
        </Alert>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Deploy Controls */}
          <Card>
            <CardHeader>
              <CardTitle>Deploy Controls</CardTitle>
              <CardDescription>Configure and execute production deployment</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="branch">Branch</Label>
                <Select defaultValue="main">
                  <SelectTrigger id="branch" className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="main">main</SelectItem>
                    <SelectItem value="staging">staging</SelectItem>
                    <SelectItem value="develop">develop</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="target">Target Environment</Label>
                <Select defaultValue="production">
                  <SelectTrigger id="target" className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="production">Production</SelectItem>
                    <SelectItem value="staging">Staging</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Last Deploy</span>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    2 days ago
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Deploy Status</span>
                  <Badge variant="default" className="bg-green-500/10 text-green-500">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Healthy
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Current Version</span>
                  <span className="text-sm font-mono">v2.4.1</span>
                </div>
              </div>

              <Button className="w-full mt-6" size="lg">
                <Rocket className="h-4 w-4 mr-2" />
                Deploy to Production
              </Button>
            </CardContent>
          </Card>

          {/* Deployment Status */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Deployments</CardTitle>
              <CardDescription>History of recent production deployments</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { version: "v2.4.1", date: "2024-01-13 10:30 AM", status: "success", duration: "3m 45s" },
                { version: "v2.4.0", date: "2024-01-11 02:15 PM", status: "success", duration: "4m 12s" },
                { version: "v2.3.9", date: "2024-01-09 09:20 AM", status: "success", duration: "3m 58s" },
              ].map((deploy, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-500/10">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium font-mono">{deploy.version}</p>
                      <p className="text-xs text-muted-foreground">{deploy.date}</p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">{deploy.duration}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Pre-deployment Checklist */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Pre-deployment Checklist</CardTitle>
            <CardDescription>Ensure these items are complete before deploying</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "All tests passing", status: true },
                { label: "Code review approved", status: true },
                { label: "Database migrations ready", status: true },
                { label: "Backup created", status: true },
                { label: "Release notes updated", status: false },
                { label: "Monitoring configured", status: true },
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className={`h-5 w-5 rounded-full flex items-center justify-center ${item.status ? 'bg-green-500/10' : 'bg-gray-500/10'}`}>
                    <CheckCircle className={`h-3 w-3 ${item.status ? 'text-green-500' : 'text-gray-400'}`} />
                  </div>
                  <span className="text-sm">{item.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </AdminLayout>
    </>
  );
}
