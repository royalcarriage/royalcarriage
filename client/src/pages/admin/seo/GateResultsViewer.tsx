import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { GateResult } from '@shared/admin-types';
import { CheckCircle2, XCircle, AlertTriangle, ChevronDown, ChevronRight, RefreshCw } from 'lucide-react';

interface GateResultsViewerProps {
  draftId: string;
  gateResults?: GateResult;
}

// Mock data for demonstration
const MOCK_GATE_RESULT: GateResult = {
  draftId: 'draft-123',
  checks: {
    duplicateTitle: { 
      passed: true, 
      details: 'No duplicate titles found' 
    },
    duplicateMeta: { 
      passed: true, 
      details: 'Meta description is unique' 
    },
    similarityScore: { 
      passed: false, 
      score: 0.87, 
      threshold: 0.85 
    },
    schemaValid: { 
      passed: true, 
      errors: [] 
    },
    brokenLinks: { 
      passed: true, 
      links: [] 
    },
    missingImages: { 
      passed: false, 
      missing: ['hero-image', 'fleet-gallery-1'] 
    },
    interlinks: { 
      passed: true, 
      missing: [] 
    },
    keywordMatch: { 
      passed: true, 
      details: 'Primary keyword appears 8 times, secondary keywords well distributed' 
    },
  },
  suggestions: [
    'Content similarity score (0.87) is above threshold (0.85). Consider adding more unique content or adjusting existing pages.',
    'Missing 2 images: hero-image, fleet-gallery-1. Add images to improve visual appeal and SEO.',
    'Consider adding more internal links to related service pages.',
  ],
  overallStatus: 'warned',
  timestamp: '2024-01-16T15:30:00Z',
};

export default function GateResultsViewer({ draftId, gateResults = MOCK_GATE_RESULT }: GateResultsViewerProps) {
  const [expandedChecks, setExpandedChecks] = useState<Set<string>>(new Set());
  const [isRunning, setIsRunning] = useState(false);

  const toggleCheck = (checkName: string) => {
    setExpandedChecks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(checkName)) {
        newSet.delete(checkName);
      } else {
        newSet.add(checkName);
      }
      return newSet;
    });
  };

  const handleRerunGate = async () => {
    setIsRunning(true);
    
    // TODO: Firebase function call to re-run quality gate
    console.log('Re-running quality gate for draft:', draftId);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsRunning(false);
  };

  const getStatusIcon = (passed: boolean) => {
    if (passed) {
      return <CheckCircle2 className="h-5 w-5 text-green-600" />;
    }
    return <XCircle className="h-5 w-5 text-red-600" />;
  };

  const getOverallStatusBadge = () => {
    switch (gateResults.overallStatus) {
      case 'passed':
        return <Badge className="bg-green-600">Passed</Badge>;
      case 'warned':
        return <Badge className="bg-yellow-600">Warnings</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const checkDetails = [
    { 
      key: 'duplicateTitle', 
      label: 'Duplicate Title Check', 
      data: gateResults.checks.duplicateTitle 
    },
    { 
      key: 'duplicateMeta', 
      label: 'Duplicate Meta Description', 
      data: gateResults.checks.duplicateMeta 
    },
    { 
      key: 'similarityScore', 
      label: 'Content Similarity', 
      data: gateResults.checks.similarityScore 
    },
    { 
      key: 'schemaValid', 
      label: 'Schema Validation', 
      data: gateResults.checks.schemaValid 
    },
    { 
      key: 'brokenLinks', 
      label: 'Broken Links Check', 
      data: gateResults.checks.brokenLinks 
    },
    { 
      key: 'missingImages', 
      label: 'Image Requirements', 
      data: gateResults.checks.missingImages 
    },
    { 
      key: 'interlinks', 
      label: 'Internal Links', 
      data: gateResults.checks.interlinks 
    },
    { 
      key: 'keywordMatch', 
      label: 'Keyword Optimization', 
      data: gateResults.checks.keywordMatch 
    },
  ];

  const passedCount = checkDetails.filter(check => check.data.passed).length;
  const totalCount = checkDetails.length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Quality Gate Results</CardTitle>
              <CardDescription>
                Ran {new Date(gateResults.timestamp).toLocaleString()}
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              {getOverallStatusBadge()}
              <Button
                variant="outline"
                size="sm"
                onClick={handleRerunGate}
                disabled={isRunning}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRunning ? 'animate-spin' : ''}`} />
                Re-run Gate
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="font-medium">{passedCount} of {totalCount} checks passed</span>
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all"
                  style={{ width: `${(passedCount / totalCount) * 100}%` }}
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {checkDetails.map(check => {
              const isExpanded = expandedChecks.has(check.key);
              const hasDetails = 
                ('details' in check.data && check.data.details) ||
                ('score' in check.data && check.data.score !== undefined) ||
                ('errors' in check.data && check.data.errors.length > 0) ||
                ('links' in check.data && check.data.links.length > 0) ||
                ('missing' in check.data && check.data.missing.length > 0);

              return (
                <Card key={check.key}>
                  <Collapsible open={isExpanded} onOpenChange={() => toggleCheck(check.key)}>
                    <CollapsibleTrigger className="w-full">
                      <CardHeader className="py-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {getStatusIcon(check.data.passed)}
                            <span className="font-medium">{check.label}</span>
                          </div>
                          {hasDetails && (
                            <div>
                              {isExpanded ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </div>
                          )}
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>
                    {hasDetails && (
                      <CollapsibleContent>
                        <CardContent className="pt-0">
                          {'details' in check.data && check.data.details && (
                            <p className="text-sm text-muted-foreground">
                              {check.data.details}
                            </p>
                          )}
                          {'score' in check.data && check.data.score !== undefined && (
                            <div className="text-sm space-y-1">
                              <div>Score: {check.data.score.toFixed(2)}</div>
                              <div>Threshold: {check.data.threshold.toFixed(2)}</div>
                              {check.data.score > check.data.threshold && (
                                <p className="text-yellow-600 mt-2">
                                  ⚠️ Content similarity is above threshold
                                </p>
                              )}
                            </div>
                          )}
                          {'errors' in check.data && check.data.errors.length > 0 && (
                            <div className="space-y-1">
                              <div className="font-medium text-sm">Errors:</div>
                              <ul className="list-disc list-inside text-sm text-muted-foreground">
                                {check.data.errors.map((error, idx) => (
                                  <li key={idx}>{error}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {'links' in check.data && check.data.links.length > 0 && (
                            <div className="space-y-1">
                              <div className="font-medium text-sm">Broken Links:</div>
                              <ul className="list-disc list-inside text-sm text-muted-foreground">
                                {check.data.links.map((link, idx) => (
                                  <li key={idx}>{link}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {'missing' in check.data && check.data.missing.length > 0 && (
                            <div className="space-y-1">
                              <div className="font-medium text-sm">Missing Items:</div>
                              <ul className="list-disc list-inside text-sm text-muted-foreground">
                                {check.data.missing.map((item, idx) => (
                                  <li key={idx}>{item}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </CardContent>
                      </CollapsibleContent>
                    )}
                  </Collapsible>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {gateResults.suggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {gateResults.suggestions.map((suggestion, idx) => (
                <li key={idx}>
                  <Alert>
                    <AlertDescription className="text-sm">
                      {suggestion}
                    </AlertDescription>
                  </Alert>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
