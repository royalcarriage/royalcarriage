import { useState, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Upload,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileText,
  ArrowRight,
  ArrowLeft,
  Download,
  Target,
} from "lucide-react";
import type { ImportLog, ImportError } from "@shared/admin-types";

type WizardStep =
  | "select-type"
  | "upload"
  | "detect"
  | "preview"
  | "validate"
  | "submit";
type DatasetType =
  | "campaigns"
  | "keywords"
  | "search_terms"
  | "devices"
  | "locations";

interface ParsedData {
  headers: string[];
  rows: Record<string, string>[];
}

interface ValidationResult {
  isValid: boolean;
  errors: ImportError[];
  warnings: string[];
  stats: {
    totalRows: number;
    validRows: number;
    duplicates: number;
    invalidMetrics: number;
  };
}

interface DatasetConfig {
  type: DatasetType;
  label: string;
  description: string;
  requiredColumns: string[];
  icon: React.ReactNode;
}

const DATASET_CONFIGS: DatasetConfig[] = [
  {
    type: "campaigns",
    label: "Campaigns",
    description: "Campaign performance data with spend, clicks, conversions",
    requiredColumns: ["Campaign", "Clicks", "Cost", "Conversions"],
    icon: <Target className="w-5 h-5" />,
  },
  {
    type: "keywords",
    label: "Keywords",
    description: "Keyword-level performance metrics and bids",
    requiredColumns: ["Keyword", "Clicks", "Cost", "Conversions", "Avg. CPC"],
    icon: <FileText className="w-5 h-5" />,
  },
  {
    type: "search_terms",
    label: "Search Terms",
    description: "Actual search queries that triggered your ads",
    requiredColumns: ["Search term", "Clicks", "Cost", "Conversions"],
    icon: <FileText className="w-5 h-5" />,
  },
  {
    type: "devices",
    label: "Devices",
    description: "Performance breakdown by device type",
    requiredColumns: ["Device", "Clicks", "Cost", "Conversions"],
    icon: <FileText className="w-5 h-5" />,
  },
  {
    type: "locations",
    label: "Locations",
    description: "Geographic performance data",
    requiredColumns: ["Location", "Clicks", "Cost", "Conversions"],
    icon: <FileText className="w-5 h-5" />,
  },
];

