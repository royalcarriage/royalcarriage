import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useState } from "react";
import { 
  TrendingUp, 
  DollarSign,
  Target,
  BarChart3,
  CheckCircle,
  AlertCircle
} from "lucide-react";

interface KeywordOpportunity {
  keyword: string;
  intent: string;
  avgCPA: number;
  avgROAS: number;
  conversionValue: number;
  priority: string;
  profitScore: number;
}

export default function ROIDashboard() {
  const [loading, setLoading] = useState(false);
  const [opportunities, setOpportunities] = useState<KeywordOpportunity[]>([]);
  
  const loadOpportunities = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/roi/opportunities');
      const data = await response.json();
      setOpportunities(data.opportunities || []);
    } catch (error) {
      console.error('Failed to load opportunities:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    if (priority === 'SCALE') return 'bg-green-100 text-green-800';
    if (priority === 'OPTIMIZE') return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <AdminLayout 
      title="ROI Intelligence Dashboard"
      subtitle="Profit-driven content and keyword opportunities"
    >
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Avg ROAS
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                21.5x
              </div>
              <p className="text-xs text-gray-500 mt-1">Return on ad spend</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Avg CPA
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                $14.20
              </div>
              <p className="text-xs text-gray-500 mt-1">Cost per acquisition</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                High-Value Pages
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">
                12
              </div>
              <p className="text-xs text-gray-500 mt-1">ROAS &gt; 20x</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Scale Opportunities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">
                8
              </div>
              <p className="text-xs text-gray-500 mt-1">Ready to scale</p>
            </CardContent>
          </Card>
        </div>

        {/* Load Opportunities */}
        <Card>
          <CardHeader>
            <CardTitle>Keyword Opportunities</CardTitle>
            <CardDescription>
              High-profit keywords ranked by ROAS and conversion value
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={loadOpportunities} 
              disabled={loading}
              className="mb-4"
            >
              {loading ? (
                <>
                  <BarChart3 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Load Top Opportunities
                </>
              )}
            </Button>

            {opportunities.length > 0 && (
              <div className="space-y-4">
                {opportunities.map((opp, index) => (
                  <Card key={index} className="bg-gray-50">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-bold mb-1">{opp.keyword}</h3>
                          <div className="flex gap-2">
                            <Badge className={getPriorityColor(opp.priority)}>
                              {opp.priority}
                            </Badge>
                            <Badge variant="outline">{opp.intent}</Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-600">
                            {opp.avgROAS.toFixed(1)}x
                          </div>
                          <div className="text-xs text-gray-500">ROAS</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div>
                          <div className="text-sm text-gray-600">Avg CPA</div>
                          <div className="text-lg font-semibold">${opp.avgCPA.toFixed(2)}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Conv. Value</div>
                          <div className="text-lg font-semibold">${opp.conversionValue.toFixed(0)}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Profit Score</div>
                          <div className="text-lg font-semibold">{opp.profitScore}/100</div>
                        </div>
                      </div>

                      <div className="mb-3">
                        <div className="text-sm text-gray-600 mb-1">Profit Potential</div>
                        <Progress value={opp.profitScore} className="h-2" />
                      </div>

                      <div className="flex gap-2">
                        <Button size="sm" variant="default">
                          <Target className="mr-1 h-3 w-3" />
                          Generate Content
                        </Button>
                        <Button size="sm" variant="outline">
                          View Analytics
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {opportunities.length === 0 && !loading && (
              <div className="text-center py-12 text-gray-500">
                <Target className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <p>Click "Load Top Opportunities" to see profit-driven keywords</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ROI Analysis Tips */}
        <Card>
          <CardHeader>
            <CardTitle>ROI Intelligence Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <div className="font-semibold">Focus on SCALE opportunities</div>
                  <div className="text-sm text-gray-600">
                    Keywords with ROAS &gt; 20x and "SCALE" priority are proven profit drivers
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <div className="font-semibold">Optimize high CPA keywords</div>
                  <div className="text-sm text-gray-600">
                    Keywords with CPA &gt; $20 need content optimization to improve conversion rates
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <div className="font-semibold">Pause low-performing keywords</div>
                  <div className="text-sm text-gray-600">
                    Keywords with ROAS &lt; 5x should be paused or heavily optimized before continued investment
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
