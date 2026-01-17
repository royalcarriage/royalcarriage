import { AdminLayout } from "@/components/layout/AdminLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Settings as SettingsIcon,
  Shield,
  Bell,
  Palette,
  Database,
  Key,
  Globe,
  Zap,
} from "lucide-react";

export default function Settings() {
  return (
    <AdminLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <SettingsIcon className="h-8 w-8 text-gray-600" />
            System Settings
          </h1>
          <p className="text-gray-600">
            Configure AI services, automation, and system preferences
          </p>
          <Badge variant="destructive" className="mt-2">
            Super Admin Only
          </Badge>
        </div>

        <div className="space-y-6">
          {/* AI Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-purple-600" />
                AI Services Configuration
              </CardTitle>
              <CardDescription>
                Configure Google Cloud AI and Vertex AI settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="project-id">Google Cloud Project ID</Label>
                  <Input
                    id="project-id"
                    placeholder="royalcarriagelimoseo"
                    defaultValue="royalcarriagelimoseo"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="region">Vertex AI Region</Label>
                  <Input
                    id="region"
                    placeholder="us-central1"
                    defaultValue="us-central1"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium">Enable AI Content Generation</p>
                  <p className="text-sm text-gray-500">
                    Automatically generate content suggestions
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium">Enable AI Image Generation</p>
                  <p className="text-sm text-gray-500">
                    Generate images using Imagen
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          {/* Automation Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-blue-600" />
                Automation & Scheduling
              </CardTitle>
              <CardDescription>
                Configure automated tasks and notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium">Daily Page Analysis</p>
                  <p className="text-sm text-gray-500">
                    Runs daily at 2:00 AM PST
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium">Weekly SEO Reports</p>
                  <p className="text-sm text-gray-500">
                    Runs every Monday at 9:00 AM
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium">Auto-analyze New Pages</p>
                  <p className="text-sm text-gray-500">
                    Analyze pages when they're created
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium">Require Manual Approval</p>
                  <p className="text-sm text-gray-500">
                    Review suggestions before deployment
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-red-600" />
                Security & Authentication
              </CardTitle>
              <CardDescription>
                Manage security settings and session configuration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="session-timeout">
                    Session Timeout (hours)
                  </Label>
                  <Input
                    id="session-timeout"
                    type="number"
                    placeholder="24"
                    defaultValue="24"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max-attempts">Max Login Attempts</Label>
                  <Input
                    id="max-attempts"
                    type="number"
                    placeholder="5"
                    defaultValue="5"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium">Two-Factor Authentication</p>
                  <p className="text-sm text-gray-500">
                    Require 2FA for all admin users
                  </p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium">IP Whitelisting</p>
                  <p className="text-sm text-gray-500">
                    Restrict admin access by IP address
                  </p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>

          {/* Database Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-green-600" />
                Database Configuration
              </CardTitle>
              <CardDescription>PostgreSQL and storage settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="database-url">Database URL</Label>
                <Input
                  id="database-url"
                  type="password"
                  placeholder="postgresql://..."
                  defaultValue="••••••••••••••••"
                />
                <p className="text-xs text-gray-500">
                  Currently using memory storage. Connect PostgreSQL for
                  persistent data.
                </p>
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium">Enable Connection Pooling</p>
                  <p className="text-sm text-gray-500">
                    Max 10 concurrent connections
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          {/* API Keys */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5 text-amber-600" />
                API Keys & Integrations
              </CardTitle>
              <CardDescription>
                Manage external service integrations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ga-id">Google Analytics ID</Label>
                <Input id="ga-id" placeholder="G-XXXXXXXXXX" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="firebase-key">Firebase API Key</Label>
                <Input
                  id="firebase-key"
                  type="password"
                  defaultValue="••••••••••••••••"
                />
              </div>
            </CardContent>
          </Card>

          {/* Website Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-blue-600" />
                Website Configuration
              </CardTitle>
              <CardDescription>
                General website settings and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="site-name">Site Name</Label>
                  <Input
                    id="site-name"
                    placeholder="Royal Carriage Limousine"
                    defaultValue="Royal Carriage Limousine"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="primary-domain">Primary Domain</Label>
                  <Input
                    id="primary-domain"
                    placeholder="chicagoairportblackcar.com"
                    defaultValue="chicagoairportblackcar.com"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium">Maintenance Mode</p>
                  <p className="text-sm text-gray-500">
                    Display maintenance page to visitors
                  </p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>

          {/* Theme Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-pink-600" />
                Theme & Branding
              </CardTitle>
              <CardDescription>
                Customize the admin interface appearance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Primary Color</Label>
                  <div className="w-full h-10 bg-amber-500 rounded border-2 border-gray-300"></div>
                </div>
                <div className="space-y-2">
                  <Label>Secondary Color</Label>
                  <div className="w-full h-10 bg-slate-900 rounded border-2 border-gray-300"></div>
                </div>
                <div className="space-y-2">
                  <Label>Success Color</Label>
                  <div className="w-full h-10 bg-green-600 rounded border-2 border-gray-300"></div>
                </div>
                <div className="space-y-2">
                  <Label>Danger Color</Label>
                  <div className="w-full h-10 bg-red-600 rounded border-2 border-gray-300"></div>
                </div>
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium">Dark Mode</p>
                  <p className="text-sm text-gray-500">
                    Enable dark theme for admin panel
                  </p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end gap-4">
            <Button variant="outline">Reset to Defaults</Button>
            <Button className="bg-green-600 hover:bg-green-700">
              Save All Settings
            </Button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
