import React, { useEffect, useState, useCallback } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, query, orderBy, doc, setDoc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useAuth } from '../state/AuthProvider';

interface KeywordOpportunity {
  keyword: string;
  searchVolume: number;
  difficulty: number;
  cpc: number;
  theyRankFor: boolean;
  weRankFor: boolean;
  opportunity: number;
}

interface ServiceGap {
  serviceType: string;
  location: string;
  theyHave: boolean;
  weHave: boolean;
  priority: 'high' | 'medium' | 'low';
}

interface LocationGap {
  serviceType: string;
  location: string;
  theyHave: boolean;
  weHave: boolean;
  priority: 'high' | 'medium' | 'low';
}

interface ActionItem {
  id: string;
  type: 'keyword' | 'service' | 'location';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in_progress' | 'completed';
  createdAt: Date;
  completedAt?: Date;
  keyword?: string;
  searchVolume?: number;
  difficulty?: number;
}

interface CompetitorAnalysisData {
  analysisId: string;
  analysisDate: Date;
  competitors: Array<{
    name: string;
    url: string;
    category: 'direct' | 'indirect' | 'local-pack';
    metrics: {
      estimatedTraffic: number;
      backlinks: number;
      dominatingRankings: number;
      topicsAuthority: string;
      contentQuality: string;
    };
    topKeywords: Array<{
      keyword: string;
      searchVolume: number;
      difficulty: number;
      cpc: number;
      position: number;
    }>;
    services: string[];
    locations: string[];
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
    serviceGaps: ServiceGap[];
    locationGaps: LocationGap[];
  };
  comparison: {
    theyRankForButWeDont: string[];
    weRankForButTheyDont: string[];
    commonKeywords: number;
  };
  recommendations: string[];
  duration: number;
}

type TabType = 'overview' | 'opportunities' | 'gaps' | 'comparison' | 'actions';

