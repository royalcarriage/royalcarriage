import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AIOpsDashboard } from "@/components/admin/AIOpsDashboard";
import { 
  Brain, 
  FileText, 
  Image, 
  BarChart3, 
  Settings, 
  Upload,
  CheckCircle,
  AlertCircle,
  Clock,
  Zap
} from "lucide-react";
import { Link } from "wouter";

export default function AdminDashboard() {
  return (
    <Layout>
      <SEO
        title="Admin Dashboard | AI-Powered Website Management"
        description="AI-powered website management system for SEO optimization, content generation, and automated updates"
        noindex={true}
      />

      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              AI Website Management Dashboard
            </h1>
            <p className="text-lg text-gray-600">
              Automated SEO optimization, content generation, and website analytics
            </p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Pages Analyzed
                </CardTitle>
                <FileText className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-gray-500 mt-1">No pages analyzed yet</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  AI Suggestions
                </CardTitle>
                <Brain className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-gray-500 mt-1">Pending review</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Images Generated
                </CardTitle>
                <Image className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-gray-500 mt-1">AI-generated images</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Avg SEO Score
                </CardTitle>
                <BarChart3 className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">--</div>
                <p className="text-xs text-gray-500 mt-1">Across all pages</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Dashboard Tabs */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-7">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="pages">Pages</TabsTrigger>
              <TabsTrigger value="ai-tools">AI Tools</TabsTrigger>
              <TabsTrigger value="ai-ops">AI Ops</TabsTrigger>
              <TabsTrigger value="images">Images</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-yellow-500" />
                      Quick Actions
                    </CardTitle>
                    <CardDescription>
                      Common tasks and operations
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Link href="/admin/analyze">
                      <Button className="w-full justify-start" variant="outline">
                        <Brain className="mr-2 h-4 w-4" />
                        Analyze All Pages
                      </Button>
                    </Link>
                    <Link href="/admin/generate-content">
                      <Button className="w-full justify-start" variant="outline">
                        <FileText className="mr-2 h-4 w-4" />
                        Generate Content
                      </Button>
                    </Link>
                    <Link href="/admin/generate-images">
                      <Button className="w-full justify-start" variant="outline">
                        <Image className="mr-2 h-4 w-4" />
                        Generate Images
                      </Button>
                    </Link>
                    <Link href="/admin/review-changes">
                      <Button className="w-full justify-start" variant="outline">
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Review & Approve
                      </Button>
                    </Link>
                  </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-blue-500" />
                      Recent Activity
                    </CardTitle>
                    <CardDescription>
                      Latest AI operations and updates
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-gray-500 text-center py-8">
                      No recent activity
                    </div>
                  </CardContent>
                </Card>

                {/* System Status */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5 text-gray-500" />
                      System Status
                    </CardTitle>
                    <CardDescription>
                      AI services health check
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Page Analyzer</span>
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Content Generator</span>
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Image Generator</span>
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Analytics Integration</span>
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                    </div>
                  </CardContent>
                </Card>

                {/* Automation Schedule */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-purple-500" />
                      Automation Schedule
                    </CardTitle>
                    <CardDescription>
                      Scheduled AI tasks and jobs
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 text-sm">
                      <div>
                        <div className="font-medium">Daily Page Analysis</div>
                        <div className="text-gray-500">Runs daily at 2:00 AM</div>
                      </div>
                      <div>
                        <div className="font-medium">Weekly SEO Report</div>
                        <div className="text-gray-500">Runs every Monday at 9:00 AM</div>
                      </div>
                      <div>
                        <div className="font-medium">Content Optimization</div>
                        <div className="text-gray-500">Runs on demand</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Pages Tab */}
            <TabsContent value="pages">
              <Card>
                <CardHeader>
                  <CardTitle>Website Pages</CardTitle>
                  <CardDescription>
                    Manage and optimize your website pages
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12 text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="mb-4">No pages loaded yet</p>
                    <Button>Scan Website Pages</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* AI Tools Tab */}
            <TabsContent value="ai-tools">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="h-5 w-5" />
                      SEO Analyzer
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">
                      Analyze pages for SEO optimization opportunities
                    </p>
                    <Button className="w-full">Analyze Pages</Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Content Generator
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">
                      Generate optimized content for your pages
                    </p>
                    <Button className="w-full">Generate Content</Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Image className="h-5 w-5" />
                      Image Generator
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">
                      Create AI-generated images for your website
                    </p>
                    <Button className="w-full">Generate Images</Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* AI Ops Tab */}
            <TabsContent value="ai-ops">
              <AIOpsDashboard />
            </TabsContent>

            {/* Images Tab */}
            <TabsContent value="images">
              <Card>
                <CardHeader>
                  <CardTitle>AI-Generated Images</CardTitle>
                  <CardDescription>
                    Manage and deploy AI-generated images
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12 text-gray-500">
                    <Image className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="mb-4">No images generated yet</p>
                    <Button>Generate First Image</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics">
              <Card>
                <CardHeader>
                  <CardTitle>Website Analytics</CardTitle>
                  <CardDescription>
                    Google Analytics integration and insights
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12 text-gray-500">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="mb-4">Analytics integration not configured</p>
                    <Button>Configure Google Analytics</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle>AI System Settings</CardTitle>
                  <CardDescription>
                    Configure AI services and automation
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-3">API Configuration</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Google Cloud Project ID</span>
                        <span className="text-gray-500">Not configured</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Vertex AI Region</span>
                        <span className="text-gray-500">us-central1</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Automation Settings</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Auto-analyze new pages</span>
                        <span className="text-green-600">Enabled</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Auto-generate suggestions</span>
                        <span className="text-green-600">Enabled</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Require manual approval</span>
                        <span className="text-green-600">Enabled</span>
                      </div>
                    </div>
                  </div>

                  <Button className="w-full">Save Settings</Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}
