import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  FileUp,
  Upload,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Download,
  RefreshCw,
  Eye,
  FileText,
  Clock,
  ArrowRight,
} from "lucide-react";

interface ImportRecord {
  id: string;
  filename: string;
  type: "trips" | "drivers" | "vehicles" | "customers";
  status: "completed" | "failed" | "processing" | "pending_review";
  recordsTotal: number;
  recordsCreated: number;
  recordsUpdated: number;
  recordsSkipped: number;
  recordsFailed: number;
  uploadedAt: string;
  completedAt: string | null;
  uploadedBy: string;
}

// Mock data
const importHistory: ImportRecord[] = [
  {
    id: "1",
    filename: "trips_jan2024.csv",
    type: "trips",
    status: "completed",
    recordsTotal: 150,
    recordsCreated: 142,
    recordsUpdated: 5,
    recordsSkipped: 0,
    recordsFailed: 3,
    uploadedAt: "2024-01-15T10:30:00",
    completedAt: "2024-01-15T10:32:00",
    uploadedBy: "Admin User",
  },
  {
    id: "2",
    filename: "drivers_new.csv",
    type: "drivers",
    status: "failed",
    recordsTotal: 25,
    recordsCreated: 0,
    recordsUpdated: 0,
    recordsSkipped: 0,
    recordsFailed: 25,
    uploadedAt: "2024-01-14T14:20:00",
    completedAt: "2024-01-14T14:20:30",
    uploadedBy: "Admin User",
  },
  {
    id: "3",
    filename: "vehicles_update.csv",
    type: "vehicles",
    status: "processing",
    recordsTotal: 50,
    recordsCreated: 20,
    recordsUpdated: 15,
    recordsSkipped: 0,
    recordsFailed: 0,
    uploadedAt: "2024-01-15T11:00:00",
    completedAt: null,
    uploadedBy: "Admin User",
  },
  {
    id: "4",
    filename: "customers_corporate.csv",
    type: "customers",
    status: "pending_review",
    recordsTotal: 80,
    recordsCreated: 0,
    recordsUpdated: 0,
    recordsSkipped: 0,
    recordsFailed: 0,
    uploadedAt: "2024-01-15T09:15:00",
    completedAt: null,
    uploadedBy: "Admin User",
  },
];

const statusColors: Record<ImportRecord["status"], string> = {
  completed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  failed: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  processing: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  pending_review: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
};

const statusLabels: Record<ImportRecord["status"], string> = {
  completed: "Completed",
  failed: "Failed",
  processing: "Processing",
  pending_review: "Pending Review",
};

const statusIcons: Record<ImportRecord["status"], React.ElementType> = {
  completed: CheckCircle,
  failed: XCircle,
  processing: RefreshCw,
  pending_review: AlertTriangle,
};

// Sample preview data for mapping
const previewData = [
  { col1: "TRP-001", col2: "John Smith", col3: "O'Hare Airport", col4: "Downtown", col5: "2024-01-15" },
  { col1: "TRP-002", col2: "Jane Doe", col3: "Midway Airport", col4: "Naperville", col5: "2024-01-16" },
  { col1: "TRP-003", col2: "Bob Wilson", col3: "Downtown", col4: "O'Hare Airport", col5: "2024-01-17" },
];

const csvColumns = ["trip_number", "customer_name", "pickup_location", "dropoff_location", "date"];
const systemFields = ["Trip ID", "Customer", "Pickup", "Dropoff", "Date", "Time", "Amount", "Driver", "Vehicle", "Status"];

