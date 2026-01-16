/**
 * SEO Bot Dashboard Component
 * Manage content proposals, drafts, quality gates, and publishing
 */

import React, { useState } from "react";
import {
  FileText,
  CheckCircle,
  AlertTriangle,
  Play,
  Eye,
  Upload,
} from "lucide-react";

interface Topic {
  id: string;
  keyword: string;
  intent: string;
  profitScore: number;
  estimatedTraffic: number;
  status: "proposed" | "draft" | "quality_check" | "ready" | "published";
}

export function SEOBotDashboard() {
  const [topics, setTopics] = useState<Topic[]>([
    {
      id: "1",
      keyword: "ohare airport black car service cost",
      intent: "airport_ohare",
      profitScore: 92,
      estimatedTraffic: 850,
      status: "draft",
    },
    {
      id: "2",
      keyword: "chicago corporate car service rates",
      intent: "corporate_hourly",
      profitScore: 88,
      estimatedTraffic: 620,
      status: "quality_check",
    },
    {
      id: "3",
      keyword: "wedding transportation chicago suburbs",
      intent: "wedding_transport",
      profitScore: 85,
      estimatedTraffic: 410,
      status: "ready",
    },
  ]);

  const [activeTab, setActiveTab] = useState<
    "propose" | "drafts" | "quality" | "publish"
  >("drafts");

  const statusColors: Record<Topic["status"], string> = {
    proposed: "bg-blue-100 text-blue-800",
    draft: "bg-yellow-100 text-yellow-800",
    quality_check: "bg-orange-100 text-orange-800",
    ready: "bg-green-100 text-green-800",
    published: "bg-gray-100 text-gray-800",
  };

  const getStatusLabel = (status: Topic["status"]) => {
    const labels = {
      proposed: "Proposed",
      draft: "Draft",
      quality_check: "Quality Check",
      ready: "Ready",
      published: "Published",
    };
    return labels[status];
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">SEO Autobot</h2>
        <p className="text-gray-600 mt-1">
          Manage content proposals, drafts, and publishing workflow
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("propose")}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === "propose"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Propose Topics
        </button>
        <button
          onClick={() => setActiveTab("drafts")}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === "drafts"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Manage Drafts (
          {
            topics.filter(
              (t) => t.status === "draft" || t.status === "proposed",
            ).length
          }
          )
        </button>
        <button
          onClick={() => setActiveTab("quality")}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === "quality"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Quality Gates (
          {
            topics.filter(
              (t) => t.status === "quality_check" || t.status === "ready",
            ).length
          }
          )
        </button>
        <button
          onClick={() => setActiveTab("publish")}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === "publish"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Publish
        </button>
      </div>

      {/* Propose Topics Tab */}
      {activeTab === "propose" && (
        <div className="space-y-4">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4">
              Generate New Topic Proposals
            </h3>
            <p className="text-gray-600 mb-4">
              Analyzes keyword clusters, Moovs service mix, and profit model to
              propose high-value content topics.
            </p>
            <div className="flex gap-4">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                <Play className="w-4 h-4" />
                Run Topic Proposer
              </button>
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                View Settings
              </button>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">
              💡 Proposal Criteria
            </h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>
                • Profit score ≥70 (based on keyword ROAS + service margin)
              </li>
              <li>• Minimum 200 monthly searches (estimated)</li>
              <li>• No duplicate city/service combinations</li>
              <li>• Local value requirement for city pages</li>
              <li>• Limited to 25 proposals per run (safe scaling)</li>
            </ul>
          </div>
        </div>
      )}

      {/* Drafts Tab */}
      {activeTab === "drafts" && (
        <div className="space-y-4">
          {topics
            .filter((t) => t.status === "draft" || t.status === "proposed")
            .map((topic) => (
              <div
                key={topic.id}
                className="bg-white rounded-lg border border-gray-200 p-6"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold">{topic.keyword}</h3>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[topic.status]}`}
                      >
                        {getStatusLabel(topic.status)}
                      </span>
                    </div>
                    <div className="flex gap-4 text-sm text-gray-600">
                      <span>
                        Intent: <strong>{topic.intent}</strong>
                      </span>
                      <span>
                        Profit Score:{" "}
                        <strong className="text-green-600">
                          {topic.profitScore}/100
                        </strong>
                      </span>
                      <span>
                        Est. Traffic:{" "}
                        <strong>{topic.estimatedTraffic}/mo</strong>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <button className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" />
                    Review Draft
                  </button>
                  <button className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors flex items-center gap-1">
                    <Play className="w-3.5 h-3.5" />
                    Generate Content
                  </button>
                  <button className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors">
                    Edit
                  </button>
                </div>
              </div>
            ))}

          {topics.filter((t) => t.status === "draft" || t.status === "proposed")
            .length === 0 && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">
                No drafts available. Run the topic proposer to generate new
                content ideas.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Quality Gates Tab */}
      {activeTab === "quality" && (
        <div className="space-y-4">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4">
              Run Quality Gate Checks
            </h3>
            <p className="text-gray-600 mb-4">
              Validates content against Google spam policies, checks for
              duplicates, enforces word count minimums, and verifies
              schema/links.
            </p>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Run Quality Gate
            </button>
          </div>

          {topics
            .filter((t) => t.status === "quality_check" || t.status === "ready")
            .map((topic) => (
              <div
                key={topic.id}
                className="bg-white rounded-lg border border-gray-200 p-6"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold">{topic.keyword}</h3>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[topic.status]}`}
                      >
                        {getStatusLabel(topic.status)}
                      </span>
                    </div>
                  </div>
                </div>

                {topic.status === "ready" && (
                  <div className="bg-green-50 border border-green-200 rounded p-3 mb-4">
                    <div className="flex items-center gap-2 text-green-800">
                      <CheckCircle className="w-4 h-4" />
                      <span className="font-medium">
                        All quality gates passed
                      </span>
                    </div>
                  </div>
                )}

                {topic.status === "quality_check" && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-4">
                    <div className="flex items-center gap-2 text-yellow-800">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="font-medium">
                        Quality check in progress...
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <button className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                    View Report
                  </button>
                  <button className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors">
                    Re-run Check
                  </button>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Publish Tab */}
      {activeTab === "publish" && (
        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <h4 className="font-semibold text-yellow-900 mb-2">
              ⚠️ Publishing Safety
            </h4>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• All publishing is PR-based (no direct pushes to main)</li>
              <li>• Quality gates must pass before publishing</li>
              <li>• Manual review recommended for first 10 pages</li>
              <li>• Google spam policies enforced</li>
            </ul>
          </div>

          {topics
            .filter((t) => t.status === "ready")
            .map((topic) => (
              <div
                key={topic.id}
                className="bg-white rounded-lg border border-gray-200 p-6"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold">{topic.keyword}</h3>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[topic.status]}`}
                      >
                        {getStatusLabel(topic.status)}
                      </span>
                    </div>
                    <div className="flex gap-4 text-sm text-gray-600">
                      <span>
                        Profit Score:{" "}
                        <strong className="text-green-600">
                          {topic.profitScore}/100
                        </strong>
                      </span>
                      <span>
                        Target Site: <strong>Airport</strong>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button className="px-3 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex items-center gap-1">
                    <Upload className="w-3.5 h-3.5" />
                    Publish to PR
                  </button>
                  <button className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                    Preview
                  </button>
                  <button className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors">
                    View Quality Report
                  </button>
                </div>
              </div>
            ))}

          {topics.filter((t) => t.status === "ready").length === 0 && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">
                No content ready for publishing. Complete quality gates first.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
