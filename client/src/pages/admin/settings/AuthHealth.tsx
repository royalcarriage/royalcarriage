import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PrimaryButton } from '@/components/admin/buttons';
import { Shield, CheckCircle, AlertTriangle, XCircle, RefreshCw } from 'lucide-react';

interface AuthCheck {
  name: string;
  status: 'pass' | 'warning' | 'fail';
  details: string;
  action?: string;
}

export function AuthHealth() {
  const [loading, setLoading] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date>(new Date());

  // Mock auth health checks
  const [checks, setChecks] = useState<AuthCheck[]>([
    {
      name: 'Authorized Domains',
      status: 'pass',
      details: 'All domains properly configured: localhost, *.firebaseapp.com, custom domains',
      action: 'View in Firebase Console',
    },
    {
      name: 'OAuth Redirect URIs',
      status: 'pass',
      details: 'All redirect URIs validated and active',
    },
    {
      name: 'Login Flow',
      status: 'pass',
      details: 'Email/password and Google OAuth working correctly',
    },
    {
      name: 'User Roles',
      status: 'warning',
      details: '2 users without assigned roles detected',
      action: 'Assign Roles',
    },
    {
      name: 'Session Management',
      status: 'pass',
      details: 'Session timeout: 30 days, refresh tokens valid',
    },
    {
      name: 'Password Policy',
      status: 'pass',
      details: 'Minimum 8 characters, enforced complexity',
    },
  ]);

  const runHealthCheck = async () => {
    setLoading(true);
    // TODO: Implement actual Firebase Auth health checks
    await new Promise(resolve => setTimeout(resolve, 2000));
    setLastChecked(new Date());
    setLoading(false);
  };

  const passCount = checks.filter(c => c.status === 'pass').length;
  const warningCount = checks.filter(c => c.status === 'warning').length;
  const failCount = checks.filter(c => c.status === 'fail').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Authentication Health</h1>
          <p className="text-gray-600 mt-1">
            Firebase Authentication configuration and security status
          </p>
        </div>
        <PrimaryButton onClick={runHealthCheck} loading={loading}>
          <RefreshCw className="h-4 w-4" />
          Run Check
        </PrimaryButton>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Checks</CardDescription>
            <CardTitle className="text-3xl">{checks.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Passed</CardDescription>
            <CardTitle className="text-3xl text-green-600">{passCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Warnings</CardDescription>
            <CardTitle className="text-3xl text-yellow-600">{warningCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Failed</CardDescription>
            <CardTitle className="text-3xl text-red-600">{failCount}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Health Checks */}
      <Card>
        <CardHeader>
          <CardTitle>Authentication Checks</CardTitle>
          <CardDescription>
            Last checked: {lastChecked.toLocaleString()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {checks.map((check, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="mt-1">
                  {check.status === 'pass' && (
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  )}
                  {check.status === 'warning' && (
                    <AlertTriangle className="h-6 w-6 text-yellow-600" />
                  )}
                  {check.status === 'fail' && (
                    <XCircle className="h-6 w-6 text-red-600" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{check.name}</h3>
                    <Badge
                      variant={
                        check.status === 'pass'
                          ? 'default'
                          : check.status === 'warning'
                          ? 'secondary'
                          : 'destructive'
                      }
                    >
                      {check.status.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{check.details}</p>
                  {check.action && (
                    <button className="text-sm text-blue-600 hover:underline mt-2">
                      {check.action} →
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Security Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-1">✓</span>
              <span>Enable MFA for all admin users</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-1">✓</span>
              <span>Regularly review user permissions and roles</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-1">✓</span>
              <span>Monitor failed login attempts</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-600 mt-1">!</span>
              <span className="font-medium">Action needed: Assign roles to users without permissions</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
