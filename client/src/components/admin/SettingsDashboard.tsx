import React, { useState } from "react";
import { Settings as SettingsIcon, Save, Info } from "lucide-react";

const SettingsDashboard: React.FC = () => {
  const [businessInfo, setBusinessInfo] = useState({
    name: "Royal Carriage",
    phone: "(312) 555-0100",
    email: "info@royalcarriage.com",
    address: "123 Main St, Chicago, IL 60601",
    serviceRadius: "50",
    rating: "4.8",
    reviewCount: "200",
  });

  const [thresholds, setThresholds] = useState({
    minWordCount: "1200",
    minSeoScore: "70",
    minProfitScore: "65",
    excellentRoas: "5.0",
    acceptableRoas: "2.0",
  });

  const [llmConfig, setLlmConfig] = useState({
    model: "gpt-4",
    temperature: "0.7",
    maxTokens: "2000",
    topicProposalPrompt: "Generate SEO topics...",
    contentGenerationPrompt: "Write comprehensive content...",
  });

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
          <p className="text-gray-600">
            Configure business info, thresholds, and LLM settings
          </p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          <Save className="w-4 h-4" />
          {saved ? "Saved!" : "Save All"}
        </button>
      </div>

      {saved && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
          <Save className="w-5 h-5 text-green-600" />
          <span className="text-green-900 font-medium">
            Settings saved successfully!
          </span>
        </div>
      )}

      {/* Business Information */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-6">
          <SettingsIcon className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Business Information
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Business Name
            </label>
            <input
              type="text"
              value={businessInfo.name}
              onChange={(e) =>
                setBusinessInfo({ ...businessInfo, name: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              value={businessInfo.phone}
              onChange={(e) =>
                setBusinessInfo({ ...businessInfo, phone: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={businessInfo.email}
              onChange={(e) =>
                setBusinessInfo({ ...businessInfo, email: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Service Radius (miles)
            </label>
            <input
              type="number"
              value={businessInfo.serviceRadius}
              onChange={(e) =>
                setBusinessInfo({
                  ...businessInfo,
                  serviceRadius: e.target.value,
                })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Business Address
            </label>
            <input
              type="text"
              value={businessInfo.address}
              onChange={(e) =>
                setBusinessInfo({ ...businessInfo, address: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Average Rating
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="5"
              value={businessInfo.rating}
              onChange={(e) =>
                setBusinessInfo({ ...businessInfo, rating: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Review Count
            </label>
            <input
              type="number"
              value={businessInfo.reviewCount}
              onChange={(e) =>
                setBusinessInfo({
                  ...businessInfo,
                  reviewCount: e.target.value,
                })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Quality Thresholds */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-6">
          <Info className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Quality Thresholds
          </h3>
        </div>

        <div className="space-y-6">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              These thresholds determine content quality gates and profit-first
              prioritization. Adjust based on your competitive analysis and ROI
              targets.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Word Count
              </label>
              <input
                type="number"
                value={thresholds.minWordCount}
                onChange={(e) =>
                  setThresholds({ ...thresholds, minWordCount: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Minimum for SEO pages (competitor avg: 1500-3000)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum SEO Score
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={thresholds.minSeoScore}
                onChange={(e) =>
                  setThresholds({ ...thresholds, minSeoScore: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Required score before publishing
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Profit Score
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={thresholds.minProfitScore}
                onChange={(e) =>
                  setThresholds({
                    ...thresholds,
                    minProfitScore: e.target.value,
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Minimum for topic prioritization
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Excellent ROAS Threshold
              </label>
              <input
                type="number"
                step="0.1"
                value={thresholds.excellentRoas}
                onChange={(e) =>
                  setThresholds({
                    ...thresholds,
                    excellentRoas: e.target.value,
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                ROAS considered excellent (scale opportunities)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Acceptable ROAS Threshold
              </label>
              <input
                type="number"
                step="0.1"
                value={thresholds.acceptableRoas}
                onChange={(e) =>
                  setThresholds({
                    ...thresholds,
                    acceptableRoas: e.target.value,
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Minimum ROAS to continue (fix or pause)
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* LLM Configuration */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-6">
          <SettingsIcon className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            LLM Configuration
          </h3>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Model
              </label>
              <select
                value={llmConfig.model}
                onChange={(e) =>
                  setLlmConfig({ ...llmConfig, model: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="gpt-4">GPT-4</option>
                <option value="gpt-4-turbo">GPT-4 Turbo</option>
                <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                <option value="claude-3">Claude 3</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Temperature
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="2"
                value={llmConfig.temperature}
                onChange={(e) =>
                  setLlmConfig({ ...llmConfig, temperature: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                0 = deterministic, 2 = creative
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Tokens
              </label>
              <input
                type="number"
                value={llmConfig.maxTokens}
                onChange={(e) =>
                  setLlmConfig({ ...llmConfig, maxTokens: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Topic Proposal System Prompt
            </label>
            <textarea
              value={llmConfig.topicProposalPrompt}
              onChange={(e) =>
                setLlmConfig({
                  ...llmConfig,
                  topicProposalPrompt: e.target.value,
                })
              }
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content Generation System Prompt
            </label>
            <textarea
              value={llmConfig.contentGenerationPrompt}
              onChange={(e) =>
                setLlmConfig({
                  ...llmConfig,
                  contentGenerationPrompt: e.target.value,
                })
              }
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
            />
          </div>
        </div>
      </div>

      {/* Save Button (Bottom) */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
        >
          <Save className="w-5 h-5" />
          {saved ? "All Settings Saved!" : "Save All Settings"}
        </button>
      </div>
    </div>
  );
};

export default SettingsDashboard;