export default function CompetitorAnalysisPage() {
  const { user, role } = useAuth();
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<CompetitorAnalysisData | null>(null);
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [selectedTab, setSelectedTab] = useState<TabType>('overview');
  const [filterDifficulty, setFilterDifficulty] = useState<number>(100);
  const [filterVolume, setFilterVolume] = useState<number>(0);
  const [analysisDepth, setAnalysisDepth] = useState<'quick' | 'detailed'>('detailed');

  useEffect(() => {
    if (role !== 'admin' && role !== 'superadmin') {
      return;
    }
    loadLatestAnalysis();
    loadActionItems();
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

  async function loadActionItems() {
    try {
      const q = query(collection(db, 'competitor_action_items'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const items = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          createdAt: data.createdAt?.toDate?.() || new Date(),
          completedAt: data.completedAt?.toDate?.() || undefined,
        } as ActionItem;
      });
      setActionItems(items);
    } catch (error) {
      console.error('Error loading action items:', error);
    }
  }

  async function handleRunAnalysis() {
    setAnalyzing(true);
    try {
      const functions = getFunctions();
      const analyzeCompetitors = httpsCallable(functions, 'analyzeCompetitors');

      const result = await analyzeCompetitors({
        includeLocalPack: true,
        analysisDepth: analysisDepth,
      });

      const data = result.data as any;

      if (data.success) {
        alert(
          `Analysis complete! Found ${data.opportunities?.totalOpportunities || 0} keyword opportunities and ${data.gaps?.serviceGaps?.length || 0} service gaps.`
        );
        loadLatestAnalysis();
      } else {
        throw new Error('Analysis failed');
      }
    } catch (error: any) {
      console.error('Error running analysis:', error);
      alert(`Failed to run analysis: ${error.message || 'Check console for details.'}`);
    } finally {
      setAnalyzing(false);
    }
  }

  async function createActionItem(
    type: 'keyword' | 'service' | 'location',
    title: string,
    description: string,
    priority: 'high' | 'medium' | 'low',
    keyword?: string,
    searchVolume?: number,
    difficulty?: number
  ) {
    try {
      const id = `action-${Date.now()}`;
      const newItem: ActionItem = {
        id,
        type,
        title,
        description,
        priority,
        status: 'pending',
        createdAt: new Date(),
        keyword,
        searchVolume,
        difficulty,
      };

      await setDoc(doc(db, 'competitor_action_items', id), {
        ...newItem,
        createdAt: Timestamp.fromDate(newItem.createdAt),
      });

      setActionItems((prev) => [newItem, ...prev]);
      alert('Action item created successfully!');
    } catch (error) {
      console.error('Error creating action item:', error);
      alert('Failed to create action item');
    }
  }

  async function updateActionItemStatus(id: string, status: 'pending' | 'in_progress' | 'completed') {
    try {
      const updateData: any = { status };
      if (status === 'completed') {
        updateData.completedAt = Timestamp.fromDate(new Date());
      }

      await updateDoc(doc(db, 'competitor_action_items', id), updateData);

      setActionItems((prev) =>
        prev.map((item) =>
          item.id === id
            ? { ...item, status, completedAt: status === 'completed' ? new Date() : undefined }
            : item
        )
      );
    } catch (error) {
      console.error('Error updating action item:', error);
      alert('Failed to update action item');
    }
  }

  async function deleteActionItem(id: string) {
    if (!confirm('Are you sure you want to delete this action item?')) return;

    try {
      await deleteDoc(doc(db, 'competitor_action_items', id));
      setActionItems((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error('Error deleting action item:', error);
      alert('Failed to delete action item');
    }
  }

  function getPriorityColor(priority: string): string {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low':
        return 'text-gray-600 bg-gray-50 border-gray-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  }

  function getStatusColor(status: string): string {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50';
      case 'in_progress':
        return 'text-blue-600 bg-blue-50';
      case 'pending':
        return 'text-gray-600 bg-gray-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  }

  function getDifficultyColor(difficulty: number): string {
    if (difficulty <= 30) return 'text-green-600';
    if (difficulty <= 50) return 'text-yellow-600';
    if (difficulty <= 70) return 'text-orange-600';
    return 'text-red-600';
  }

  function getFilteredOpportunities(): KeywordOpportunity[] {
    if (!analysis?.opportunities?.topOpportunities) return [];
    return analysis.opportunities.topOpportunities
      .filter((o) => o.theyRankFor && !o.weRankFor)
      .filter((o) => o.difficulty <= filterDifficulty)
      .filter((o) => o.searchVolume >= filterVolume);
  }

  if (role !== 'admin' && role !== 'superadmin') {
    return <div className="p-8">Access Denied. Admins only.</div>;
  }

  return (
    <div className="p-8 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Competitor Keyword Analysis</h1>
          <p className="text-gray-600">
            Analyze competitor websites to identify keyword opportunities, service gaps, and content strategy insights
          </p>
        </div>

        {/* Action Bar */}
        <div className="mb-8 flex flex-wrap justify-between items-center gap-4 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center gap-4">
            <select
              value={analysisDepth}
              onChange={(e) => setAnalysisDepth(e.target.value as 'quick' | 'detailed')}
              className="px-4 py-2 border rounded-lg bg-white"
            >
              <option value="quick">Quick Analysis</option>
              <option value="detailed">Detailed Analysis</option>
            </select>
            <button
              onClick={handleRunAnalysis}
              disabled={analyzing}
              className={`px-6 py-3 rounded-lg font-bold text-white transition ${
                analyzing ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {analyzing ? 'Running Analysis...' : 'Run New Analysis'}
            </button>
          </div>
          {analysis && (
            <div className="text-sm text-gray-600">
              <span className="font-semibold">Last analyzed:</span>{' '}
              {new Date(analysis.analysisDate).toLocaleString()}
              {analysis.duration && (
                <span className="ml-2 text-xs text-gray-500">
                  ({(analysis.duration / 1000).toFixed(1)}s)
                </span>
              )}
            </div>
          )}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mb-4"></div>
            <p className="text-gray-600">Loading analysis data...</p>
          </div>
        ) : analysis ? (
          <>
            {/* Tab Navigation */}
            <div className="flex gap-1 mb-8 border-b overflow-x-auto">
              {([
                { id: 'overview', label: 'Overview' },
                { id: 'opportunities', label: 'Keyword Opportunities' },
                { id: 'gaps', label: 'Service & Location Gaps' },
                { id: 'comparison', label: 'Comparison' },
                { id: 'actions', label: `Action Items (${actionItems.filter((a) => a.status !== 'completed').length})` },
              ] as const).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id)}
                  className={`px-6 py-3 font-semibold transition whitespace-nowrap ${
                    selectedTab === tab.id
                      ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Overview Tab */}
            {selectedTab === 'overview' && (
              <>
                {/* Summary Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
                  <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 p-6 rounded-lg">
                    <div className="text-3xl font-bold text-green-600">
                      {analysis.opportunities.totalOpportunities}
                    </div>
                    <div className="text-gray-600 text-sm">Total Opportunities</div>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 p-6 rounded-lg">
                    <div className="text-3xl font-bold text-blue-600">
                      {analysis.opportunities.highPriorityCount}
                    </div>
                    <div className="text-gray-600 text-sm">High Priority</div>
                    <div className="text-xs text-gray-500">Volume &gt; 1K</div>
                  </div>
                  <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 p-6 rounded-lg">
                    <div className="text-3xl font-bold text-yellow-600">
                      {analysis.opportunities.mediumPriorityCount}
                    </div>
                    <div className="text-gray-600 text-sm">Medium Priority</div>
                    <div className="text-xs text-gray-500">Volume 500-1K</div>
                  </div>
                  <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 p-6 rounded-lg">
                    <div className="text-3xl font-bold text-red-600">
                      {(analysis.gaps?.serviceGaps?.length || 0) + (analysis.gaps?.locationGaps?.length || 0)}
                    </div>
                    <div className="text-gray-600 text-sm">Total Gaps</div>
                    <div className="text-xs text-gray-500">Service + Location</div>
                  </div>
                  <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200 p-6 rounded-lg">
                    <div className="text-3xl font-bold text-indigo-600">
                      {analysis.competitors.length}
                    </div>
                    <div className="text-gray-600 text-sm">Competitors Analyzed</div>
                  </div>
                </div>

                {/* Competitors Overview */}
                <div className="mb-8">
                  <h2 className="text-2xl font-bold mb-4">Analyzed Competitors</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {analysis.competitors.map((competitor, idx) => (
                      <div
                        key={idx}
                        className="border rounded-lg p-6 hover:shadow-lg transition bg-white"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="font-bold text-lg">{competitor.name}</h3>
                          <span
                            className={`px-2 py-1 text-xs rounded-full font-semibold ${
                              competitor.category === 'direct'
                                ? 'bg-red-100 text-red-700'
                                : competitor.category === 'local-pack'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {competitor.category}
                          </span>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Est. Traffic:</span>
                            <span className="font-semibold">
                              {(competitor.metrics?.estimatedTraffic || 0).toLocaleString()}/mo
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Backlinks:</span>
                            <span className="font-semibold">
                              {(competitor.metrics?.backlinks || 0).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Ranking Keywords:</span>
                            <span className="font-semibold">
                              {competitor.metrics?.dominatingRankings || 0}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Content Quality:</span>
                            <span
                              className={`font-semibold ${
                                competitor.metrics?.contentQuality === 'Excellent'
                                  ? 'text-green-600'
                                  : competitor.metrics?.contentQuality === 'Good'
                                  ? 'text-blue-600'
                                  : 'text-yellow-600'
                              }`}
                            >
                              {competitor.metrics?.contentQuality || 'N/A'}
                            </span>
                          </div>
                          <div className="pt-2 border-t mt-2">
                            <div className="text-gray-600 mb-1">Services ({competitor.services?.length || 0}):</div>
                            <div className="flex flex-wrap gap-1">
                              {competitor.services?.slice(0, 3).map((s, i) => (
                                <span key={i} className="text-xs bg-gray-100 px-2 py-1 rounded">
                                  {s}
                                </span>
                              ))}
                              {(competitor.services?.length || 0) > 3 && (
                                <span className="text-xs text-gray-500">
                                  +{(competitor.services?.length || 0) - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <a
                          href={competitor.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block mt-4 text-blue-600 hover:underline text-sm font-semibold"
                        >
                          Visit Website
                        </a>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommendations */}
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-6">
                  <h3 className="text-lg font-bold mb-4">AI Recommendations</h3>
                  <div className="space-y-3">
                    {analysis.recommendations.map((rec, idx) => (
                      <div
                        key={idx}
                        className="bg-white rounded-lg p-4 border border-indigo-100 flex items-start gap-3"
                      >
                        <span className="text-indigo-600 font-bold text-lg">{idx + 1}</span>
                        <p className="text-gray-800">{rec}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Keyword Opportunities Tab */}
            {selectedTab === 'opportunities' && (
              <div className="space-y-6">
                {/* Filters */}
                <div className="bg-gray-50 border rounded-lg p-4 flex flex-wrap gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Max Difficulty: {filterDifficulty}
                    </label>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      step="5"
                      value={filterDifficulty}
                      onChange={(e) => setFilterDifficulty(parseInt(e.target.value))}
                      className="w-48"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Min Volume: {filterVolume}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="2000"
                      step="100"
                      value={filterVolume}
                      onChange={(e) => setFilterVolume(parseInt(e.target.value))}
                      className="w-48"
                    />
                  </div>
                  <div className="flex items-end">
                    <span className="text-sm text-gray-600">
                      Showing {getFilteredOpportunities().length} of{' '}
                      {analysis.opportunities.topOpportunities.filter((o) => o.theyRankFor && !o.weRankFor).length}{' '}
                      opportunities
                    </span>
                  </div>
                </div>

                {/* Opportunities List */}
                <div className="space-y-3">
                  <h3 className="text-lg font-bold">Top Keyword Opportunities</h3>
                  <p className="text-sm text-gray-600">
                    Keywords competitors rank for that we don't - sorted by opportunity score (volume / difficulty)
                  </p>
                  {getFilteredOpportunities()
                    .slice(0, 30)
                    .map((opportunity, idx) => (
                      <div
                        key={idx}
                        className="border rounded-lg p-4 hover:shadow-md transition bg-white"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-semibold text-lg">{opportunity.keyword}</h4>
                            <p className="text-xs text-gray-500">
                              Opportunity Score: {opportunity.opportunity.toFixed(0)}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-blue-600">
                              {opportunity.searchVolume.toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-600">monthly searches</div>
                          </div>
                        </div>
                        <div className="grid grid-cols-4 gap-3">
                          <div className="bg-blue-50 p-3 rounded">
                            <div className="text-xs text-gray-600">Difficulty</div>
                            <div className={`font-bold ${getDifficultyColor(opportunity.difficulty)}`}>
                              {opportunity.difficulty}/100
                            </div>
                          </div>
                          <div className="bg-green-50 p-3 rounded">
                            <div className="text-xs text-gray-600">CPC</div>
                            <div className="font-bold text-green-600">
                              ${opportunity.cpc?.toFixed(2) || '0.00'}
                            </div>
                          </div>
                          <div className="bg-purple-50 p-3 rounded">
                            <div className="text-xs text-gray-600">Rankability</div>
                            <div
                              className={`font-bold ${
                                opportunity.difficulty < 40 ? 'text-green-600' : 'text-orange-600'
                              }`}
                            >
                              {opportunity.difficulty < 30
                                ? 'Easy'
                                : opportunity.difficulty < 50
                                ? 'Medium'
                                : 'Hard'}
                            </div>
                          </div>
                          <button
                            onClick={() =>
                              createActionItem(
                                'keyword',
                                `Create content for: ${opportunity.keyword}`,
                                `Target keyword with ${opportunity.searchVolume} monthly searches and difficulty ${opportunity.difficulty}`,
                                opportunity.difficulty < 40 ? 'high' : opportunity.difficulty < 60 ? 'medium' : 'low',
                                opportunity.keyword,
                                opportunity.searchVolume,
                                opportunity.difficulty
                              )
                            }
                            className="bg-indigo-50 p-3 rounded hover:bg-indigo-100 transition text-left"
                          >
                            <div className="text-xs text-gray-600">Action</div>
                            <div className="font-bold text-indigo-600">Add Task</div>
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Gaps Tab */}
            {selectedTab === 'gaps' && (
              <div className="space-y-8">
                {/* Service Gaps Visualization */}
                <div>
                  <h3 className="text-xl font-bold mb-4">Service Gap Analysis</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Services that competitors offer but we don't have content for
                  </p>

                  {/* Gap Priority Summary */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                      <div className="text-3xl font-bold text-red-600">
                        {analysis.gaps?.serviceGaps?.filter((g) => g.priority === 'high').length || 0}
                      </div>
                      <div className="text-sm text-gray-600">High Priority Gaps</div>
                    </div>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                      <div className="text-3xl font-bold text-yellow-600">
                        {analysis.gaps?.serviceGaps?.filter((g) => g.priority === 'medium').length || 0}
                      </div>
                      <div className="text-sm text-gray-600">Medium Priority Gaps</div>
                    </div>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                      <div className="text-3xl font-bold text-gray-600">
                        {analysis.gaps?.serviceGaps?.filter((g) => g.priority === 'low').length || 0}
                      </div>
                      <div className="text-sm text-gray-600">Low Priority Gaps</div>
                    </div>
                  </div>

                  {/* Service Gaps Visual Chart */}
                  <div className="bg-white border rounded-lg p-6 mb-6">
                    <h4 className="font-semibold mb-4">Service Coverage Comparison</h4>
                    <div className="space-y-3">
                      {['Airport Transfers', 'Corporate Services', 'Wedding Transportation', 'Party Bus', 'Executive Travel', 'Group Shuttles'].map(
                        (service) => {
                          const gap = analysis.gaps?.serviceGaps?.find((g) => g.serviceType === service);
                          const weHave = !gap || gap.weHave;
                          const theyHave = gap?.theyHave || false;

                          return (
                            <div key={service} className="flex items-center gap-4">
                              <div className="w-48 font-medium text-sm">{service}</div>
                              <div className="flex-1 flex items-center gap-2">
                                <div className="w-24 text-xs text-gray-500 text-right">Us:</div>
                                <div
                                  className={`h-6 rounded transition-all ${
                                    weHave ? 'bg-green-500 w-full' : 'bg-red-300 w-0'
                                  }`}
                                  style={{ minWidth: weHave ? '100%' : '0%' }}
                                />
                              </div>
                              <div className="flex-1 flex items-center gap-2">
                                <div className="w-24 text-xs text-gray-500 text-right">Competitors:</div>
                                <div
                                  className={`h-6 rounded transition-all ${
                                    theyHave ? 'bg-blue-500' : 'bg-gray-200'
                                  }`}
                                  style={{ width: theyHave ? '100%' : '0%' }}
                                />
                              </div>
                              {!weHave && theyHave && (
                                <button
                                  onClick={() =>
                                    createActionItem(
                                      'service',
                                      `Create ${service} content`,
                                      `Competitors offer this service but we don't have content for it`,
                                      gap?.priority || 'medium'
                                    )
                                  }
                                  className="px-3 py-1 bg-red-100 text-red-700 rounded text-xs font-semibold hover:bg-red-200 transition"
                                >
                                  Add Task
                                </button>
                              )}
                            </div>
                          );
                        }
                      )}
                    </div>
                  </div>

                  {/* Service Gaps List */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {analysis.gaps?.serviceGaps?.map((gap, idx) => (
                      <div
                        key={idx}
                        className={`border rounded-lg p-4 ${getPriorityColor(gap.priority)}`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold">{gap.serviceType}</h4>
                            <p className="text-sm text-gray-600">{gap.location}</p>
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
                            {gap.priority}
                          </span>
                        </div>
                        <div className="mt-3 flex gap-2">
                          <span
                            className={`text-xs px-2 py-1 rounded ${
                              gap.theyHave ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                            }`}
                          >
                            {gap.theyHave ? 'Competitors have it' : "Competitors don't have it"}
                          </span>
                          <span
                            className={`text-xs px-2 py-1 rounded ${
                              gap.weHave ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {gap.weHave ? 'We have it' : "We don't have it"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Location Gaps */}
                <div>
                  <h3 className="text-xl font-bold mb-4">Location Gap Analysis</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Locations that competitors target but we don't have content for
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {analysis.gaps?.locationGaps?.map((gap, idx) => (
                      <div
                        key={idx}
                        className={`border rounded-lg p-4 ${getPriorityColor(gap.priority)}`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold">{gap.location}</h4>
                            <p className="text-sm text-gray-600">{gap.serviceType}</p>
                          </div>
                          <button
                            onClick={() =>
                              createActionItem(
                                'location',
                                `Create content for ${gap.location}`,
                                `Competitors have content for ${gap.location} but we don't`,
                                gap.priority
                              )
                            }
                            className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs font-semibold hover:bg-indigo-200 transition"
                          >
                            Add Task
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Keyword Gaps */}
                <div>
                  <h3 className="text-xl font-bold mb-4">Keyword Gaps</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Easy-to-rank keywords (difficulty &lt; 50) that competitors rank for
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {analysis.gaps?.keywordGaps?.slice(0, 20).map((kw, idx) => (
                      <div key={idx} className="border rounded-lg p-3 bg-white hover:shadow-sm transition">
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="font-medium">{kw.keyword}</span>
                            <div className="text-xs text-gray-500 mt-1">
                              Volume: {kw.searchVolume} | Difficulty: {kw.difficulty}
                            </div>
                          </div>
                          <button
                            onClick={() =>
                              createActionItem(
                                'keyword',
                                `Target: ${kw.keyword}`,
                                `Easy keyword opportunity with ${kw.searchVolume} monthly searches`,
                                'high',
                                kw.keyword,
                                kw.searchVolume,
                                kw.difficulty
                              )
                            }
                            className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold hover:bg-green-200 transition"
                          >
                            Add Task
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Comparison Tab */}
            {selectedTab === 'comparison' && (
              <div className="space-y-6">
                {/* Summary */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                    <div className="text-3xl font-bold text-red-600">
                      {analysis.comparison.theyRankForButWeDont.length}
                    </div>
                    <div className="text-sm text-gray-600">They Rank, We Don't</div>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                    <div className="text-3xl font-bold text-green-600">
                      {analysis.comparison.weRankForButTheyDont.length}
                    </div>
                    <div className="text-sm text-gray-600">We Rank, They Don't</div>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                    <div className="text-3xl font-bold text-blue-600">
                      {analysis.comparison.commonKeywords}
                    </div>
                    <div className="text-sm text-gray-600">Common Keywords</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  {/* They Rank For */}
                  <div className="border rounded-lg p-6">
                    <h3 className="font-bold text-lg mb-2 text-red-600">They Rank For (We Don't)</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      {analysis.comparison.theyRankForButWeDont.length} keywords - opportunity to create content
                    </p>
                    <div className="space-y-1 max-h-96 overflow-y-auto">
                      {analysis.comparison.theyRankForButWeDont.slice(0, 25).map((keyword, idx) => (
                        <div
                          key={idx}
                          className="text-sm bg-red-50 p-2 rounded flex justify-between items-center"
                        >
                          <span>{keyword}</span>
                          <button
                            onClick={() =>
                              createActionItem(
                                'keyword',
                                `Target: ${keyword}`,
                                'Competitor ranks for this keyword',
                                'medium',
                                keyword
                              )
                            }
                            className="text-xs text-red-600 hover:underline"
                          >
                            + Task
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* We Rank For */}
                  <div className="border rounded-lg p-6">
                    <h3 className="font-bold text-lg mb-2 text-green-600">We Rank For (They Don't)</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      {analysis.comparison.weRankForButTheyDont.length} keywords - our competitive advantage
                    </p>
                    <div className="space-y-1 max-h-96 overflow-y-auto">
                      {analysis.comparison.weRankForButTheyDont.slice(0, 25).map((keyword, idx) => (
                        <div key={idx} className="text-sm bg-green-50 p-2 rounded">
                          {keyword}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Items Tab */}
            {selectedTab === 'actions' && (
              <div className="space-y-6">
                {/* Action Items Summary */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                  <div className="bg-gray-50 border rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-gray-600">
                      {actionItems.filter((a) => a.status === 'pending').length}
                    </div>
                    <div className="text-sm text-gray-500">Pending</div>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {actionItems.filter((a) => a.status === 'in_progress').length}
                    </div>
                    <div className="text-sm text-gray-500">In Progress</div>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {actionItems.filter((a) => a.status === 'completed').length}
                    </div>
                    <div className="text-sm text-gray-500">Completed</div>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {actionItems.filter((a) => a.priority === 'high' && a.status !== 'completed').length}
                    </div>
                    <div className="text-sm text-gray-500">High Priority</div>
                  </div>
                </div>

                {/* Action Items by Status */}
                {['pending', 'in_progress', 'completed'].map((status) => {
                  const items = actionItems.filter((a) => a.status === status);
                  if (items.length === 0) return null;

                  return (
                    <div key={status} className="mb-6">
                      <h3 className="text-lg font-bold mb-3 capitalize">
                        {status.replace('_', ' ')} ({items.length})
                      </h3>
                      <div className="space-y-3">
                        {items.map((item) => (
                          <div
                            key={item.id}
                            className={`border rounded-lg p-4 ${
                              item.status === 'completed' ? 'bg-gray-50 opacity-75' : 'bg-white'
                            }`}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span
                                    className={`px-2 py-0.5 rounded text-xs font-semibold ${
                                      item.type === 'keyword'
                                        ? 'bg-blue-100 text-blue-700'
                                        : item.type === 'service'
                                        ? 'bg-purple-100 text-purple-700'
                                        : 'bg-orange-100 text-orange-700'
                                    }`}
                                  >
                                    {item.type}
                                  </span>
                                  <span
                                    className={`px-2 py-0.5 rounded text-xs font-semibold ${
                                      item.priority === 'high'
                                        ? 'bg-red-100 text-red-700'
                                        : item.priority === 'medium'
                                        ? 'bg-yellow-100 text-yellow-700'
                                        : 'bg-gray-100 text-gray-700'
                                    }`}
                                  >
                                    {item.priority}
                                  </span>
                                </div>
                                <h4
                                  className={`font-semibold ${
                                    item.status === 'completed' ? 'line-through text-gray-500' : ''
                                  }`}
                                >
                                  {item.title}
                                </h4>
                                <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                                {item.searchVolume && (
                                  <div className="text-xs text-gray-500 mt-1">
                                    Volume: {item.searchVolume} | Difficulty: {item.difficulty}
                                  </div>
                                )}
                              </div>
                              <div className="flex gap-2 ml-4">
                                {item.status !== 'completed' && (
                                  <>
                                    {item.status === 'pending' && (
                                      <button
                                        onClick={() => updateActionItemStatus(item.id, 'in_progress')}
                                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200 transition"
                                      >
                                        Start
                                      </button>
                                    )}
                                    <button
                                      onClick={() => updateActionItemStatus(item.id, 'completed')}
                                      className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200 transition"
                                    >
                                      Complete
                                    </button>
                                  </>
                                )}
                                <button
                                  onClick={() => deleteActionItem(item.id)}
                                  className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200 transition"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                            <div className="text-xs text-gray-400 mt-2">
                              Created: {item.createdAt.toLocaleDateString()}
                              {item.completedAt && ` | Completed: ${item.completedAt.toLocaleDateString()}`}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}

                {actionItems.length === 0 && (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <p className="text-gray-600 mb-4">No action items yet.</p>
                    <p className="text-sm text-gray-500">
                      Browse the Opportunities or Gaps tabs to create action items for content creation.
                    </p>
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <div className="mb-6">
              <svg
                className="mx-auto h-16 w-16 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Competitor Analysis Available</h3>
            <p className="text-gray-600 mb-6">
              Run your first analysis to discover keyword opportunities and service gaps.
            </p>
            <button
              onClick={handleRunAnalysis}
              disabled={analyzing}
              className={`px-8 py-3 rounded-lg font-bold text-white transition ${
                analyzing ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {analyzing ? 'Running Analysis...' : 'Run First Analysis'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
