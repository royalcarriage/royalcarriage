import { Link } from "wouter";
import { useAuth, isAdmin } from "@/hooks/useAuth";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Brain,
  FileText,
  Image,
  Users,
  CheckCircle,
  Clock,
  Zap,
  TrendingUp,
  Activity,
  Settings
} from "lucide-react";

export default function AdminDashboard() {
  const { user } = useAuth();

  const stats = [
    { name: 'Pages Analyzed', value: '12', change: '+3', icon: FileText, color: 'text-blue-600' },
    { name: 'AI Suggestions', value: '24', change: '+8', icon: Brain, color: 'text-purple-600' },
    { name: 'Images Generated', value: '8', change: '+2', icon: Image, color: 'text-green-600' },
    { name: 'Avg SEO Score', value: '87', change: '+5', icon: TrendingUp, color: 'text-amber-600' },
  ];

  const recentActivity = [
    { action: 'Page analysis completed', page: 'O\'Hare Airport Limo', time: '2 hours ago', status: 'success' },
    { action: 'Content generated', page: 'Midway Airport Service', time: '4 hours ago', status: 'success' },
    { action: 'SEO recommendations', page: 'Downtown Chicago', time: '6 hours ago', status: 'pending' },
    { action: 'Image optimization', page: 'Fleet Gallery', time: '8 hours ago', status: 'success' },
  ];

  const systemStatus = [
    { service: 'Page Analyzer', status: 'operational', uptime: '99.9%' },
    { service: 'Content Generator', status: 'operational', uptime: '99.8%' },
    { service: 'Image Generator', status: 'degraded', uptime: '95.2%' },
    { service: 'Analytics Integration', status: 'operational', uptime: '99.7%' },
  ];

  return (
    <AdminLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.username}!
          </h1>
          <p className="text-gray-600">
            Here's what's happening with your limousine service website today
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.name}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    {stat.name}
                  </CardTitle>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="flex items-end justify-between">
                    <div className="text-3xl font-bold">{stat.value}</div>
                    <Badge variant="secondary" className="text-green-700 bg-green-50">
                      {stat.change}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">vs last week</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-amber-500" />
                Quick Actions
              </CardTitle>
              <CardDescription>
                Common tasks and operations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/admin/analyze">
                <Button className="w-full justify-start bg-blue-600 hover:bg-blue-700">
                  <Brain className="mr-2 h-4 w-4" />
                  Analyze All Pages
                </Button>
              </Link>
              {isAdmin(user) && (
                <Link href="/admin/users">
                  <Button className="w-full justify-start" variant="outline">
                    <Users className="mr-2 h-4 w-4" />
                    Manage Users
                  </Button>
                </Link>
              )}
              <Button className="w-full justify-start" variant="outline">
                <FileText className="mr-2 h-4 w-4" />
                Generate Content
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Image className="mr-2 h-4 w-4" />
                Generate Images
              </Button>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-500" />
                Recent Activity
              </CardTitle>
              <CardDescription>
                Latest AI operations and updates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className={`mt-1 ${
                      activity.status === 'success'
                        ? 'text-green-600'
                        : 'text-yellow-600'
                    }`}>
                      {activity.status === 'success'
                        ? <CheckCircle className="h-4 w-4" />
                        : <Clock className="h-4 w-4" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.action}
                      </p>
                      <p className="text-sm text-gray-600 truncate">
                        {activity.page}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-gray-500" />
              System Status
            </CardTitle>
            <CardDescription>
              AI services health and uptime
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {systemStatus.map((service) => (
                <div key={service.service} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      service.status === 'operational'
                        ? 'bg-green-500'
                        : 'bg-yellow-500'
                    }`} />
                    <div>
                      <p className="font-medium text-gray-900">{service.service}</p>
                      <p className="text-xs text-gray-500">
                        {service.status === 'operational' ? 'Operational' : 'Degraded Performance'}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {service.uptime} uptime
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Automation Schedule */}
        <Card className="mt-6">
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="font-semibold text-gray-900 mb-1">Daily Page Analysis</div>
                <div className="text-sm text-gray-600 mb-2">Runs daily at 2:00 AM PST</div>
                <Badge variant="secondary" className="text-xs">Active</Badge>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="font-semibold text-gray-900 mb-1">Weekly SEO Report</div>
                <div className="text-sm text-gray-600 mb-2">Runs every Monday at 9:00 AM</div>
                <Badge variant="secondary" className="text-xs">Active</Badge>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="font-semibold text-gray-900 mb-1">Content Optimization</div>
                <div className="text-sm text-gray-600 mb-2">Runs on demand</div>
                <Badge variant="outline" className="text-xs">Manual</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
