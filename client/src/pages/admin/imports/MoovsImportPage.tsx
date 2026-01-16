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
import { FileUp, Upload, Download, CheckCircle, XCircle, Clock } from "lucide-react";

const mockImports = [
  { id: 1, filename: "moovs_jan2024.csv", date: "2024-01-15", status: "completed", records: 150 },
  { id: 2, filename: "moovs_dec2023.csv", date: "2024-01-10", status: "completed", records: 142 },
  { id: 3, filename: "moovs_nov2023.csv", date: "2024-01-05", status: "failed", records: 0 },
];

export default function MoovsImportPage() {
  return (
    <>
      <SEO
        title="Moovs Import | Royal Carriage Admin"
        description="Import Moovs CSV data"
        noindex={true}
      />
      <AdminLayout
        title="Moovs Import"
        subtitle="Import trip data from Moovs CSV files"
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Imports", href: "/admin/imports" },
          { label: "Moovs Import" },
        ]}
      >
        {/* File Upload Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Upload Moovs CSV</CardTitle>
            <CardDescription>Select a CSV file exported from Moovs system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
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
            <CardDescription>Previous Moovs CSV imports</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Filename</TableHead>
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
