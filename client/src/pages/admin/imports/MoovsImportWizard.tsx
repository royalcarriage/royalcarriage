import { useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Upload, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  FileText, 
  ArrowRight, 
  ArrowLeft,
  Download
} from "lucide-react";
import type { ImportLog, ImportError } from "@shared/admin-types";

type WizardStep = 'upload' | 'detect' | 'preview' | 'validate' | 'submit';

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
    missingTripId: number;
    missingAmount: number;
    missingDate: number;
    invalidDates: number;
  };
}

export default function MoovsImportWizard() {
  const [currentStep, setCurrentStep] = useState<WizardStep>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [importResult, setImportResult] = useState<ImportLog | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const steps: { key: WizardStep; label: string; description: string }[] = [
    { key: 'upload', label: 'Upload CSV', description: 'Select and upload your Moovs data file' },
    { key: 'detect', label: 'Detect Schema', description: 'Verify column structure' },
    { key: 'preview', label: 'Preview Data', description: 'Review first 50 rows' },
    { key: 'validate', label: 'Validate', description: 'Check for errors and warnings' },
    { key: 'submit', label: 'Submit', description: 'Import data to Firebase' },
  ];

  const getCurrentStepIndex = () => steps.findIndex(s => s.key === currentStep);

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
    if (droppedFile && droppedFile.type === 'text/csv') {
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
        const lines = text.split('\n').filter(line => line.trim());
        const headers = lines[0].split(',').map(h => h.trim());
        
        const rows = lines.slice(1, 51).map(line => {
          const values = line.split(',').map(v => v.trim());
          return headers.reduce((obj, header, index) => {
            obj[header] = values[index] || '';
            return obj;
          }, {} as Record<string, string>);
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
      setCurrentStep('detect');
    } catch (error) {
      console.error('Failed to parse CSV:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const validateData = () => {
    if (!parsedData) return;

    const requiredColumns = ['Trip ID', 'Total Amount', 'Pickup Date'];
    const errors: ImportError[] = [];
    const warnings: string[] = [];
    
    const stats = {
      totalRows: parsedData.rows.length,
      validRows: 0,
      missingTripId: 0,
      missingAmount: 0,
      missingDate: 0,
      invalidDates: 0,
    };

    // Check for required columns
    const missingColumns = requiredColumns.filter(col => !parsedData.headers.includes(col));
    if (missingColumns.length > 0) {
      warnings.push(`Missing required columns: ${missingColumns.join(', ')}`);
    }

    // Validate each row (mock validation)
    parsedData.rows.forEach((row, index) => {
      const rowNum = index + 2; // +2 for header and 0-index
      let isValid = true;

      if (!row['Trip ID']) {
        errors.push({
          row: rowNum,
          column: 'Trip ID',
          value: row['Trip ID'] || '',
          error: 'missing',
          message: 'Trip ID is required',
        });
        stats.missingTripId++;
        isValid = false;
      }

      if (!row['Total Amount']) {
        errors.push({
          row: rowNum,
          column: 'Total Amount',
          value: row['Total Amount'] || '',
          error: 'missing',
          message: 'Total Amount is required',
        });
        stats.missingAmount++;
        isValid = false;
      } else if (isNaN(parseFloat(row['Total Amount']))) {
        errors.push({
          row: rowNum,
          column: 'Total Amount',
          value: row['Total Amount'],
          error: 'invalid_format',
          message: 'Must be a valid number',
        });
        isValid = false;
      }

      if (!row['Pickup Date']) {
        errors.push({
          row: rowNum,
          column: 'Pickup Date',
          value: row['Pickup Date'] || '',
          error: 'missing',
          message: 'Pickup Date is required',
        });
        stats.missingDate++;
        isValid = false;
      }

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
    setCurrentStep('validate');
  };

  const submitImport = async () => {
    setIsProcessing(true);
    
    // Mock Firebase import
    await new Promise(resolve => setTimeout(resolve, 2000));

    const mockResult: ImportLog = {
      id: `import_${Date.now()}`,
      type: 'moovs',
      fileName: file?.name || 'unknown.csv',
      fileHash: 'mock_hash_' + Date.now(),
      filePath: '/imports/moovs/' + file?.name,
      rowCount: parsedData?.rows.length || 0,
      importedCount: validationResult?.stats.validRows || 0,
      skippedCount: 0,
      errorCount: validationResult?.errors.length || 0,
      errors: validationResult?.errors || [],
      warnings: validationResult?.warnings || [],
      completenessScore: validationResult ? 
        (validationResult.stats.validRows / validationResult.stats.totalRows) * 100 : 0,
      dedupeCount: 0,
      status: validationResult?.isValid ? 'success' : 'partial',
      userId: 'mock_user_id',
      userEmail: 'admin@example.com',
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    };

    setImportResult(mockResult);
    setCurrentStep('submit');
    setIsProcessing(false);
  };

  const exportErrors = () => {
    if (!validationResult) return;

    const csvContent = [
      ['Row', 'Column', 'Value', 'Error Type', 'Message'].join(','),
      ...validationResult.errors.map(error => 
        [error.row, error.column, `"${error.value}"`, error.error, `"${error.message}"`].join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `import-errors-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const resetWizard = () => {
    setCurrentStep('upload');
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
          <h1 className="text-3xl font-bold">Moovs Data Import</h1>
          <p className="text-muted-foreground mt-1">
            Import trip data from Moovs CSV export
          </p>
        </div>
        {currentStep !== 'upload' && (
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
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-muted bg-background text-muted-foreground'
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
                    <div className="text-xs text-muted-foreground">{step.description}</div>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`h-0.5 flex-1 ${
                      index < getCurrentStepIndex() ? 'bg-primary' : 'bg-muted'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      {currentStep === 'upload' && (
        <Card>
          <CardHeader>
            <CardTitle>Upload CSV File</CardTitle>
            <CardDescription>
              Select a CSV file exported from Moovs. Required columns: Trip ID, Total Amount, Pickup Date
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                isDragging
                  ? 'border-primary bg-primary/5'
                  : 'border-muted hover:border-primary/50'
              }`}
            >
              <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <div className="space-y-2">
                <p className="text-lg font-medium">
                  {file ? file.name : 'Drag & drop your CSV file here'}
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
                  <Badge variant="secondary">{(file.size / 1024).toFixed(2)} KB</Badge>
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <Button
                onClick={detectSchema}
                disabled={!file || isProcessing}
              >
                {isProcessing ? 'Processing...' : 'Next: Detect Schema'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {currentStep === 'detect' && parsedData && (
        <Card>
          <CardHeader>
            <CardTitle>Schema Detection</CardTitle>
            <CardDescription>
              Detected {parsedData.headers.length} columns in your CSV file
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {parsedData.headers.map((header, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-3 border rounded-lg"
                >
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="font-medium">{header}</span>
                </div>
              ))}
            </div>

            <Alert>
              <AlertTriangle className="w-4 h-4" />
              <AlertDescription>
                Ensure your CSV contains these required columns: Trip ID, Total Amount, Pickup Date
              </AlertDescription>
            </Alert>

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setCurrentStep('upload')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button onClick={() => setCurrentStep('preview')}>
                Next: Preview Data
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {currentStep === 'preview' && parsedData && (
        <Card>
          <CardHeader>
            <CardTitle>Data Preview</CardTitle>
            <CardDescription>
              Showing first {Math.min(50, parsedData.rows.length)} of {parsedData.rows.length} rows
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
                      <TableCell className="font-medium">{rowIndex + 1}</TableCell>
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
                onClick={() => setCurrentStep('detect')}
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

      {currentStep === 'validate' && validationResult && (
        <Card>
          <CardHeader>
            <CardTitle>Validation Results</CardTitle>
            <CardDescription>
              {validationResult.isValid
                ? 'All records passed validation'
                : `Found ${validationResult.errors.length} errors`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="text-2xl font-bold">{validationResult.stats.totalRows}</div>
                <div className="text-sm text-muted-foreground">Total Rows</div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {validationResult.stats.validRows}
                </div>
                <div className="text-sm text-muted-foreground">Valid Rows</div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {validationResult.errors.length}
                </div>
                <div className="text-sm text-muted-foreground">Errors</div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {validationResult.warnings.length}
                </div>
                <div className="text-sm text-muted-foreground">Warnings</div>
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
                      {validationResult.errors.slice(0, 100).map((error, index) => (
                        <TableRow key={index}>
                          <TableCell>{error.row}</TableCell>
                          <TableCell className="font-medium">{error.column}</TableCell>
                          <TableCell className="max-w-[200px] truncate">
                            {error.value || '(empty)'}
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
                onClick={() => setCurrentStep('preview')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button
                onClick={submitImport}
                disabled={isProcessing}
                variant={validationResult.isValid ? 'default' : 'destructive'}
              >
                {isProcessing ? 'Importing...' : 
                  validationResult.isValid ? 'Submit Import' : 'Import Valid Rows Only'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {currentStep === 'submit' && importResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {importResult.status === 'success' ? (
                <CheckCircle className="w-6 h-6 text-green-500" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-yellow-500" />
              )}
              Import {importResult.status === 'success' ? 'Completed' : 'Completed with Errors'}
            </CardTitle>
            <CardDescription>
              Import ID: {importResult.id}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="text-2xl font-bold">{importResult.rowCount}</div>
                <div className="text-sm text-muted-foreground">Total Rows</div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {importResult.importedCount}
                </div>
                <div className="text-sm text-muted-foreground">Imported</div>
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
                <span className="text-sm font-bold">{importResult.completenessScore.toFixed(1)}%</span>
              </div>
              <Progress value={importResult.completenessScore} />
            </div>

            {/* Import Details */}
            <div className="space-y-2 p-4 border rounded-lg bg-muted/50">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-muted-foreground">File Name:</div>
                <div className="font-medium">{importResult.fileName}</div>
                <div className="text-muted-foreground">Type:</div>
                <div className="font-medium capitalize">{importResult.type}</div>
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
                    : 'N/A'}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button onClick={resetWizard}>
                Start New Import
              </Button>
              <Button variant="outline" onClick={() => window.location.href = '/admin/imports'}>
                View Import History
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
