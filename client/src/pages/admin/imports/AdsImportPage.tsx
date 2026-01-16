import { AdminLayout } from "@/components/admin/AdminLayout";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FileUp, Upload, Download, CheckCircle, XCircle } from "lucide-react";

const mockImports = [
  { id: 1, filename: "google_ads_jan2024.csv", dataset: "Google Ads", date: "2024-01-15", status: "completed", records: 89 },
  { id: 2, filename: "facebook_ads_jan2024.csv", dataset: "Facebook Ads", date: "2024-01-14", status: "completed", records: 67 },
  { id: 3, filename: "linkedin_ads_jan2024.csv", dataset: "LinkedIn Ads", date: "2024-01-13", status: "failed", records: 0 },
];

export default function AdsImportPage() {
  return (
    <>
      <SEO
        title="Ads Import | Royal Carriage Admin"
        description="Import advertising data"
        noindex={true}
      />
      <AdminLayout
        title="Ads Import"
        subtitle="Import advertising spend and performance data"
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Imports", href: "/admin/imports" },
          { label: "Ads Import" },
        ]}
      >
        {/* File Upload Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Upload Ads CSV</CardTitle>
            <CardDescription>Import advertising data from various platforms</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="dataset">Dataset Name</Label>
                <Input
                  id="dataset"
                  placeholder="e.g., Google Ads, Facebook Ads, LinkedIn Ads"
                  className="mt-2"
                />
              </div>
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <FileUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">Drop your CSV file here</p>
                <p className="text-sm text-muted-foreground mb-4">
                  or click to browse your files
                </p>
                <Button variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  Browse Files
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Supported format: CSV (max 10MB)</p>
                <Button>Import</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Import History */}
        <Card>
          <CardHeader>
            <CardTitle>Import History</CardTitle>
            <CardDescription>Previous advertising data imports</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Filename</TableHead>
                  <TableHead>Dataset</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Records</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockImports.map((imp) => (
                  <TableRow key={imp.id}>
                    <TableCell className="font-medium">{imp.filename}</TableCell>
                    <TableCell>{imp.dataset}</TableCell>
                    <TableCell>{imp.date}</TableCell>
                    <TableCell>
                      <Badge
                        variant={imp.status === "completed" ? "default" : "destructive"}
                        className="capitalize"
                      >
                        {imp.status === "completed" && <CheckCircle className="h-3 w-3 mr-1" />}
                        {imp.status === "failed" && <XCircle className="h-3 w-3 mr-1" />}
                        {imp.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{imp.records}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </AdminLayout>
    </>
  );
}
