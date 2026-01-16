import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { PrimaryButton, DangerButton } from '@/components/admin/buttons';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/lib/firebase';
import {
  Rocket,
  Shield,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  GitBranch,
} from 'lucide-react';

interface DeployInfo {
  lastDeployDate: string;
  lastDeployedBy: string;
  lastDeployBranch: string;
  lastDeployStatus: 'success' | 'failed' | 'pending';
  seoGateStatus: 'PASS' | 'FAIL' | 'PENDING';
  gateFailureCount: number;
  failedGates: string[];
}

// Mock data - replace with actual API call
const MOCK_DEPLOY_INFO: DeployInfo = {
  lastDeployDate: '2024-01-17T12:00:00Z',
  lastDeployedBy: 'admin@royalcarriagelimo.com',
  lastDeployBranch: 'main',
  lastDeployStatus: 'success',
  seoGateStatus: 'FAIL',
  gateFailureCount: 3,
  failedGates: [
    'Meta Description Length Check',
    'Internal Links Validation',
    'Image Alt Text Missing',
  ],
};

export default function DeployGuardrails() {
  const { userData } = useAuth();
  const [deployInfo, setDeployInfo] = useState<DeployInfo>(MOCK_DEPLOY_INFO);
  const [isDeploying, setIsDeploying] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const isAdminPlus = userData?.role === UserRole.SUPER_ADMIN || userData?.role === UserRole.ADMIN;
  const canDeploy = isAdminPlus && deployInfo.seoGateStatus !== 'FAIL';

  const handleDeploy = async () => {
    setIsDeploying(true);
    // TODO: Implement actual deploy logic
    setTimeout(() => {
      setIsDeploying(false);
      setShowConfirmDialog(false);
      setDeployInfo({
        ...deployInfo,
        lastDeployDate: new Date().toISOString(),
        lastDeployedBy: userData?.email || '',
        lastDeployStatus: 'success',
      });
    }, 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Rocket className="h-8 w-8" />
            Deploy Guardrails
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage deployments with automated quality gates
          </p>
        </div>
      </div>

      {!isAdminPlus && (
        <Alert variant="destructive">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Admin+ role required to deploy. You have read-only access.
          </AlertDescription>
        </Alert>
      )}

      {/* Deploy Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Deployment Status
          </CardTitle>
          <CardDescription>
            Current deployment gate status and requirements
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <GitBranch className="h-4 w-4" />
                SEO Gate Status
              </div>
              <div>
                {deployInfo.seoGateStatus === 'PASS' && (
                  <Badge className="bg-green-100 text-green-800 border-green-300">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    PASS
                  </Badge>
                )}
                {deployInfo.seoGateStatus === 'FAIL' && (
                  <Badge className="bg-red-100 text-red-800 border-red-300">
                    <XCircle className="h-3 w-3 mr-1" />
                    FAIL
                  </Badge>
                )}
                {deployInfo.seoGateStatus === 'PENDING' && (
                  <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
                    <Clock className="h-3 w-3 mr-1" />
                    PENDING
                  </Badge>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <AlertTriangle className="h-4 w-4" />
                Gate Failures
              </div>
              <div className="text-2xl font-bold text-red-600">
                {deployInfo.gateFailureCount}
              </div>
            </div>
          </div>

          {deployInfo.seoGateStatus === 'FAIL' && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="font-semibold mb-2">
                  Deployment blocked due to failed SEO gates:
                </div>
                <ul className="list-disc list-inside space-y-1">
                  {deployInfo.failedGates.map((gate, index) => (
                    <li key={index} className="text-sm">{gate}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Last Deploy Info */}
      <Card>
        <CardHeader>
          <CardTitle>Last Deployment</CardTitle>
          <CardDescription>
            Information about the most recent deployment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                Deploy Time
              </div>
              <div className="text-sm font-medium">
                {new Date(deployInfo.lastDeployDate).toLocaleString()}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                Deployed By
              </div>
              <div className="text-sm font-medium">
                {deployInfo.lastDeployedBy}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <GitBranch className="h-4 w-4" />
                Branch
              </div>
              <div className="text-sm font-medium">
                <code className="bg-muted px-2 py-1 rounded">
                  {deployInfo.lastDeployBranch}
                </code>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                Status
              </div>
              <div>
                {deployInfo.lastDeployStatus === 'success' && (
                  <Badge className="bg-green-100 text-green-800 border-green-300">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Success
                  </Badge>
                )}
                {deployInfo.lastDeployStatus === 'failed' && (
                  <Badge className="bg-red-100 text-red-800 border-red-300">
                    <XCircle className="h-3 w-3 mr-1" />
                    Failed
                  </Badge>
                )}
                {deployInfo.lastDeployStatus === 'pending' && (
                  <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
                    <Clock className="h-3 w-3 mr-1" />
                    Pending
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Deploy Action */}
      <Card>
        <CardHeader>
          <CardTitle>Deploy to Production</CardTitle>
          <CardDescription>
            Trigger a new deployment to production environment
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {canDeploy ? (
            <>
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>
                  All deployment gates are passing. You may proceed with deployment.
                </AlertDescription>
              </Alert>

              <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                <AlertDialogTrigger asChild>
                  <DangerButton disabled={isDeploying}>
                    <Rocket className="h-4 w-4" />
                    Deploy All Sites to Production
                  </DangerButton>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirm Deployment</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will deploy all changes to production. This action cannot be undone.
                      <br /><br />
                      <strong>Deployment will affect:</strong>
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>Main website</li>
                        <li>All microsite variants</li>
                        <li>API endpoints</li>
                      </ul>
                      <br />
                      Are you sure you want to proceed?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeploying}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeploy}
                      disabled={isDeploying}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      {isDeploying ? 'Deploying...' : 'Deploy Now'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          ) : (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                {!isAdminPlus
                  ? 'You do not have permission to deploy. Admin+ role required.'
                  : 'Deployment is blocked. Fix all SEO gate failures before deploying.'}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Guardrails Info */}
      <Card>
        <CardHeader>
          <CardTitle>About Deploy Guardrails</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <h4 className="font-semibold mb-1">Automated Quality Gates</h4>
            <p className="text-sm text-muted-foreground">
              All deployments must pass SEO quality gates to ensure content meets standards
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-1">Role Requirements</h4>
            <p className="text-sm text-muted-foreground">
              Only Admin and SuperAdmin roles can trigger production deployments
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-1">Deployment Scope</h4>
            <p className="text-sm text-muted-foreground">
              "Deploy All" triggers deployment for all sites and microsites simultaneously
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
