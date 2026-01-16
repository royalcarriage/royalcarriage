import React, { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { useAuth } from '../state/AuthProvider';

interface KeywordOpportunity {
  keyword: string;
  searchVolume: number;
  difficulty: number;
  theyRankFor: boolean;
  weRankFor: boolean;
  opportunity: number;
}

interface CompetitorAnalysisData {
  analysisId: string;
  analysisDate: Date;
  competitors: Array<{
    name: string;
    url: string;
    metrics: {
      estimatedTraffic: number;
      backlinks: number;
      contentQuality: string;
    };
    topKeywords: Array<{
      keyword: string;
      searchVolume: number;
      difficulty: number;
      position: number;
    }>;
  }>;
  opportunities: {
    topOpportunities: KeywordOpportunity[];
    highPriorityCount: number;
    mediumPriorityCount: number;
    lowPriorityCount: number;
    totalOpportunities: number;
  };
  gaps: {
    keywordGaps: KeywordOpportunity[];
    serviceGaps: Array<{
      serviceType: string;
      location: string;
      priority: string;
    }>;
  };
  comparison: {
    theyRankForButWeDont: string[];
    weRankForButTheyDont: string[];
    commonKeywords: number;
  };
  recommendations: string[];
}

export default function CompetitorAnalysisPage() {
  const { user, role } = useAuth();
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<CompetitorAnalysisData | null>(null);
  const [selectedTab, setSelectedTab] = useState<'opportunities' | 'gaps' | 'comparison' | 'recommendations'>(
    'opportunities'
  );

  useEffect(() => {
    if (role !== 'admin' && role !== 'superadmin') {
      return;
    }
    loadLatestAnalysis();
  }, [role]);

  async function loadLatestAnalysis() {
    try {
      setLoading(true);
      const q = query(collection(db, 'competitor_analysis'), orderBy('analysisDate', 'desc'));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        setAnalysis(null);
        return;
      }

      const latestDoc = snapshot.docs[0];
      const data = latestDoc.data();

      // Convert Firestore timestamps
      if (data.analysisDate?.toDate) {
        data.analysisDate = data.analysisDate.toDate();
      }

      setAnalysis(data as CompetitorAnalysisData);
    } catch (error) {
      console.error('Error loading analysis:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleRunAnalysis() {
    setAnalyzing(true);
    try {
      // Call Cloud Function to run competitor analysis
      const response = await fetch('/.netlify/functions/analyze-competitors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          includeLocalPack: true,
          analysisDepth: 'detailed',
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      setAnalyzing(false);
      alert(
        `Analysis complete! Found ${result.opportunities.totalOpportunities} keyword opportunities and ${result.gaps.serviceGaps.length} service gaps.`
      );
      loadLatestAnalysis();
    } catch (error) {
      console.error('Error running analysis:', error);
      alert('Failed to run analysis. Check console for details.');
      setAnalyzing(false);
    }
  }

  if (role !== 'admin' && role !== 'superadmin') {
    return <div className="p-8">Access Denied. Admins only.</div>;
  }

  return (
    <div className="p-8 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Competitor Analysis</h1>
          <p className="text-gray-600">Analyze competitor websites to identify keyword and content opportunities</p>
        </div>

        {/* Action Bar */}
        <div className="mb-8 flex justify-between items-center">
          <button
            onClick={handleRunAnalysis}
            disabled={analyzing}
            className={`px-6 py-3 rounded-lg font-bold text-white transition ${
              analyzing ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {analyzing ? 'Running Analysis...' : 'Run New Analysis'}
          </button>
          {analysis && (
            <div className="text-sm text-gray-600">
              Last analyzed: {new Date(analysis.analysisDate).toLocaleString()}
            </div>
          )}
        </div>

        {loading ? (
          <div className="text-center py-12">Loading analysis data...</div>
        ) : analysis ? (
          <>
            {/* Competitors Overview */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Analyzed Competitors</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {analysis.competitors.map((competitor, idx) => (
                  <div key={idx} className="border rounded-lg p-6 hover:shadow-lg transition">
                    <h3 className="font-bold text-lg mb-3">{competitor.name}</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Est. Traffic:</span>
                        <span className="font-semibold">{(competitor.metrics?.estimatedTraffic || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Backlinks:</span>
                        <span className="font-semibold">{competitor.metrics?.backlinks || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Content Quality:</span>
                        <span className={`font-semibold ${competitor.metrics?.contentQuality === 'Excellent' ? 'text-green-600' : 'text-blue-600'}`}>
                          {competitor.metrics?.contentQuality}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Top Keywords:</span>
                        <span className="font-semibold">{competitor.topKeywords?.length || 0}</span>
                      </div>
                    </div>
                    <a
                      href={competitor.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-4 text-blue-600 hover:underline text-sm font-semibold"
                    >
                      Visit Website →
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* Opportunities Summary */}
            <div className="grid grid-cols-4 gap-4 mb-8">
              <div className="bg-green-50 border border-green-200 p-6 rounded-lg">
                <div className="text-3xl font-bold text-green-600">{analysis.opportunities.totalOpportunities}</div>
                <div className="text-gray-600 text-sm">Total Opportunities</div>
              </div>
              <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
                <div className="text-3xl font-bold text-blue-600">{analysis.opportunities.highPriorityCount}</div>
                <div className="text-gray-600 text-sm">High Priority (Volume &gt; 1K)</div>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg">
                <div className="text-3xl font-bold text-yellow-600">{analysis.opportunities.mediumPriorityCount}</div>
                <div className="text-gray-600 text-sm">Medium Priority (Vol 500-1K)</div>
              </div>
              <div className="bg-gray-50 border border-gray-200 p-6 rounded-lg">
                <div className="text-3xl font-bold text-gray-600">{analysis.gaps.serviceGaps.length}</div>
                <div className="text-gray-600 text-sm">Service Gaps Found</div>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-2 mb-8 border-b">
              {(['opportunities', 'gaps', 'comparison', 'recommendations'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSelectedTab(tab)}
                  className={`px-6 py-3 font-semibold transition capitalize ${
                    selectedTab === tab
                      ? 'border-b-2 border-blue-600 text-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            {selectedTab === 'opportunities' && (
              <div className="space-y-3 mb-8">
                <h3 className="text-lg font-bold mb-4">Top Keyword Opportunities</h3>
                <p className="text-sm text-gray-600 mb-4">
                  These keywords competitors rank for, but we don't - ranked by opportunity score (volume / difficulty)
                </p>
                {analysis.opportunities.topOpportunities
                  .filter((o) => o.theyRankFor && !o.weRankFor)
                  .slice(0, 30)
                  .map((opportunity, idx) => (
                    <div key={idx} className="border rounded-lg p-4 hover:bg-gray-50 transition">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold text-lg">{opportunity.keyword}</h4>
                          <p className="text-xs text-gray-500">
                            Opportunity Score: {opportunity.opportunity.toFixed(0)}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-blue-600">{opportunity.searchVolume}</div>
                          <div className="text-xs text-gray-600">monthly searches</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-3 mt-3">
                        <div className="bg-blue-50 p-2 rounded">
                          <div className="text-xs text-gray-600">Difficulty</div>
                          <div className="font-semibold">{opportunity.difficulty}</div>
                        </div>
                        <div className="bg-green-50 p-2 rounded">
                          <div className="text-xs text-gray-600">Easy to Rank?</div>
                          <div className="font-semibold text-green-600">{opportunity.difficulty < 40 ? 'Yes ✓' : 'Hard'}</div>
                        </div>
                        <button className="bg-indigo-50 p-2 rounded hover:bg-indigo-100 transition">
                          <div className="text-xs text-gray-600">Action</div>
                          <div className="font-semibold text-indigo-600">Create →</div>
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}

            {selectedTab === 'gaps' && (
              <div className="space-y-6 mb-8">
                <div>
                  <h3 className="text-lg font-bold mb-4">Service Gaps</h3>
                  <p className="text-sm text-gray-600 mb-4">Services competitors offer that we don't have</p>
                  <div className="space-y-2">
                    {analysis.gaps.serviceGaps.slice(0, 15).map((gap, idx) => (
                      <div key={idx} className={`border rounded-lg p-3 flex justify-between items-center ${gap.priority === 'high' ? 'bg-red-50' : 'bg-yellow-50'}`}>
                        <div>
                          <div className="font-semibold">{gap.serviceType}</div>
                          <div className="text-xs text-gray-600">{gap.location}</div>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                            gap.priority === 'high'
                              ? 'bg-red-200 text-red-800'
                              : gap.priority === 'medium'
                              ? 'bg-yellow-200 text-yellow-800'
                              : 'bg-gray-200 text-gray-800'
                          }`}
                        >
                          {gap.priority} Priority
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {selectedTab === 'comparison' && (
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="border rounded-lg p-6">
                  <h3 className="font-bold text-lg mb-4">They Rank For (We Don't)</h3>
                  <p className="text-sm text-gray-600 mb-4">{analysis.comparison.theyRankForButWeDont.length} keywords</p>
                  <div className="space-y-1 max-h-96 overflow-y-auto">
                    {analysis.comparison.theyRankForButWeDont.slice(0, 20).map((keyword, idx) => (
                      <div key={idx} className="text-sm bg-red-50 p-2 rounded">
                        {keyword}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="border rounded-lg p-6">
                  <h3 className="font-bold text-lg mb-4">We Rank For (They Don't)</h3>
                  <p className="text-sm text-gray-600 mb-4">{analysis.comparison.weRankForButTheyDont.length} keywords</p>
                  <div className="space-y-1 max-h-96 overflow-y-auto">
                    {analysis.comparison.weRankForButTheyDont.slice(0, 20).map((keyword, idx) => (
                      <div key={idx} className="text-sm bg-green-50 p-2 rounded">
                        {keyword}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {selectedTab === 'recommendations' && (
              <div className="space-y-3 mb-8">
                <h3 className="text-lg font-bold mb-4">Recommended Actions</h3>
                {analysis.recommendations.map((rec, idx) => (
                  <div key={idx} className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">→</div>
                      <div>
                        <p className="font-semibold text-gray-900">{rec}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">No competitor analysis available yet.</p>
            <button
              onClick={handleRunAnalysis}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700"
            >
              Run First Analysis
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
