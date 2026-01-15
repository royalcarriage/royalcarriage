import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { 
  Brain, 
  CheckCircle, 
  AlertCircle, 
  TrendingUp,
  FileText,
  ArrowLeft
} from "lucide-react";
import { Link } from "wouter";

interface PageScore {
  url: string;
  name: string;
  seoScore: number;
  contentScore: number;
  recommendations: {
    seo: string[];
    content: string[];
    style: string[];
    conversion: string[];
  };
}

export default function PageAnalyzer() {
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState<PageScore[]>([]);

  // Static pages to analyze
  const websitePages = [
    { url: '/', name: 'Home', content: '' },
    { url: '/ohare-airport-limo', name: 'O\'Hare Airport', content: '' },
    { url: '/midway-airport-limo', name: 'Midway Airport', content: '' },
    { url: '/airport-limo-downtown-chicago', name: 'Downtown Chicago', content: '' },
    { url: '/airport-limo-suburbs', name: 'Suburbs Service', content: '' },
    { url: '/fleet', name: 'Fleet', content: '' },
    { url: '/pricing', name: 'Pricing', content: '' },
    { url: '/about', name: 'About', content: '' },
    { url: '/contact', name: 'Contact', content: '' },
  ];

  const handleAnalyzePages = async () => {
    setAnalyzing(true);
    
    try {
      // TODO: Replace with actual API call to /api/ai/batch-analyze
      // This is currently using mock data for demonstration purposes
      // In production, this should call the real API:
      // const response = await fetch('/api/ai/batch-analyze', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ pages: websitePages })
      // });
      // const data = await response.json();
      // setResults(data.results);
      
      // Simulate page analysis with mock data
      const mockResults: PageScore[] = websitePages.map((page, index) => ({
        url: page.url,
        name: page.name,
        seoScore: Math.floor(Math.random() * 40) + 60, // Random score between 60-100
        contentScore: Math.floor(Math.random() * 40) + 60,
        recommendations: {
          seo: [
            'Add more location-specific keywords',
            'Optimize meta description length',
            'Improve heading structure'
          ].slice(0, Math.floor(Math.random() * 3) + 1),
          content: [
            'Expand content to 400+ words',
            'Add vehicle-specific details',
            'Include customer testimonials'
          ].slice(0, Math.floor(Math.random() * 3) + 1),
          style: [
            'Ensure consistent font sizing',
            'Use professional imagery'
          ].slice(0, Math.floor(Math.random() * 2) + 1),
          conversion: [
            'Add prominent phone number',
            'Include clear call-to-action',
            'Display trust badges'
          ].slice(0, Math.floor(Math.random() * 3) + 1),
        },
      }));

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setResults(mockResults);
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return <Badge className="bg-green-100 text-green-800">Excellent</Badge>;
    if (score >= 60) return <Badge className="bg-yellow-100 text-yellow-800">Good</Badge>;
    return <Badge className="bg-red-100 text-red-800">Needs Work</Badge>;
  };

  const averageSeoScore = results.length > 0
    ? Math.round(results.reduce((sum, r) => sum + r.seoScore, 0) / results.length)
    : 0;

  const averageContentScore = results.length > 0
    ? Math.round(results.reduce((sum, r) => sum + r.contentScore, 0) / results.length)
    : 0;

  return (
    <Layout>
      <SEO
        title="Page Analyzer | AI Website Management"
        description="Analyze website pages for SEO and content optimization"
        noindex={true}
      />

      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <Link href="/admin">
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
            <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <Brain className="h-10 w-10 text-purple-600" />
              AI Page Analyzer
            </h1>
            <p className="text-lg text-gray-600">
              Analyze all website pages for SEO optimization and content quality
            </p>
          </div>

          {/* Analysis Controls */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Start Analysis</CardTitle>
              <CardDescription>
                Analyze all {websitePages.length} pages for SEO and content optimization opportunities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleAnalyzePages} 
                disabled={analyzing}
                className="w-full sm:w-auto"
                size="lg"
              >
                {analyzing ? (
                  <>
                    <Brain className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing Pages...
                  </>
                ) : (
                  <>
                    <Brain className="mr-2 h-4 w-4" />
                    Analyze All Pages
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Summary Stats */}
          {results.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Average SEO Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-3xl font-bold ${getScoreColor(averageSeoScore)}`}>
                    {averageSeoScore}/100
                  </div>
                  <Progress value={averageSeoScore} className="mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Average Content Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-3xl font-bold ${getScoreColor(averageContentScore)}`}>
                    {averageContentScore}/100
                  </div>
                  <Progress value={averageContentScore} className="mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Pages Analyzed
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">
                    {results.length}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Total pages scanned</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Analysis Results */}
          {results.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Analysis Results</h2>
              
              {results.map((result, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="h-5 w-5" />
                          {result.name}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {result.url}
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        {getScoreBadge((result.seoScore + result.contentScore) / 2)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      {/* SEO Score */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">SEO Score</span>
                          <span className={`text-lg font-bold ${getScoreColor(result.seoScore)}`}>
                            {result.seoScore}/100
                          </span>
                        </div>
                        <Progress value={result.seoScore} />
                      </div>

                      {/* Content Score */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Content Score</span>
                          <span className={`text-lg font-bold ${getScoreColor(result.contentScore)}`}>
                            {result.contentScore}/100
                          </span>
                        </div>
                        <Progress value={result.contentScore} />
                      </div>
                    </div>

                    {/* Recommendations */}
                    <div className="space-y-4">
                      {result.recommendations.seo.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-sm text-gray-700 mb-2 flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" />
                            SEO Recommendations
                          </h4>
                          <ul className="space-y-1">
                            {result.recommendations.seo.map((rec, i) => (
                              <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                                <AlertCircle className="h-4 w-4 mt-0.5 text-yellow-500 flex-shrink-0" />
                                {rec}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {result.recommendations.content.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-sm text-gray-700 mb-2 flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            Content Recommendations
                          </h4>
                          <ul className="space-y-1">
                            {result.recommendations.content.map((rec, i) => (
                              <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                                <AlertCircle className="h-4 w-4 mt-0.5 text-blue-500 flex-shrink-0" />
                                {rec}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {result.recommendations.conversion.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-sm text-gray-700 mb-2 flex items-center gap-2">
                            <CheckCircle className="h-4 w-4" />
                            Conversion Recommendations
                          </h4>
                          <ul className="space-y-1">
                            {result.recommendations.conversion.map((rec, i) => (
                              <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                                <AlertCircle className="h-4 w-4 mt-0.5 text-green-500 flex-shrink-0" />
                                {rec}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="mt-6 flex gap-2">
                      <Button variant="default" size="sm">
                        Generate Improvements
                      </Button>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!analyzing && results.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <Brain className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold mb-2">Ready to Analyze</h3>
                <p className="text-gray-600 mb-4">
                  Click "Analyze All Pages" to start the AI-powered analysis
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
}