export default function AdsImportWizard() {
  const [currentStep, setCurrentStep] = useState<WizardStep>("select-type");
  const [selectedDataset, setSelectedDataset] = useState<DatasetType | null>(
    null,
  );
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [validationResult, setValidationResult] =
    useState<ValidationResult | null>(null);
  const [importResult, setImportResult] = useState<ImportLog | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const steps: { key: WizardStep; label: string; description: string }[] = [
    {
      key: "select-type",
      label: "Select Type",
      description: "Choose dataset type",
    },
    {
      key: "upload",
      label: "Upload CSV",
      description: "Select your ads data file",
    },
    {
      key: "detect",
      label: "Detect Schema",
      description: "Verify column structure",
    },
    {
      key: "preview",
      label: "Preview Data",
      description: "Review first 50 rows",
    },
    { key: "validate", label: "Validate", description: "Check for errors" },
    { key: "submit", label: "Submit", description: "Import to Firebase" },
  ];

  const getCurrentStepIndex = () =>
    steps.findIndex((s) => s.key === currentStep);

  const getCurrentConfig = () =>
    DATASET_CONFIGS.find((c) => c.type === selectedDataset);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === "text/csv") {
      setFile(droppedFile);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const parseCSV = async (file: File): Promise<ParsedData> => {
    // Mock CSV parsing - in production, use PapaParse or similar
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const lines = text.split("\n").filter((line) => line.trim());
        const headers = lines[0].split(",").map((h) => h.trim());

        const rows = lines.slice(1, 51).map((line) => {
          const values = line.split(",").map((v) => v.trim());
          return headers.reduce(
            (obj, header, index) => {
              obj[header] = values[index] || "";
              return obj;
            },
            {} as Record<string, string>,
          );
        });

        resolve({ headers, rows });
      };
      reader.readAsText(file);
    });
  };

  const detectSchema = async () => {
    if (!file) return;

    setIsProcessing(true);
    try {
      const data = await parseCSV(file);
      setParsedData(data);
      setCurrentStep("detect");
    } catch (error) {
      console.error("Failed to parse CSV:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const validateData = () => {
    if (!parsedData || !selectedDataset) return;

    const config = getCurrentConfig();
    if (!config) return;

    const errors: ImportError[] = [];
    const warnings: string[] = [];

    const stats = {
      totalRows: parsedData.rows.length,
      validRows: 0,
      duplicates: 0,
      invalidMetrics: 0,
    };

    // Check for required columns
    const missingColumns = config.requiredColumns.filter(
      (col) => !parsedData.headers.includes(col),
    );
    if (missingColumns.length > 0) {
      warnings.push(`Missing required columns: ${missingColumns.join(", ")}`);
    }

    // Validate each row (mock validation)
    const seen = new Set<string>();
    parsedData.rows.forEach((row, index) => {
      const rowNum = index + 2; // +2 for header and 0-index
      let isValid = true;

      // Check primary identifier (first required column)
      const primaryCol = config.requiredColumns[0];
      const primaryValue = row[primaryCol];

      if (!primaryValue) {
        errors.push({
          row: rowNum,
          column: primaryCol,
          value: "",
          error: "missing",
          message: `${primaryCol} is required`,
        });
        isValid = false;
      } else if (seen.has(primaryValue)) {
        errors.push({
          row: rowNum,
          column: primaryCol,
          value: primaryValue,
          error: "duplicate",
          message: `Duplicate ${primaryCol}`,
        });
        stats.duplicates++;
        isValid = false;
      } else {
        seen.add(primaryValue);
      }

      // Validate numeric columns
      const numericColumns = ["Clicks", "Cost", "Conversions", "Avg. CPC"];
      numericColumns.forEach((col) => {
        if (parsedData.headers.includes(col) && row[col]) {
          const value = row[col].replace(/[,$]/g, ""); // Remove currency symbols
          if (isNaN(parseFloat(value))) {
            errors.push({
              row: rowNum,
              column: col,
              value: row[col],
              error: "invalid_format",
              message: "Must be a valid number",
            });
            stats.invalidMetrics++;
            isValid = false;
          }
        }
      });

      if (isValid) {
        stats.validRows++;
      }
    });

    setValidationResult({
      isValid: errors.length === 0,
      errors,
      warnings,
      stats,
    });
    setCurrentStep("validate");
  };

  const submitImport = async () => {
    if (!selectedDataset) return;

    setIsProcessing(true);

    // Mock Firebase import
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const mockResult: ImportLog = {
      id: `import_${Date.now()}`,
      type: "ads",
      fileName: file?.name || "unknown.csv",
      fileHash: "mock_hash_" + Date.now(),
      filePath: `/imports/ads/${selectedDataset}/` + file?.name,
      rowCount: parsedData?.rows.length || 0,
      importedCount: validationResult?.stats.validRows || 0,
      skippedCount: validationResult?.stats.duplicates || 0,
      errorCount: validationResult?.errors.length || 0,
      errors: validationResult?.errors || [],
      warnings: validationResult?.warnings || [],
      completenessScore: validationResult
        ? (validationResult.stats.validRows /
            validationResult.stats.totalRows) *
          100
        : 0,
      dedupeCount: validationResult?.stats.duplicates || 0,
      status: validationResult?.isValid ? "success" : "partial",
      userId: "mock_user_id",
      userEmail: "admin@example.com",
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    };

    setImportResult(mockResult);
    setCurrentStep("submit");
    setIsProcessing(false);
  };

  const exportErrors = () => {
    if (!validationResult) return;

    const csvContent = [
      ["Row", "Column", "Value", "Error Type", "Message"].join(","),
      ...validationResult.errors.map((error) =>
        [
          error.row,
          error.column,
          `"${error.value}"`,
          error.error,
          `"${error.message}"`,
        ].join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ads-import-errors-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const resetWizard = () => {
    setCurrentStep("select-type");
    setSelectedDataset(null);
    setFile(null);
    setParsedData(null);
    setValidationResult(null);
    setImportResult(null);
    setIsProcessing(false);
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Ads Data Import</h1>
          <p className="text-muted-foreground mt-1">
            Import advertising data from Google Ads or other platforms
          </p>
        </div>
        {currentStep !== "select-type" && (
          <Button variant="outline" onClick={resetWizard}>
            Start New Import
          </Button>
        )}
      </div>

      {/* Progress Steps */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <div key={step.key} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                      index <= getCurrentStepIndex()
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-muted bg-background text-muted-foreground"
                    }`}
                  >
                    {index < getCurrentStepIndex() ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>
                  <div className="text-center mt-2">
                    <div className="text-sm font-medium">{step.label}</div>
                    <div className="text-xs text-muted-foreground hidden md:block">
                      {step.description}
                    </div>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`h-0.5 flex-1 ${
                      index < getCurrentStepIndex() ? "bg-primary" : "bg-muted"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Step: Select Dataset Type */}
      {currentStep === "select-type" && (
        <Card>
          <CardHeader>
            <CardTitle>Select Dataset Type</CardTitle>
            <CardDescription>
              Choose the type of advertising data you want to import
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {DATASET_CONFIGS.map((config) => (
                <button
                  key={config.type}
                  onClick={() => setSelectedDataset(config.type)}
                  className={`p-6 border-2 rounded-lg text-left transition-all hover:border-primary ${
                    selectedDataset === config.type
                      ? "border-primary bg-primary/5"
                      : "border-muted"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      {config.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">
                        {config.label}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        {config.description}
                      </p>
                      <div className="text-xs text-muted-foreground">
                        Required: {config.requiredColumns.join(", ")}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex justify-end">
              <Button
                onClick={() => setCurrentStep("upload")}
                disabled={!selectedDataset}
              >
                Next: Upload File
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step: Upload */}
      {currentStep === "upload" && selectedDataset && (
        <Card>
          <CardHeader>
            <CardTitle>Upload CSV File</CardTitle>
            <CardDescription>
              Upload your {getCurrentConfig()?.label} data exported as CSV
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertTriangle className="w-4 h-4" />
              <AlertDescription>
                Required columns:{" "}
                {getCurrentConfig()?.requiredColumns.join(", ")}
              </AlertDescription>
            </Alert>

            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-muted hover:border-primary/50"
              }`}
            >
              <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <div className="space-y-2">
                <p className="text-lg font-medium">
                  {file ? file.name : "Drag & drop your CSV file here"}
                </p>
                <p className="text-sm text-muted-foreground">or</p>
                <label>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Button variant="outline" asChild>
                    <span>Browse Files</span>
                  </Button>
                </label>
              </div>
              {file && (
                <div className="mt-4 flex items-center justify-center gap-2 text-sm">
                  <FileText className="w-4 h-4" />
                  <span>{file.name}</span>
                  <Badge variant="secondary">
                    {(file.size / 1024).toFixed(2)} KB
                  </Badge>
                </div>
              )}
            </div>

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setCurrentStep("select-type")}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button onClick={detectSchema} disabled={!file || isProcessing}>
                {isProcessing ? "Processing..." : "Next: Detect Schema"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step: Detect Schema */}
      {currentStep === "detect" && parsedData && (
        <Card>
          <CardHeader>
            <CardTitle>Schema Detection</CardTitle>
            <CardDescription>
              Detected {parsedData.headers.length} columns in your CSV file
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {parsedData.headers.map((header, index) => {
                const isRequired =
                  getCurrentConfig()?.requiredColumns.includes(header);
                return (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-3 border rounded-lg"
                  >
                    {isRequired ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-muted" />
                    )}
                    <span
                      className={`font-medium ${isRequired ? "text-green-700" : ""}`}
                    >
                      {header}
                    </span>
                  </div>
                );
              })}
            </div>

            <Alert>
              <AlertTriangle className="w-4 h-4" />
              <AlertDescription>
                Required columns for {getCurrentConfig()?.label}:{" "}
                {getCurrentConfig()?.requiredColumns.join(", ")}
              </AlertDescription>
            </Alert>

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setCurrentStep("upload")}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button onClick={() => setCurrentStep("preview")}>
                Next: Preview Data
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step: Preview */}
      {currentStep === "preview" && parsedData && (
        <Card>
          <CardHeader>
            <CardTitle>Data Preview</CardTitle>
            <CardDescription>
              Showing first {Math.min(50, parsedData.rows.length)} of{" "}
              {parsedData.rows.length} rows
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ScrollArea className="h-[500px] w-full border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    {parsedData.headers.map((header, index) => (
                      <TableHead key={index}>{header}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parsedData.rows.map((row, rowIndex) => (
                    <TableRow key={rowIndex}>
                      <TableCell className="font-medium">
                        {rowIndex + 1}
                      </TableCell>
                      {parsedData.headers.map((header, colIndex) => (
                        <TableCell key={colIndex}>{row[header]}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setCurrentStep("detect")}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button onClick={validateData}>
                Next: Validate Data
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step: Validate */}
      {currentStep === "validate" && validationResult && (
        <Card>
          <CardHeader>
            <CardTitle>Validation Results</CardTitle>
            <CardDescription>
              {validationResult.isValid
                ? "All records passed validation"
                : `Found ${validationResult.errors.length} errors`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="text-2xl font-bold">
                  {validationResult.stats.totalRows}
                </div>
                <div className="text-sm text-muted-foreground">Total Rows</div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {validationResult.stats.validRows}
                </div>
                <div className="text-sm text-muted-foreground">Valid Rows</div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {validationResult.stats.duplicates}
                </div>
                <div className="text-sm text-muted-foreground">Duplicates</div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {validationResult.errors.length}
                </div>
                <div className="text-sm text-muted-foreground">Errors</div>
              </div>
            </div>

            {/* Warnings */}
            {validationResult.warnings.length > 0 && (
              <Alert>
                <AlertTriangle className="w-4 h-4" />
                <AlertDescription>
                  <div className="font-medium mb-2">Warnings:</div>
                  <ul className="list-disc list-inside space-y-1">
                    {validationResult.warnings.map((warning, index) => (
                      <li key={index}>{warning}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {/* Errors Table */}
            {validationResult.errors.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-medium">Validation Errors</h3>
                  <Button variant="outline" size="sm" onClick={exportErrors}>
                    <Download className="w-4 h-4 mr-2" />
                    Export Errors
                  </Button>
                </div>
                <ScrollArea className="h-[300px] border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Row</TableHead>
                        <TableHead>Column</TableHead>
                        <TableHead>Value</TableHead>
                        <TableHead>Error Type</TableHead>
                        <TableHead>Message</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {validationResult.errors
                        .slice(0, 100)
                        .map((error, index) => (
                          <TableRow key={index}>
                            <TableCell>{error.row}</TableCell>
                            <TableCell className="font-medium">
                              {error.column}
                            </TableCell>
                            <TableCell className="max-w-[200px] truncate">
                              {error.value || "(empty)"}
                            </TableCell>
                            <TableCell>
                              <Badge variant="destructive">{error.error}</Badge>
                            </TableCell>
                            <TableCell>{error.message}</TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
                {validationResult.errors.length > 100 && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Showing first 100 of {validationResult.errors.length} errors
                  </p>
                )}
              </div>
            )}

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setCurrentStep("preview")}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button
                onClick={submitImport}
                disabled={isProcessing}
                variant={validationResult.isValid ? "default" : "destructive"}
              >
                {isProcessing
                  ? "Importing..."
                  : validationResult.isValid
                    ? "Submit Import"
                    : "Import Valid Rows Only"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step: Submit Results */}
      {currentStep === "submit" && importResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {importResult.status === "success" ? (
                <CheckCircle className="w-6 h-6 text-green-500" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-yellow-500" />
              )}
              Import{" "}
              {importResult.status === "success"
                ? "Completed"
                : "Completed with Errors"}
            </CardTitle>
            <CardDescription>Import ID: {importResult.id}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="text-2xl font-bold">
                  {importResult.rowCount}
                </div>
                <div className="text-sm text-muted-foreground">Total Rows</div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {importResult.importedCount}
                </div>
                <div className="text-sm text-muted-foreground">Imported</div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {importResult.dedupeCount}
                </div>
                <div className="text-sm text-muted-foreground">Deduped</div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {importResult.skippedCount}
                </div>
                <div className="text-sm text-muted-foreground">Skipped</div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {importResult.errorCount}
                </div>
                <div className="text-sm text-muted-foreground">Errors</div>
              </div>
            </div>

            {/* Completeness Score */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Completeness Score</span>
                <span className="text-sm font-bold">
                  {importResult.completenessScore.toFixed(1)}%
                </span>
              </div>
              <Progress value={importResult.completenessScore} />
            </div>

            {/* Import Details */}
            <div className="space-y-2 p-4 border rounded-lg bg-muted/50">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-muted-foreground">Dataset Type:</div>
                <div className="font-medium capitalize">{selectedDataset}</div>
                <div className="text-muted-foreground">File Name:</div>
                <div className="font-medium">{importResult.fileName}</div>
                <div className="text-muted-foreground">Type:</div>
                <div className="font-medium capitalize">
                  {importResult.type}
                </div>
                <div className="text-muted-foreground">Imported By:</div>
                <div className="font-medium">{importResult.userEmail}</div>
                <div className="text-muted-foreground">Started:</div>
                <div className="font-medium">
                  {new Date(importResult.createdAt).toLocaleString()}
                </div>
                <div className="text-muted-foreground">Completed:</div>
                <div className="font-medium">
                  {importResult.completedAt
                    ? new Date(importResult.completedAt).toLocaleString()
                    : "N/A"}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button onClick={resetWizard}>Start New Import</Button>
              <Button
                variant="outline"
                onClick={() => (window.location.href = "/admin/imports")}
              >
                View Import History
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
