import React, { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, query, where, updateDoc, doc } from 'firebase/firestore';
import { useAuth } from '../state/AuthProvider';

interface ApprovalItem {
  id: string;
  serviceId: string;
  locationId: string;
  websiteId: string;
  title: string;
  metaDescription: string;
  content: string;
  keywords: string[];
  status: 'pending' | 'approved' | 'rejected';
  generatedAt: string;
  aiQualityScore?: number;
}

export default function ContentApprovalPage() {
  const { user, role } = useAuth();
  const [content, setContent] = useState<ApprovalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContent, setSelectedContent] = useState<ApprovalItem | null>(null);
  const [filter, setFilter] = useState<'pending' | 'all'>('pending');
  const [feedback, setFeedback] = useState('');
  const [bulkApproveCount, setBulkApproveCount] = useState(10);

  useEffect(() => {
    if (role !== 'admin' && role !== 'superadmin') {
      return;
    }
    loadContent();
  }, [filter, role]);

  async function loadContent() {
    try {
      setLoading(true);
      const q = filter === 'pending'
        ? query(collection(db, 'service_content'), where('approvalStatus', '==', 'pending'))
        : collection(db, 'service_content');

      const snapshot = await getDocs(q);
      const items = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as ApprovalItem[];

      setContent(items);
    } catch (error) {
      console.error('Error loading content:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(item: ApprovalItem) {
    try {
      const contentRef = doc(db, 'service_content', item.id);
      await updateDoc(contentRef, {
        approvalStatus: 'approved',
        approvedAt: new Date(),
        approvedBy: user?.email,
      });

      setContent(content.filter((c) => c.id !== item.id));
      setSelectedContent(null);
    } catch (error) {
      console.error('Error approving content:', error);
    }
  }

  async function handleReject(item: ApprovalItem) {
    try {
      const contentRef = doc(db, 'service_content', item.id);
      await updateDoc(contentRef, {
        approvalStatus: 'rejected',
        rejectedAt: new Date(),
        rejectionFeedback: feedback,
        rejectedBy: user?.email,
      });

      setContent(content.filter((c) => c.id !== item.id));
      setSelectedContent(null);
      setFeedback('');
    } catch (error) {
      console.error('Error rejecting content:', error);
    }
  }

  async function handleBulkApprove() {
    try {
      const itemsToApprove = content.slice(0, bulkApproveCount);

      for (const item of itemsToApprove) {
        const contentRef = doc(db, 'service_content', item.id);
        await updateDoc(contentRef, {
          approvalStatus: 'approved',
          approvedAt: new Date(),
          approvedBy: user?.email,
        });
      }

      loadContent();
    } catch (error) {
      console.error('Error bulk approving:', error);
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
          <h1 className="text-4xl font-bold mb-2">Content Approval Queue</h1>
          <p className="text-gray-600">
            Review and approve AI-generated content before publishing
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-blue-50 p-6 rounded-lg">
            <div className="text-3xl font-bold text-blue-600">{content.length}</div>
            <div className="text-gray-600">Pending Approval</div>
          </div>
          <div className="bg-green-50 p-6 rounded-lg">
            <div className="text-3xl font-bold text-green-600">
              {Math.round((content.length || 0) / 10) * 10}
            </div>
            <div className="text-gray-600">Estimated Total</div>
          </div>
          <div className="bg-purple-50 p-6 rounded-lg">
            <div className="text-3xl font-bold text-purple-600">4000+</div>
            <div className="text-gray-600">Final Pages</div>
          </div>
        </div>

        {/* Bulk Approve Section */}
        <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg mb-8">
          <h2 className="font-bold mb-4">Bulk Approve</h2>
          <div className="flex gap-4">
            <input
              type="number"
              min="1"
              max={content.length}
              value={bulkApproveCount}
              onChange={(e) => setBulkApproveCount(parseInt(e.target.value))}
              className="px-4 py-2 border rounded"
            />
            <button
              onClick={handleBulkApprove}
              className="px-6 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
            >
              Approve {bulkApproveCount} Items
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6 border-b">
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 ${
              filter === 'pending'
                ? 'border-b-2 border-blue-600 font-bold text-blue-600'
                : 'text-gray-600'
            }`}
          >
            Pending ({content.length})
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 ${
              filter === 'all'
                ? 'border-b-2 border-blue-600 font-bold text-blue-600'
                : 'text-gray-600'
            }`}
          >
            All Items
          </button>
        </div>

        {/* Content List */}
        {loading ? (
          <div className="text-center py-12">Loading content...</div>
        ) : (
          <div className="grid grid-cols-2 gap-6">
            {/* List */}
            <div>
              <div className="space-y-4">
                {content.slice(0, 20).map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedContent(item)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition ${
                      selectedContent?.id === item.id
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-bold text-sm mb-1">
                      {item.serviceId}
                    </div>
                    <div className="text-sm text-gray-600">{item.locationId}</div>
                    <div className="text-xs text-gray-400 mt-2">
                      {item.aiQualityScore && (
                        <div>
                          Quality Score:{' '}
                          <span className="text-blue-600 font-bold">
                            {(item.aiQualityScore * 100).toFixed(0)}%
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Preview */}
            {selectedContent ? (
              <div className="border rounded-lg p-6 bg-gray-50">
                <div className="mb-4">
                  <h3 className="text-lg font-bold mb-2">{selectedContent.title}</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {selectedContent.metaDescription}
                  </p>

                  <div className="bg-white p-4 rounded mb-4 max-h-60 overflow-y-auto">
                    <div
                      className="text-sm"
                      dangerouslySetInnerHTML={{
                        __html: selectedContent.content.substring(0, 500) + '...',
                      }}
                    />
                  </div>

                  <div className="mb-4">
                    <strong className="text-sm">Keywords:</strong>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedContent.keywords.slice(0, 5).map((kw, idx) => (
                        <span
                          key={idx}
                          className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                        >
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                  <button
                    onClick={() => handleApprove(selectedContent)}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-bold"
                  >
                    ✓ Approve Content
                  </button>

                  <div>
                    <textarea
                      placeholder="Feedback for rejection..."
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      className="w-full px-3 py-2 border rounded text-sm"
                      rows={3}
                    />
                    <button
                      onClick={() => handleReject(selectedContent)}
                      className="w-full mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 font-bold"
                    >
                      ✗ Reject Content
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="border rounded-lg p-6 bg-gray-50 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <p className="mb-2">Select content to review</p>
                  <p className="text-sm">{content.length} items pending</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
