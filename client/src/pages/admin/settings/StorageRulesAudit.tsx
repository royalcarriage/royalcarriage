import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Shield,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  Lock,
  RefreshCw,
} from "lucide-react";

interface StorageRule {
  path: string;
  read: string;
  write: string;
  description: string;
  expected: {
    read: string;
    write: string;
  };
  isCorrect: boolean;
}

interface AuditResult {
  status: "pass" | "fail" | "warning";
  timestamp: string;
  rulesChecked: number;
  passed: number;
  failed: number;
  warnings: number;
  issues: string[];
}

// Mock storage.rules content
const MOCK_RULES = `rules_version = '2';

service firebase.storage {
  match /b/{bucket}/o {
    // Public read for all images
    match /images/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && 
                     request.auth.token.role in ['Admin', 'SuperAdmin'];
    }
    
    // Public read for vehicle images
    match /vehicles/{vehicleId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && 
                     request.auth.token.role in ['Admin', 'SuperAdmin'];
    }
    
    // Public read for city/service images
    match /cities/{cityId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && 
                     request.auth.token.role in ['Admin', 'SuperAdmin'];
    }
    
    match /services/{serviceId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && 
                     request.auth.token.role in ['Admin', 'SuperAdmin'];
    }
    
    // Import files - admin only read/write
    match /imports/{importType}/{fileName} {
      allow read: if request.auth != null && 
                    request.auth.token.role in ['Admin', 'SuperAdmin'];
      allow write: if request.auth != null && 
                     request.auth.token.role in ['Admin', 'SuperAdmin'];
    }
    
    // Backup files - admin only
    match /backups/{allPaths=**} {
      allow read: if request.auth != null && 
                    request.auth.token.role in ['SuperAdmin'];
      allow write: if request.auth != null && 
                     request.auth.token.role in ['SuperAdmin'];
    }
    
    // Default deny all
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}`;

const parseStorageRules = (): StorageRule[] => {
  return [
    {
      path: "/images/**",
      read: "if true",
      write: "if request.auth != null && request.auth.token.role in ['Admin', 'SuperAdmin']",
      description: "Public images - anyone can read, only admins can write",
      expected: {
        read: "if true",
        write: "if request.auth != null && request.auth.token.role in ['Admin', 'SuperAdmin']",
      },
      isCorrect: true,
    },
    {
      path: "/vehicles/{vehicleId}/**",
      read: "if true",
      write: "if request.auth != null && request.auth.token.role in ['Admin', 'SuperAdmin']",
      description: "Vehicle images - public read, admin write",
      expected: {
        read: "if true",
        write: "if request.auth != null && request.auth.token.role in ['Admin', 'SuperAdmin']",
      },
      isCorrect: true,
    },
    {
      path: "/cities/{cityId}/**",
      read: "if true",
      write: "if request.auth != null && request.auth.token.role in ['Admin', 'SuperAdmin']",
      description: "City images - public read, admin write",
      expected: {
        read: "if true",
        write: "if request.auth != null && request.auth.token.role in ['Admin', 'SuperAdmin']",
      },
      isCorrect: true,
    },
    {
      path: "/services/{serviceId}/**",
      read: "if true",
      write: "if request.auth != null && request.auth.token.role in ['Admin', 'SuperAdmin']",
      description: "Service images - public read, admin write",
      expected: {
        read: "if true",
        write: "if request.auth != null && request.auth.token.role in ['Admin', 'SuperAdmin']",
      },
      isCorrect: true,
    },
    {
      path: "/imports/{importType}/{fileName}",
      read: "if request.auth != null && request.auth.token.role in ['Admin', 'SuperAdmin']",
      write: "if request.auth != null && request.auth.token.role in ['Admin', 'SuperAdmin']",
      description: "Import files - admin only read and write",
      expected: {
        read: "if request.auth != null && request.auth.token.role in ['Admin', 'SuperAdmin']",
        write: "if request.auth != null && request.auth.token.role in ['Admin', 'SuperAdmin']",
      },
      isCorrect: true,
    },
    {
      path: "/backups/**",
      read: "if request.auth != null && request.auth.token.role in ['SuperAdmin']",
      write: "if request.auth != null && request.auth.token.role in ['SuperAdmin']",
      description: "Backups - super admin only",
      expected: {
        read: "if request.auth != null && request.auth.token.role in ['SuperAdmin']",
        write: "if request.auth != null && request.auth.token.role in ['SuperAdmin']",
      },
      isCorrect: true,
    },
  ];
};

const generateAuditResult = (rules: StorageRule[]): AuditResult => {
  const passed = rules.filter((r) => r.isCorrect).length;
  const failed = rules.filter((r) => !r.isCorrect).length;

  return {
    status: failed === 0 ? "pass" : "fail",
    timestamp: new Date().toISOString(),
    rulesChecked: rules.length,
    passed,
    failed,
    warnings: 0,
    issues: failed > 0 ? ["Some rules do not match expected configuration"] : [],
  };
};

