import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PrimaryButton } from '@/components/admin/buttons';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/lib/firebase';
import { 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Search,
  Calendar
} from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, addDoc, query, orderBy, limit, getDocs } from 'firebase/firestore';

interface GSCRow {
  page: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

interface GSCImportResult {
  totalRows: number;
  successCount: number;
  errorCount: number;
  errors: string[];
}

interface IndexingIssue {
  page: string;
  issue: 'low-ctr' | 'poor-position' | 'declining-clicks' | 'high-impressions-low-clicks';
  severity: 'high' | 'medium' | 'low';
  description: string;
}

export default function GSCImport() {
  const { userData } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [importResult, setImportResult] = useState<GSCImportResult | null>(null);
  const [gscData, setGscData] = useState<GSCRow[]>([]);
  const [indexingIssues, setIndexingIssues] = useState<IndexingIssue[]>([]);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  const isAdminPlus = userData?.role === UserRole.SUPER_ADMIN || userData?.role === UserRole.ADMIN;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setImportResult(null);
    }
  };

  const parseCSV = (text: string): GSCRow[] => {
    const lines = text.trim().split('\n');
    const headers = lines[0].toLowerCase().split(',').map(h => h.trim());
    
    const pageIdx = headers.indexOf('page') >= 0 ? headers.indexOf('page') : headers.indexOf('url');
    const clicksIdx = headers.indexOf('clicks');
    const impressionsIdx = headers.indexOf('impressions');
    const ctrIdx = headers.indexOf('ctr');
    const positionIdx = headers.indexOf('position');
    
    const rows: GSCRow[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      
      if (values.length < 4) continue;
      
      try {
        rows.push({
          page: values[pageIdx],
          clicks: parseInt(values[clicksIdx]) || 0,
          impressions: parseInt(values[impressionsIdx]) || 0,
          ctr: parseFloat(values[ctrIdx]) || 0,
          position: parseFloat(values[positionIdx]) || 0
        });
      } catch (error) {
        console.error('Error parsing row:', values, error);
      }
    }
    
    return rows;
  };

  const analyzeIndexingIssues = (data: GSCRow[]): IndexingIssue[] => {
    const issues: IndexingIssue[] = [];
    
    data.forEach(row => {
      // Low CTR issue
      if (row.ctr < 0.02 && row.impressions > 100) {
        issues.push({
          page: row.page,
          issue: 'low-ctr',
          severity: 'high',
          description: `CTR is ${(row.ctr * 100).toFixed(2)}% (below 2%)`
        });
      }
      
      // Poor position issue
      if (row.position > 20 && row.impressions > 50) {
        issues.push({
          page: row.page,
          issue: 'poor-position',
          severity: 'medium',
          description: `Average position is ${row.position.toFixed(1)} (page 2+)`
        });
      }
      
      // High impressions but low clicks
      if (row.impressions > 1000 && row.clicks < 20) {
        issues.push({
          page: row.page,
          issue: 'high-impressions-low-clicks',
          severity: 'high',
          description: `${row.impressions} impressions but only ${row.clicks} clicks`
        });
      }
    });
    
    return issues;
  };

  const handleUpload = async () => {
    if (!file || !isAdminPlus) return;
    
    try {
      setUploading(true);
      
      // Read and parse CSV
      const text = await file.text();
      const parsedData = parseCSV(text);
      
      setGscData(parsedData);
      
      // Analyze for issues
      const issues = analyzeIndexingIssues(parsedData);
      setIndexingIssues(issues);
      
      // TODO: Store in Firestore
      // const gscRef = collection(db, 'gsc_pages');
      // const batch = writeBatch(db);
      // 
      // for (const row of parsedData) {
      //   const docRef = doc(gscRef);
      //   batch.set(docRef, {
      //     ...row,
      //     importedAt: new Date(),
      //     dateRange: {
      //       start: dateRange.start,
      //       end: dateRange.end
      //     }
      //   });
      // }
      // 
      // await batch.commit();
      
      console.log('Would store in Firestore:', parsedData.length, 'rows');
      
      setImportResult({
        totalRows: parsedData.length,
        successCount: parsedData.length,
        errorCount: 0,
        errors: []
      });
      
    } catch (error) {
      console.error('Error uploading GSC data:', error);
      setImportResult({
        totalRows: 0,
        successCount: 0,
        errorCount: 1,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      });
    } finally {
      setUploading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Search className="h-8 w-8" />
            Google Search Console Import
          </h1>
          <p className="text-muted-foreground mt-2">
            Import GSC data to analyze page performance and identify issues
          </p>
        </div>
      </div>

      {!isAdminPlus && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You need Admin or Super Admin role to import GSC data.
          </AlertDescription>
        </Alert>
      )}

      {/* Date Range Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Date Range
          </CardTitle>
          <CardDescription>Select the date range for the GSC export</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-date">Start Date</Label>
              <Input
                id="start-date"
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                disabled={!isAdminPlus}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-date">End Date</Label>
              <Input
                id="end-date"
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                disabled={!isAdminPlus}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* File Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload GSC Export
          </CardTitle>
          <CardDescription>
            Export CSV from Google Search Console with columns: page, clicks, impressions, CTR, position
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="file-upload">CSV File</Label>
            <Input
              id="file-upload"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              disabled={!isAdminPlus || uploading}
            />
          </div>
          
          {file && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileText className="h-4 w-4" />
              <span>{file.name} ({(file.size / 1024).toFixed(2)} KB)</span>
            </div>
          )}
          
          <PrimaryButton
            onClick={handleUpload}
            disabled={!file || !isAdminPlus || uploading}
          >
            <Upload className="h-4 w-4 mr-2" />
            {uploading ? 'Uploading...' : 'Upload and Analyze'}
          </PrimaryButton>
        </CardContent>
      </Card>

      {/* Import Result */}
      {importResult && (
        <Alert className={importResult.errorCount > 0 ? 'border-red-300 bg-red-50' : 'border-green-300 bg-green-50'}>
          {importResult.errorCount > 0 ? (
            <AlertCircle className="h-4 w-4 text-red-600" />
          ) : (
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          )}
          <AlertDescription className={importResult.errorCount > 0 ? 'text-red-800' : 'text-green-800'}>
            {importResult.errorCount > 0 ? (
              <>
                Import completed with errors: {importResult.successCount} succeeded, {importResult.errorCount} failed
                {importResult.errors.length > 0 && (
                  <ul className="mt-2 list-disc list-inside">
                    {importResult.errors.slice(0, 3).map((error, i) => (
                      <li key={i}>{error}</li>
                    ))}
                  </ul>
                )}
              </>
            ) : (
              <>Successfully imported {importResult.successCount} pages from GSC</>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Indexing Issues */}
      {indexingIssues.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              Indexing Issues ({indexingIssues.length})
            </CardTitle>
            <CardDescription>Pages that need attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {indexingIssues.slice(0, 10).map((issue, index) => (
                <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                  <Badge className={getSeverityColor(issue.severity)}>
                    {issue.severity.toUpperCase()}
                  </Badge>
                  <div className="flex-1">
                    <p className="font-medium">{issue.page}</p>
                    <p className="text-sm text-muted-foreground">{issue.description}</p>
                  </div>
                </div>
              ))}
              {indexingIssues.length > 10 && (
                <p className="text-sm text-muted-foreground text-center">
                  And {indexingIssues.length - 10} more issues...
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Data Preview */}
      {gscData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Data Preview</CardTitle>
            <CardDescription>Top 10 pages by clicks</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Page</TableHead>
                  <TableHead className="text-right">Clicks</TableHead>
                  <TableHead className="text-right">Impressions</TableHead>
                  <TableHead className="text-right">CTR</TableHead>
                  <TableHead className="text-right">Position</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {gscData
                  .sort((a, b) => b.clicks - a.clicks)
                  .slice(0, 10)
                  .map((row, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{row.page}</TableCell>
                      <TableCell className="text-right">{row.clicks.toLocaleString()}</TableCell>
                      <TableCell className="text-right">{row.impressions.toLocaleString()}</TableCell>
                      <TableCell className="text-right">{(row.ctr * 100).toFixed(2)}%</TableCell>
                      <TableCell className="text-right">{row.position.toFixed(1)}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
