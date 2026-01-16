/**
 * Analytics & ROI Dashboard
 * Displays metrics, keyword clusters, and ROI reports
 */

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, FileText, TrendingUp, DollarSign } from "lucide-react";

export function AnalyticsDashboard() {
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string>("");

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    type: string,
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setUploadStatus(`Uploading ${type} files...`);

    // Simulate upload (in production, this would send to API)
    setTimeout(() => {
      setUploadStatus(
        `${type} files uploaded successfully! Run metrics import to process.`,
      );
      setUploading(false);
    }, 2000);
  };

  const handleMetricsImport = () => {
    setUploadStatus("Running metrics import... This may take a minute.");

    // In production, this would trigger the metrics-import.mjs script via API
    setTimeout(() => {
      setUploadStatus("Metrics import complete! Reports generated.");
    }, 3000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Analytics & ROI
        </h2>
        <p className="text-muted-foreground">
          Upload CSV exports, run metrics import, and view ROI reports
        </p>
      </div>

      {/* CSV Upload Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border border-border rounded-lg p-6 bg-card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Upload className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Google Ads CSVs</h3>
              <p className="text-sm text-muted-foreground">
                Search keyword reports
              </p>
            </div>
          </div>
          <input
            type="file"
            accept=".csv,.tsv"
            multiple
            onChange={(e) => handleFileUpload(e, "Google Ads")}
            className="block w-full text-sm text-muted-foreground
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-500/10 file:text-blue-500
              hover:file:bg-blue-500/20
              cursor-pointer"
            disabled={uploading}
          />
        </div>

        <div className="border border-border rounded-lg p-6 bg-card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Moovs CSVs</h3>
              <p className="text-sm text-muted-foreground">
                Reservation exports
              </p>
            </div>
          </div>
          <input
            type="file"
            accept=".csv"
            multiple
            onChange={(e) => handleFileUpload(e, "Moovs")}
            className="block w-full text-sm text-muted-foreground
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-green-500/10 file:text-green-500
              hover:file:bg-green-500/20
              cursor-pointer"
            disabled={uploading}
          />
        </div>
      </div>

      {/* Status Message */}
      {uploadStatus && (
        <div
          className={`border rounded-lg p-4 ${
            uploadStatus.includes("complete")
              ? "bg-green-500/10 border-green-500/20"
              : "bg-blue-500/10 border-blue-500/20"
          }`}
        >
          <p
            className={
              uploadStatus.includes("complete")
                ? "text-green-600"
                : "text-blue-600"
            }
          >
            {uploadStatus}
          </p>
        </div>
      )}

      {/* Import Button */}
      <div className="flex gap-4">
        <Button onClick={handleMetricsImport} disabled={uploading} size="lg">
          <TrendingUp className="w-4 h-4 mr-2" />
          Run Metrics Import
        </Button>
        <Button variant="outline" size="lg">
          <FileText className="w-4 h-4 mr-2" />
          View ROI Report
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border border-border rounded-lg p-6 bg-card">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-muted-foreground">
              Ad Spend (30d)
            </h4>
            <DollarSign className="w-4 h-4 text-muted-foreground" />
          </div>
          <p className="text-2xl font-bold text-foreground">$8,400</p>
          <p className="text-xs text-muted-foreground mt-1">
            Last import: 2 days ago
          </p>
        </div>

        <div className="border border-border rounded-lg p-6 bg-card">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-muted-foreground">
              Revenue (30d)
            </h4>
            <DollarSign className="w-4 h-4 text-muted-foreground" />
          </div>
          <p className="text-2xl font-bold text-foreground">$47,350</p>
          <p className="text-xs text-green-600 mt-1">ROAS: 5.64x</p>
        </div>

        <div className="border border-border rounded-lg p-6 bg-card">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-muted-foreground">
              Profit Proxy (30d)
            </h4>
            <DollarSign className="w-4 h-4 text-muted-foreground" />
          </div>
          <p className="text-2xl font-bold text-foreground">$12,840</p>
          <p className="text-xs text-muted-foreground mt-1">27.1% margin</p>
        </div>
      </div>

      {/* Placeholder for future sections */}
      <div className="border border-dashed border-border rounded-lg p-8 text-center bg-accent/50">
        <h3 className="font-semibold text-foreground mb-2">
          Keyword Clusters & Top 100
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          After running metrics import, keyword clustering and top 100 report
          will appear here.
        </p>
        <Button variant="outline">View Example Reports</Button>
      </div>
    </div>
  );
}