export default function StorageRulesAudit() {
  const [rules, setRules] = useState<StorageRule[]>([]);
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadRules();
  }, []);

  const loadRules = () => {
    setIsLoading(true);
    // Simulate loading
    setTimeout(() => {
      const parsedRules = parseStorageRules();
      setRules(parsedRules);
      setAuditResult(generateAuditResult(parsedRules));
      setIsLoading(false);
    }, 500);
  };

  const runAudit = () => {
    setIsLoading(true);
    // TODO: Fetch actual storage.rules from Firebase and validate
    console.log("Running storage rules audit...");
    
    setTimeout(() => {
      const parsedRules = parseStorageRules();
      setRules(parsedRules);
      setAuditResult(generateAuditResult(parsedRules));
      setIsLoading(false);
    }, 1000);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pass":
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case "fail":
        return <XCircle className="w-6 h-6 text-red-500" />;
      case "warning":
        return <AlertTriangle className="w-6 h-6 text-yellow-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Storage Rules Audit</h1>
          <p className="text-gray-600 mt-1">
            Verify Firebase Storage security rules configuration
          </p>
        </div>
        <Button onClick={runAudit} disabled={isLoading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          Run Audit
        </Button>
      </div>

      {/* Audit Status */}
      {auditResult && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getStatusIcon(auditResult.status)}
                <div>
                  <CardTitle>
                    Audit {auditResult.status === "pass" ? "Passed" : "Failed"}
                  </CardTitle>
                  <CardDescription>
                    Last run: {new Date(auditResult.timestamp).toLocaleString()}
                  </CardDescription>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-6 text-center">
                <div>
                  <p className="text-3xl font-bold text-green-600">
                    {auditResult.passed}
                  </p>
                  <p className="text-sm text-gray-600">Passed</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-red-600">
                    {auditResult.failed}
                  </p>
                  <p className="text-sm text-gray-600">Failed</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-yellow-600">
                    {auditResult.warnings}
                  </p>
                  <p className="text-sm text-gray-600">Warnings</p>
                </div>
              </div>
            </div>
          </CardHeader>
          {auditResult.issues.length > 0 && (
            <CardContent>
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <ul className="list-disc list-inside">
                    {auditResult.issues.map((issue, idx) => (
                      <li key={idx}>{issue}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            </CardContent>
          )}
        </Card>
      )}

      {/* Rules Overview */}
      <Tabs defaultValue="rules" className="space-y-4">
        <TabsList>
          <TabsTrigger value="rules">Rules Breakdown</TabsTrigger>
          <TabsTrigger value="raw">Raw Rules File</TabsTrigger>
        </TabsList>

        <TabsContent value="rules" className="space-y-4">
          {rules.map((rule, idx) => (
            <Card key={idx} className={rule.isCorrect ? "" : "border-red-300"}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                        {rule.path}
                      </code>
                      {rule.isCorrect ? (
                        <Badge className="bg-green-500">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Correct
                        </Badge>
                      ) : (
                        <Badge variant="destructive">
                          <XCircle className="w-3 h-3 mr-1" />
                          Incorrect
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{rule.description}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Read Permission */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Eye className="w-4 h-4 text-blue-500" />
                      <h4 className="font-semibold">Read Permission</h4>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Current:</p>
                        <code className="text-xs bg-gray-100 p-2 rounded block">
                          {rule.read}
                        </code>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Expected:</p>
                        <code className="text-xs bg-green-50 p-2 rounded block border border-green-200">
                          {rule.expected.read}
                        </code>
                      </div>
                    </div>
                  </div>

                  {/* Write Permission */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Lock className="w-4 h-4 text-orange-500" />
                      <h4 className="font-semibold">Write Permission</h4>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Current:</p>
                        <code className="text-xs bg-gray-100 p-2 rounded block">
                          {rule.write}
                        </code>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Expected:</p>
                        <code className="text-xs bg-green-50 p-2 rounded block border border-green-200">
                          {rule.expected.write}
                        </code>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="raw">
          <Card>
            <CardHeader>
              <CardTitle>storage.rules</CardTitle>
              <CardDescription>
                Raw Firebase Storage security rules configuration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                {MOCK_RULES}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Security Best Practices */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Security Best Practices
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-semibold">Public Read for Public Assets</p>
                <p className="text-sm text-gray-600">
                  Images, vehicles, cities, and services are publicly readable for
                  website visitors
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-semibold">Admin-Only Write Access</p>
                <p className="text-sm text-gray-600">
                  Only authenticated admins can upload or modify files
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-semibold">Role-Based Access Control</p>
                <p className="text-sm text-gray-600">
                  Permissions are tied to user roles (Admin, SuperAdmin) in Firebase Auth
                  custom claims
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-semibold">Import Files Protected</p>
                <p className="text-sm text-gray-600">
                  CSV imports and sensitive data are only accessible to admins
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-semibold">Backup Security</p>
                <p className="text-sm text-gray-600">
                  Backup files are restricted to SuperAdmin role only
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* TODO: Firebase Integration */}
      <div className="p-4 bg-gray-50 rounded border border-gray-200 text-sm text-gray-600">
        <strong>TODO:</strong> Firebase integration:
        <ul className="list-disc list-inside mt-2 ml-4">
          <li>Fetch actual storage.rules from Firebase project</li>
          <li>Parse and validate rules programmatically</li>
          <li>Test rules with sample requests</li>
          <li>Add ability to deploy corrected rules from UI</li>
          <li>Schedule regular audits with Cloud Functions</li>
          <li>Alert on rule changes via email/Slack</li>
        </ul>
      </div>
    </div>
  );
}
