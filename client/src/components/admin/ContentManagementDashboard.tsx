import React, { useState } from 'react';
import { FileText, Edit, Trash2, Eye, Plus, Filter, Search } from 'lucide-react';

interface Page {
  id: string;
  title: string;
  slug: string;
  status: 'published' | 'draft' | 'scheduled';
  seoScore: number;
  profitScore: number;
  wordCount: number;
  lastModified: string;
}

const ContentManagementDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'pages' | 'drafts' | 'city-manager'>('pages');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft' | 'scheduled'>('all');

  // Sample data
  const pages: Page[] = [
    {
      id: '1',
      title: 'O\'Hare Airport Limousine Service',
      slug: '/ohare-airport-limo',
      status: 'published',
      seoScore: 92,
      profitScore: 95,
      wordCount: 1847,
      lastModified: '2 hours ago'
    },
    {
      id: '2',
      title: 'Midway Airport Car Service',
      slug: '/midway-airport-limo',
      status: 'published',
      seoScore: 88,
      profitScore: 91,
      wordCount: 1654,
      lastModified: '1 day ago'
    },
    {
      id: '3',
      title: 'Chicago Wedding Transportation',
      slug: '/wedding-transportation',
      status: 'draft',
      seoScore: 0,
      profitScore: 89,
      wordCount: 842,
      lastModified: '3 days ago'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const filteredPages = pages.filter(page => {
    const matchesSearch = page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          page.slug.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || page.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Content Management</h2>
          <p className="text-gray-600">Manage pages, drafts, and city content</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Plus className="w-4 h-4" />
          New Page
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('pages')}
          className={`px-4 py-2 border-b-2 transition-colors ${
            activeTab === 'pages'
              ? 'border-blue-600 text-blue-600 font-medium'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Pages ({pages.filter(p => p.status === 'published').length})
        </button>
        <button
          onClick={() => setActiveTab('drafts')}
          className={`px-4 py-2 border-b-2 transition-colors ${
            activeTab === 'drafts'
              ? 'border-blue-600 text-blue-600 font-medium'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Drafts ({pages.filter(p => p.status === 'draft').length})
        </button>
        <button
          onClick={() => setActiveTab('city-manager')}
          className={`px-4 py-2 border-b-2 transition-colors ${
            activeTab === 'city-manager'
              ? 'border-blue-600 text-blue-600 font-medium'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          City Manager
        </button>
      </div>

      {/* Search and Filter */}
      {activeTab !== 'city-manager' && (
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search pages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled</option>
          </select>
        </div>
      )}

      {/* Content */}
      {activeTab === 'pages' || activeTab === 'drafts' ? (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Page
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SEO Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Profit Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Words
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Modified
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPages
                .filter(page => activeTab === 'pages' ? page.status === 'published' : page.status === 'draft')
                .map((page) => (
                  <tr key={page.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{page.title}</div>
                        <div className="text-sm text-gray-500">{page.slug}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(page.status)}`}>
                        {page.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-semibold ${getScoreColor(page.seoScore)}`}>
                        {page.seoScore > 0 ? page.seoScore : '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-semibold ${getScoreColor(page.profitScore)}`}>
                        {page.profitScore}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-900">
                      {page.wordCount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {page.lastModified}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-1 text-gray-400 hover:text-blue-600" title="Preview">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-green-600" title="Edit">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-red-600" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>

          {filteredPages.filter(page => activeTab === 'pages' ? page.status === 'published' : page.status === 'draft').length === 0 && (
            <div className="px-6 py-12 text-center text-gray-500">
              No {activeTab} found{searchQuery ? ' matching your search' : ''}
            </div>
          )}
        </div>
      ) : (
        // City Manager Tab
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">City Manager</h3>
            <p className="text-gray-600 mb-6">
              Batch create and manage city-specific service pages.
            </p>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Generate City Pages
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentManagementDashboard;
