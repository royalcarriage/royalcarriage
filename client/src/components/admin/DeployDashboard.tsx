import React, { useState } from "react";
import {
  Rocket,
  GitBranch,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

interface DeploymentHistory {
  id: string;
  site: string;
  branch: string;
  status: "success" | "failed" | "in-progress" | "pending";
  trigger: "manual" | "auto" | "pr-merge";
  deployedBy: string;
  timestamp: string;
  duration: string;
  url: string;
}

const DeployDashboard: React.FC = () => {
  const [selectedSite, setSelectedSite] = useState<string>("all");
  const [isDeploying, setIsDeploying] = useState(false);

  const sites = [
    {
      id: "airport",
      name: "Airport Service",
      domain: "chicagoairportblackcar.com",
      status: "live",
    },
    {
      id: "partybus",
      name: "Party Bus",
      domain: "partybus.com",
      status: "pending",
    },
    {
      id: "executive",
      name: "Executive Service",
      domain: "executive.com",
      status: "pending",
    },
    {
      id: "wedding",
      name: "Wedding Transport",
      domain: "wedding.com",
      status: "pending",
    },
  ];

  const deployHistory: DeploymentHistory[] = [
    {
      id: "1",
      site: "Airport Service",
      branch: "main",
      status: "success",
      trigger: "manual",
      deployedBy: "admin",
      timestamp: "2 hours ago",
      duration: "3m 42s",
      url: "https://chicagoairportblackcar.com",
    },
    {
      id: "2",
      site: "Airport Service",
      branch: "feature/trust-signals",
      status: "success",
      trigger: "pr-merge",
      deployedBy: "copilot",
      timestamp: "1 day ago",
      duration: "4m 18s",
      url: "https://chicagoairportblackcar.com",
    },
    {
      id: "3",
      site: "Airport Service",
      branch: "main",
      status: "failed",
      trigger: "auto",
      deployedBy: "github-actions",
      timestamp: "3 days ago",
      duration: "1m 52s",
      url: "",
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "failed":
        return <XCircle className="w-5 h-5 text-red-600" />;
      case "in-progress":
        return <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />;
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "bg-green-100 text-green-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "in-progress":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleDeploy = (siteId: string) => {
    setIsDeploying(true);
    // Simulate deployment
    setTimeout(() => {
      setIsDeploying(false);
      alert(
        `Deployment started for ${sites.find((s) => s.id === siteId)?.name}`,
      );
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Deployment Control
          </h2>
          <p className="text-gray-600">Deploy and manage site deployments</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedSite}
            onChange={(e) => setSelectedSite(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Sites</option>
            {sites.map((site) => (
              <option key={site.id} value={site.id}>
                {site.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Site Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {sites.map((site) => (
          <div
            key={site.id}
            className="bg-white border border-gray-200 rounded-lg p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">
                  {site.name}
                </h3>
                <p className="text-sm text-gray-600">{site.domain}</p>
              </div>
              <span
                className={`px-2 py-1 text-xs font-medium rounded-full ${
                  site.status === "live"
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {site.status}
              </span>
            </div>

            <div className="space-y-2 mb-4 text-sm text-gray-600">
              <div className="flex items-center justify-between">
                <span>Branch:</span>
                <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                  main
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Last deploy:</span>
                <span>{site.status === "live" ? "2 hours ago" : "Never"}</span>
              </div>
            </div>

            <button
              onClick={() => handleDeploy(site.id)}
              disabled={isDeploying || site.status !== "live"}
              className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                site.status === "live"
                  ? "bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              <Rocket className="w-4 h-4" />
              {isDeploying
                ? "Deploying..."
                : site.status === "live"
                  ? "Deploy Now"
                  : "Not Ready"}
            </button>
          </div>
        ))}
      </div>

      {/* Deployment History */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Deployment History
          </h3>
        </div>

        <div className="divide-y divide-gray-200">
          {deployHistory
            .filter(
              (deploy) =>
                selectedSite === "all" ||
                deploy.site === sites.find((s) => s.id === selectedSite)?.name,
            )
            .map((deploy) => (
              <div key={deploy.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(deploy.status)}
                    <div>
                      <div className="font-medium text-gray-900">
                        {deploy.site}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <GitBranch className="w-3 h-3" />
                        <span className="font-mono">{deploy.branch}</span>
                        <span>•</span>
                        <span>{deploy.timestamp}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(deploy.status)}`}
                    >
                      {deploy.status}
                    </span>
                  </div>
                </div>

                <div className="ml-8 flex items-center gap-6 text-sm text-gray-600">
                  <div>
                    <span className="text-gray-500">Trigger:</span>{" "}
                    <span className="font-medium">{deploy.trigger}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">By:</span>{" "}
                    <span className="font-medium">{deploy.deployedBy}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Duration:</span>{" "}
                    <span className="font-medium">{deploy.duration}</span>
                  </div>
                  {deploy.url && (
                    <a
                      href={deploy.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      View Site →
                    </a>
                  )}
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Deployment Configuration */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Deployment Settings
        </h3>

        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 mb-1">
                Manual Approval Required
              </h4>
              <p className="text-sm text-blue-800">
                All deployments require manual approval for safety. Automatic
                deployments are disabled to prevent accidental spam content
                publishing.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 border border-gray-200 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Build Command</h4>
              <code className="block text-sm text-gray-700 bg-gray-50 px-3 py-2 rounded font-mono">
                npm run build
              </code>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Deploy Command</h4>
              <code className="block text-sm text-gray-700 bg-gray-50 px-3 py-2 rounded font-mono">
                firebase deploy --only hosting
              </code>
            </div>
          </div>

          <div className="p-4 border border-gray-200 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">
              Environment Variables
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">FIREBASE_PROJECT_ID</span>
                <span className="text-gray-500">Configured</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">GA4_MEASUREMENT_ID</span>
                <span className="text-gray-500">Configured</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">API_BASE_URL</span>
                <span className="text-gray-500">Configured</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeployDashboard;
