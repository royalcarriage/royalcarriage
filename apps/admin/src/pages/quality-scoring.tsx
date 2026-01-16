import React, { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useAuth } from '../state/AuthProvider';

interface QualityScore {
  contentId: string;
  overallScore: number;
  scores: {
    keywordDensity: number;
    readability: number;
    contentLength: number;
    structure: number;
    seoOptimization: number;
    originality: number;
    engagement: number;
  };
  recommendations: string[];
  shouldRegenerate: boolean;
  websiteId: string;
  locationId: string;
  serviceId: string;
}

interface SummaryStats {
  avgScore: number;
  totalScored: number;
  distribution: {
    excellent: number;
    good: number;
    fair: number;
    poor: number;
  };
  lowestScoring: Array<{
    contentId: string;
    score: number;
    location: string;
    service: string;
  }>;
  highestScoring: Array<{
    contentId: string;
    score: number;
    location: string;
    service: string;
  }>;
}

export default function QualityScoringPage() {
  const { user, role } = useAuth();
  const [loading, setLoading] = useState(true);
  const [scoring, setScoring] = useState(false);
  const [summary, setSummary] = useState<SummaryStats | null>(null);
  const [selectedWebsite, setSelectedWebsite] = useState<string>('all');
  const [autoApprovalThreshold, setAutoApprovalThreshold] = useState(80);
  const [regenerationThreshold, setRegenerationThreshold] = useState(50);
  const [expandedMetrics, setExpandedMetrics] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (role !== 'admin' && role !== 'superadmin') {
      return;
    }
    loadSummary();
  }, [role, selectedWebsite]);

  async function loadSummary() {
    try {
      setLoading(true);
      // Load quality scores from Firestore
      let q;
      if (selectedWebsite === 'all') {
        q = query(collection(db, 'content_quality_scores'));
      } else {
        q = query(collection(db, 'content_quality_scores'), where('websiteId', '==', selectedWebsite));
      }

      const snapshot = await getDocs(q);
      const scores = snapshot.docs.map((doc) => doc.data() as QualityScore);

      if (scores.length === 0) {
        setSummary({
          avgScore: 0,
          totalScored: 0,
          distribution: { excellent: 0, good: 0, fair: 0, poor: 0 },
          lowestScoring: [],
          highestScoring: [],
        });
        return;
      }

      const overallScores = scores.map((s) => s.overallScore);
      const avgScore = Math.round(overallScores.reduce((a, b) => a + b) / overallScores.length);

      const excellent = scores.filter((s) => s.overallScore >= 90).length;
      const good = scores.filter((s) => s.overallScore >= 75 && s.overallScore < 90).length;
      const fair = scores.filter((s) => s.overallScore >= 50 && s.overallScore < 75).length;
      const poor = scores.filter((s) => s.overallScore < 50).length;

      const lowestScoring = scores
        .sort((a, b) => a.overallScore - b.overallScore)
        .slice(0, 10)
        .map((s) => ({
          contentId: s.contentId,
          score: s.overallScore,
          location: s.locationId,
          service: s.serviceId,
        }));

      const highestScoring = scores
        .sort((a, b) => b.overallScore - a.overallScore)
        .slice(0, 10)
        .map((s) => ({
          contentId: s.contentId,
          score: s.overallScore,
          location: s.locationId,
          service: s.serviceId,
        }));

      setSummary({
        avgScore,
        totalScored: scores.length,
        distribution: {
          excellent,
          good,
          fair,
          poor,
        },
        lowestScoring,
        highestScoring,
      });
    } catch (error) {
      console.error('Error loading summary:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleScoreAll() {
    setScoring(true);
    try {
      // Call Cloud Function to score all content
      const response = await fetch('/.netlify/functions/bulk-score-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          websiteId: selectedWebsite === 'all' ? undefined : selectedWebsite,
          maxItems: 500,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      alert(
        `Scored ${result.scoredCount} items. Average: ${result.avgScore}/100. Items needing regeneration: ${result.regenerateCount}`
      );
      setScoring(false);
      loadSummary();
    } catch (error) {
      console.error('Error scoring:', error);
      alert('Failed to score content. Check console for details.');
      setScoring(false);
    }
  }

  function getScoreColor(score: number): string {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-blue-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  }

  function getScoreBgColor(score: number): string {
    if (score >= 90) return 'bg-green-50';
    if (score >= 75) return 'bg-blue-50';
    if (score >= 50) return 'bg-yellow-50';
    return 'bg-red-50';
  }

  if (role !== 'admin' && role !== 'superadmin') {
    return <div className="p-8">Access Denied. Admins only.</div>;
  }

  return (
    <div className="p-8 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Content Quality Scoring</h1>
          <p className="text-gray-600">
            Evaluate all generated content quality and identify items needing improvement
          </p>
        </div>

        {/* Website Filter */}
        <div className="mb-8 flex gap-4">
          <select
            value={selectedWebsite}
            onChange={(e) => setSelectedWebsite(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="all">All Websites</option>
            <option value="airport">Airport</option>
            <option value="corporate">Corporate</option>
            <option value="wedding">Wedding</option>
            <option value="partyBus">Party Bus</option>
          </select>
          <button
            onClick={handleScoreAll}
            disabled={scoring}
            className={`px-6 py-2 rounded-lg font-bold text-white transition ${
              scoring ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {scoring ? 'Scoring All...' : 'Score All Content'}
          </button>
        </div>

        {/* Main Metrics */}
        {loading ? (
          <div className="text-center py-12">Loading quality data...</div>
        ) : summary ? (
          <>
            <div className="grid grid-cols-5 gap-4 mb-8">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
                <div className={`text-4xl font-bold ${getScoreColor(summary.avgScore)}`}>{summary.avgScore}</div>
                <div className="text-gray-600 mt-1">Average Score</div>
                <div className="text-xs text-gray-500 mt-1">{summary.totalScored} items</div>
              </div>

              <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                <div className="text-4xl font-bold text-green-600">{summary.distribution.excellent}</div>
                <div className="text-gray-600 text-sm">Excellent (90-100)</div>
                <div className="text-xs text-gray-500 mt-1">
                  {summary.totalScored > 0
                    ? Math.round((summary.distribution.excellent / summary.totalScored) * 100)
                    : 0}
                  %
                </div>
              </div>

              <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                <div className="text-4xl font-bold text-blue-600">{summary.distribution.good}</div>
                <div className="text-gray-600 text-sm">Good (75-89)</div>
                <div className="text-xs text-gray-500 mt-1">
                  {summary.totalScored > 0 ? Math.round((summary.distribution.good / summary.totalScored) * 100) : 0}%
                </div>
              </div>

              <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
                <div className="text-4xl font-bold text-yellow-600">{summary.distribution.fair}</div>
                <div className="text-gray-600 text-sm">Fair (50-74)</div>
                <div className="text-xs text-gray-500 mt-1">
                  {summary.totalScored > 0 ? Math.round((summary.distribution.fair / summary.totalScored) * 100) : 0}%
                </div>
              </div>

              <div className="bg-red-50 p-6 rounded-lg border border-red-200">
                <div className="text-4xl font-bold text-red-600">{summary.distribution.poor}</div>
                <div className="text-gray-600 text-sm">Poor (&lt;50)</div>
                <div className="text-xs text-gray-500 mt-1">
                  {summary.totalScored > 0 ? Math.round((summary.distribution.poor / summary.totalScored) * 100) : 0}%
                </div>
              </div>
            </div>

            {/* Quality Distribution Chart */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 border rounded-lg p-6 mb-8">
              <h3 className="font-bold text-lg mb-4">Score Distribution</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Excellent (90-100)</span>
                    <span className="text-sm font-medium">{summary.distribution.excellent}</span>
                  </div>
                  <div className="w-full bg-gray-300 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-green-600 h-full transition-all"
                      style={{
                        width: `${summary.totalScored > 0 ? (summary.distribution.excellent / summary.totalScored) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Good (75-89)</span>
                    <span className="text-sm font-medium">{summary.distribution.good}</span>
                  </div>
                  <div className="w-full bg-gray-300 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-blue-600 h-full transition-all"
                      style={{
                        width: `${summary.totalScored > 0 ? (summary.distribution.good / summary.totalScored) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Fair (50-74)</span>
                    <span className="text-sm font-medium">{summary.distribution.fair}</span>
                  </div>
                  <div className="w-full bg-gray-300 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-yellow-600 h-full transition-all"
                      style={{
                        width: `${summary.totalScored > 0 ? (summary.distribution.fair / summary.totalScored) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Poor (&lt;50)</span>
                    <span className="text-sm font-medium">{summary.distribution.poor}</span>
                  </div>
                  <div className="w-full bg-gray-300 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-red-600 h-full transition-all"
                      style={{
                        width: `${summary.totalScored > 0 ? (summary.distribution.poor / summary.totalScored) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Settings */}
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6 mb-8">
              <h3 className="font-bold text-lg mb-4">Scoring Thresholds</h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Auto-Approval Threshold: {autoApprovalThreshold}
                  </label>
                  <input
                    type="range"
                    min="50"
                    max="95"
                    step="5"
                    value={autoApprovalThreshold}
                    onChange={(e) => setAutoApprovalThreshold(parseInt(e.target.value))}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-600 mt-2">
                    Items scoring {autoApprovalThreshold}+ automatically approved
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Regeneration Threshold: {regenerationThreshold}
                  </label>
                  <input
                    type="range"
                    min="20"
                    max="60"
                    step="5"
                    value={regenerationThreshold}
                    onChange={(e) => setRegenerationThreshold(parseInt(e.target.value))}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-600 mt-2">Items scoring below {regenerationThreshold} marked for regeneration</p>
                </div>
              </div>
            </div>

            {/* Two Column Layout: Lowest vs Highest */}
            <div className="grid grid-cols-2 gap-6">
              {/* Lowest Scoring Items */}
              <div>
                <h2 className="text-2xl font-bold mb-4">Items Needing Improvement</h2>
                <div className="space-y-3">
                  {summary.lowestScoring.map((item, idx) => (
                    <div key={idx} className={`${getScoreBgColor(item.score)} border rounded-lg p-4`}>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold text-gray-800">{item.location}</h4>
                          <p className="text-xs text-gray-600">{item.service}</p>
                        </div>
                        <span className={`text-2xl font-bold ${getScoreColor(item.score)}`}>{item.score}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-full rounded-full transition-all ${
                            item.score >= 90
                              ? 'bg-green-600'
                              : item.score >= 75
                              ? 'bg-blue-600'
                              : item.score >= 50
                              ? 'bg-yellow-600'
                              : 'bg-red-600'
                          }`}
                          style={{ width: `${item.score}%` }}
                        />
                      </div>
                      <div className="mt-2 text-xs text-gray-600">
                        {item.score < 50 && <span className="text-red-600 font-semibold">⚠️ Mark for regeneration</span>}
                        {item.score >= 50 && item.score < 75 && <span className="text-yellow-600">⚠️ Review recommended</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Highest Scoring Items */}
              <div>
                <h2 className="text-2xl font-bold mb-4">Excellent Content Examples</h2>
                <div className="space-y-3">
                  {summary.highestScoring.map((item, idx) => (
                    <div key={idx} className={`${getScoreBgColor(item.score)} border rounded-lg p-4`}>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold text-gray-800">{item.location}</h4>
                          <p className="text-xs text-gray-600">{item.service}</p>
                        </div>
                        <span className={`text-2xl font-bold ${getScoreColor(item.score)}`}>{item.score}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-full rounded-full transition-all"
                          style={{ width: `${item.score}%` }}
                        />
                      </div>
                      <div className="mt-2 text-xs text-gray-600">✓ Excellent quality - ready for publishing</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