export default function ImportsPage() {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadStep, setUploadStep] = useState(1);
  const [selectedType, setSelectedType] = useState<string>("");

  const handleStartUpload = () => {
    setUploadStep(1);
    setIsUploadOpen(true);
  };

  const handleNextStep = () => {
    if (uploadStep < 4) {
      setUploadStep(uploadStep + 1);
    } else {
      setIsUploadOpen(false);
      setUploadStep(1);
    }
  };

  return (
    <>
      <SEO
        title="Import Center | Royal Carriage Admin"
        description="Import and manage data"
        noindex={true}
      />
      <AdminLayout
        title="Import Center"
        subtitle="Upload and manage your data imports"
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Import Center" },
        ]}
        actions={
          <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleStartUpload}>
                <Upload className="h-4 w-4 mr-2" />
                New Import
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Import Data</DialogTitle>
                <DialogDescription>
                  Step {uploadStep} of 4: {uploadStep === 1 ? "Select Data Type" : uploadStep === 2 ? "Upload File" : uploadStep === 3 ? "Map Fields" : "Review & Import"}
                </DialogDescription>
              </DialogHeader>

              {/* Progress indicator */}
              <div className="flex items-center gap-2 mb-4">
                {[1, 2, 3, 4].map((step) => (
                  <div key={step} className="flex items-center flex-1">
                    <div
                      className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        step <= uploadStep
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {step}
                    </div>
                    {step < 4 && (
                      <div
                        className={`flex-1 h-1 mx-2 ${
                          step < uploadStep ? "bg-primary" : "bg-muted"
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* Step 1: Select Type */}
              {uploadStep === 1 && (
                <div className="space-y-4">
                  <Label>What type of data are you importing?</Label>
                  <div className="grid grid-cols-2 gap-4">
                    {["trips", "drivers", "vehicles", "customers"].map((type) => (
                      <Card
                        key={type}
                        className={`cursor-pointer transition-colors hover:border-primary ${
                          selectedType === type ? "border-primary bg-primary/5" : ""
                        }`}
                        onClick={() => setSelectedType(type)}
                      >
                        <CardContent className="p-4 flex items-center gap-3">
                          <FileText className="h-8 w-8 text-muted-foreground" />
                          <div>
                            <p className="font-medium capitalize">{type}</p>
                            <p className="text-xs text-muted-foreground">
                              Import {type} data from CSV
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 2: Upload File */}
              {uploadStep === 2 && (
                <div className="space-y-4">
                  <div className="border-2 border-dashed rounded-lg p-12 text-center">
                    <FileUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-lg font-medium mb-2">Drop your CSV file here</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      or click to browse your files
                    </p>
                    <Button variant="outline">Browse Files</Button>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    <span>Supported format: CSV (max 10MB)</span>
                  </div>
                </div>
              )}

              {/* Step 3: Map Fields */}
              {uploadStep === 3 && (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Map your CSV columns to system fields. Preview shows first 3 rows.
                  </p>
                  <ScrollArea className="h-[300px] border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-32">CSV Column</TableHead>
                          <TableHead className="w-48">Map To</TableHead>
                          <TableHead>Preview</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {csvColumns.map((col, i) => (
                          <TableRow key={col}>
                            <TableCell className="font-medium">{col}</TableCell>
                            <TableCell>
                              <Select defaultValue={systemFields[i]}>
                                <SelectTrigger className="w-40">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {systemFields.map((field) => (
                                    <SelectItem key={field} value={field}>
                                      {field}
                                    </SelectItem>
                                  ))}
                                  <SelectItem value="skip">Skip this column</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {previewData.map((row, j) => (
                                <span key={j}>
                                  {Object.values(row)[i]}
                                  {j < previewData.length - 1 && ", "}
                                </span>
                              ))}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </div>
              )}

              {/* Step 4: Review */}
              {uploadStep === 4 && (
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Import Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">File</p>
                          <p className="font-medium">trips_jan2024.csv</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Type</p>
                          <p className="font-medium capitalize">{selectedType || "trips"}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Total Records</p>
                          <p className="font-medium">150</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Fields Mapped</p>
                          <p className="font-medium">5 of 5</p>
                        </div>
                      </div>
                      <div className="pt-4 border-t">
                        <div className="flex items-center gap-2 text-green-600">
                          <CheckCircle className="h-5 w-5" />
                          <span>All records passed validation</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              <DialogFooter>
                {uploadStep > 1 && (
                  <Button variant="outline" onClick={() => setUploadStep(uploadStep - 1)}>
                    Back
                  </Button>
                )}
                <Button onClick={handleNextStep}>
                  {uploadStep === 4 ? "Start Import" : "Continue"}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      >
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Imports</p>
                  <p className="text-2xl font-bold">24</p>
                </div>
                <FileUp className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Records Imported</p>
                  <p className="text-2xl font-bold">2,450</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Review</p>
                  <p className="text-2xl font-bold">3</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-amber-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Failed Imports</p>
                  <p className="text-2xl font-bold">1</p>
                </div>
                <XCircle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Import History */}
        <Card>
          <CardHeader>
            <CardTitle>Import History</CardTitle>
            <CardDescription>View and manage your data imports</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all">
              <TabsList className="mb-4">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="failed">Failed</TabsTrigger>
              </TabsList>

              <TabsContent value="all">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>File</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Records</TableHead>
                      <TableHead>Uploaded</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {importHistory.map((record) => {
                      const StatusIcon = statusIcons[record.status];
                      return (
                        <TableRow key={record.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{record.filename}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {record.type}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={statusColors[record.status]} variant="secondary">
                              <StatusIcon className={`h-3 w-3 mr-1 ${record.status === 'processing' ? 'animate-spin' : ''}`} />
                              {statusLabels[record.status]}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-sm">
                                <span>{record.recordsTotal} total</span>
                                {record.status === "processing" && (
                                  <Progress
                                    value={(record.recordsCreated + record.recordsUpdated) / record.recordsTotal * 100}
                                    className="w-20 h-2"
                                  />
                                )}
                              </div>
                              {record.status === "completed" && (
                                <div className="flex gap-2 text-xs text-muted-foreground">
                                  <span className="text-green-600">{record.recordsCreated} created</span>
                                  <span className="text-blue-600">{record.recordsUpdated} updated</span>
                                  {record.recordsFailed > 0 && (
                                    <span className="text-red-600">{record.recordsFailed} failed</span>
                                  )}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {new Date(record.uploadedAt).toLocaleString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Eye className="h-4 w-4" />
                              </Button>
                              {record.recordsFailed > 0 && (
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <Download className="h-4 w-4" />
                                </Button>
                              )}
                              {record.status === "failed" && (
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <RefreshCw className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </AdminLayout>
    </>
  );
}
