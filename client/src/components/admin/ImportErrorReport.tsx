import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Download, Filter, Search, AlertCircle } from "lucide-react";
import type { ImportError } from "@shared/admin-types";

interface ImportErrorReportProps {
  errors: ImportError[];
  fileName?: string;
  importId?: string;
}

type ErrorTypeFilter =
  | "all"
  | "missing"
  | "invalid_format"
  | "duplicate"
  | "parse_error";

export default function ImportErrorReport({
  errors,
  fileName = "import-data.csv",
  importId = "unknown",
}: ImportErrorReportProps) {
  const [filterType, setFilterType] = useState<ErrorTypeFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 50;

  // Filter and search errors
  const filteredErrors = useMemo(() => {
    let result = errors;

    // Filter by error type
    if (filterType !== "all") {
      result = result.filter((error) => error.error === filterType);
    }

    // Search across all fields
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (error) =>
          error.row.toString().includes(query) ||
          error.column.toLowerCase().includes(query) ||
          error.value.toLowerCase().includes(query) ||
          error.message.toLowerCase().includes(query),
      );
    }

    return result;
  }, [errors, filterType, searchQuery]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredErrors.length / pageSize);
  const paginatedErrors = filteredErrors.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  // Calculate error type statistics
  const errorStats = useMemo(() => {
    const stats = {
      missing: 0,
      invalid_format: 0,
      duplicate: 0,
      parse_error: 0,
    };

    errors.forEach((error) => {
      stats[error.error]++;
    });

    return stats;
  }, [errors]);

  // Export errors to CSV
  const exportToCSV = () => {
    const csvContent = [
      ["Row", "Column", "Value", "Error Type", "Message"].join(","),
      ...filteredErrors.map((error) => {
        // Escape values that contain commas or quotes
        const escapeCSV = (str: string | number) => {
          const value = String(str);
          if (
            value.includes(",") ||
            value.includes('"') ||
            value.includes("\n")
          ) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        };

        return [
          error.row,
          escapeCSV(error.column),
          escapeCSV(error.value),
          error.error,
          escapeCSV(error.message),
        ].join(",");
      }),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `import-errors-${importId}-${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Get badge variant for error type
  const getErrorBadgeVariant = (errorType: ImportError["error"]) => {
    switch (errorType) {
      case "missing":
        return "destructive";
      case "invalid_format":
        return "destructive";
      case "duplicate":
        return "secondary";
      case "parse_error":
        return "destructive";
      default:
        return "default";
    }
  };

  // Format error type for display
  const formatErrorType = (errorType: ImportError["error"]) => {
    return errorType
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  if (errors.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Import Error Report</CardTitle>
          <CardDescription>No errors found in this import</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">All Clear!</h3>
            <p className="text-muted-foreground">
              This import completed successfully with no errors.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                Import Error Report
              </CardTitle>
              <CardDescription>
                {errors.length} total errors found in {fileName}
              </CardDescription>
            </div>
            <Button onClick={exportToCSV} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export to CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Error Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="p-4 border rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {errorStats.missing}
              </div>
              <div className="text-sm text-muted-foreground">
                Missing Values
              </div>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {errorStats.invalid_format}
              </div>
              <div className="text-sm text-muted-foreground">
                Invalid Format
              </div>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {errorStats.duplicate}
              </div>
              <div className="text-sm text-muted-foreground">Duplicates</div>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {errorStats.parse_error}
              </div>
              <div className="text-sm text-muted-foreground">Parse Errors</div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search errors by row, column, value, or message..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1); // Reset to first page on search
                  }}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full md:w-[200px]">
              <Select
                value={filterType}
                onValueChange={(value) => {
                  setFilterType(value as ErrorTypeFilter);
                  setCurrentPage(1); // Reset to first page on filter change
                }}
              >
                <SelectTrigger>
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    All Errors ({errors.length})
                  </SelectItem>
                  <SelectItem value="missing">
                    Missing ({errorStats.missing})
                  </SelectItem>
                  <SelectItem value="invalid_format">
                    Invalid Format ({errorStats.invalid_format})
                  </SelectItem>
                  <SelectItem value="duplicate">
                    Duplicate ({errorStats.duplicate})
                  </SelectItem>
                  <SelectItem value="parse_error">
                    Parse Error ({errorStats.parse_error})
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Results Count */}
          <div className="mb-4">
            <p className="text-sm text-muted-foreground">
              Showing{" "}
              {paginatedErrors.length > 0
                ? (currentPage - 1) * pageSize + 1
                : 0}{" "}
              to {Math.min(currentPage * pageSize, filteredErrors.length)} of{" "}
              {filteredErrors.length} errors
              {(filterType !== "all" || searchQuery) &&
                ` (filtered from ${errors.length} total)`}
            </p>
          </div>

          {/* Errors Table */}
          <ScrollArea className="h-[500px] border rounded-lg">
            <Table>
              <TableHeader className="sticky top-0 bg-background z-10">
                <TableRow>
                  <TableHead className="w-[80px]">Row</TableHead>
                  <TableHead className="w-[150px]">Column</TableHead>
                  <TableHead className="w-[200px]">Value</TableHead>
                  <TableHead className="w-[140px]">Error Type</TableHead>
                  <TableHead>Message</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedErrors.length > 0 ? (
                  paginatedErrors.map((error, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-mono">{error.row}</TableCell>
                      <TableCell className="font-medium">
                        {error.column}
                      </TableCell>
                      <TableCell className="max-w-[200px]">
                        <div className="truncate" title={error.value}>
                          {error.value || (
                            <span className="text-muted-foreground italic">
                              (empty)
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getErrorBadgeVariant(error.error)}>
                          {formatErrorType(error.error)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{error.message}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12">
                      <div className="text-muted-foreground">
                        No errors match your current filters
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Error Resolution Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Error Resolution Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-3">
              <Badge variant="destructive" className="h-6">
                Missing
              </Badge>
              <div className="flex-1">
                <p className="text-sm">
                  These rows are missing required values. Fill in the missing
                  data and re-import.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Badge variant="destructive" className="h-6">
                Invalid Format
              </Badge>
              <div className="flex-1">
                <p className="text-sm">
                  The data format doesn't match expectations (e.g., text in a
                  number field). Correct the format in your source file.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Badge variant="secondary" className="h-6">
                Duplicate
              </Badge>
              <div className="flex-1">
                <p className="text-sm">
                  These rows contain duplicate identifiers. Remove duplicates or
                  merge records before importing.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Badge variant="destructive" className="h-6">
                Parse Error
              </Badge>
              <div className="flex-1">
                <p className="text-sm">
                  The CSV structure is malformed (e.g., mismatched quotes, wrong
                  delimiter). Check your CSV export settings.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
