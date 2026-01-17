import React, { useEffect, useState } from "react";
import { db } from "../lib/firebase";
import {
  collection,
  getDocs,
  query,
  where,
  updateDoc,
  doc,
  addDoc,
  Timestamp,
} from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";
import { ensureFirebaseApp } from "../lib/firebaseClient";
import { useAuth } from "../state/AuthProvider";
import { AccessControl, AdminOnly } from "../components/AccessControl";
import { canPerformAction } from "../lib/permissions";
import { Lock, CheckCircle, XCircle, Loader2 } from "lucide-react";

interface ApprovalItem {
  id: string;
  serviceId: string;
  serviceName?: string;
  locationId: string;
  locationName?: string;
  websiteId: string;
  title: string;
  metaDescription: string;
  content: string;
  keywords: string[];
  status: "pending" | "approved" | "rejected";
  generatedAt: string;
  aiQualityScore?: number;
  approvalStatus?: "pending" | "approved" | "rejected";
}

export default function ContentApprovalPage() {
  const { user, role } = useAuth();
  const [content, setContent] = useState<ApprovalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContent, setSelectedContent] = useState<ApprovalItem | null>(
    null,
  );
  const [filter, setFilter] = useState<"pending" | "all">("pending");
  const [feedback, setFeedback] = useState("");
  const [bulkApproveCount, setBulkApproveCount] = useState(10);
  const [websiteFilter, setWebsiteFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (role !== "admin" && role !== "superadmin") {
      return;
    }
    loadContent();
  }, [filter, role]);

  async function loadContent() {
    try {
      setLoading(true);
      const q =
        filter === "pending"
          ? query(
              collection(db, "service_content"),
              where("approvalStatus", "==", "pending"),
            )
          : collection(db, "service_content");

      const snapshot = await getDocs(q);
      let items = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as ApprovalItem[];

      if (websiteFilter !== "all") {
        items = items.filter((item) => item.websiteId === websiteFilter);
      }

      if (dateFilter !== "all") {
        const now = new Date();
        const filterDate = new Date();

        if (dateFilter === "today") {
          filterDate.setHours(0, 0, 0, 0);
        } else if (dateFilter === "week") {
          filterDate.setDate(now.getDate() - 7);
        } else if (dateFilter === "month") {
          filterDate.setMonth(now.getMonth() - 1);
        }

        items = items.filter(
          (item) => new Date(item.generatedAt) >= filterDate,
        );
      }

      items.sort(
        (a, b) =>
          new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime(),
      );

      setContent(items);
    } catch (error) {
      console.error("Error loading content:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(item: ApprovalItem) {
    if (!canPerformAction(role, "approveContent")) {
      alert("You do not have permission to approve content");
      return;
    }

    try {
      const contentRef = doc(db, "service_content", item.id);
      await updateDoc(contentRef, {
        approvalStatus: "approved",
        approvedAt: new Date(),
        approvedBy: user?.email,
      });

      // Log activity
      await addDoc(collection(db, "activity_log"), {
        type: "content",
        message: `Approved content: ${item.serviceName || item.serviceId} - ${item.locationName || item.locationId}`,
        status: "success",
        userId: user?.uid,
        userEmail: user?.email,
        timestamp: Timestamp.now(),
      });

      setContent(content.filter((c) => c.id !== item.id));
      setSelectedContent(null);
    } catch (error) {
      console.error("Error approving content:", error);
      alert("Failed to approve content. Please try again.");
    }
  }

  async function handleReject(item: ApprovalItem) {
    if (!canPerformAction(role, "approveContent")) {
      alert("You do not have permission to reject content");
      return;
    }

    try {
      const contentRef = doc(db, "service_content", item.id);
      await updateDoc(contentRef, {
        approvalStatus: "rejected",
        rejectedAt: new Date(),
        rejectionFeedback: feedback,
        rejectedBy: user?.email,
      });

      // Log activity
      await addDoc(collection(db, "activity_log"), {
        type: "content",
        message: `Rejected content: ${item.serviceName || item.serviceId} - ${item.locationName || item.locationId}`,
        status: "error",
        userId: user?.uid,
        userEmail: user?.email,
        timestamp: Timestamp.now(),
      });

      setContent(content.filter((c) => c.id !== item.id));
      setSelectedContent(null);
      setFeedback("");
    } catch (error) {
      console.error("Error rejecting content:", error);
      alert("Failed to reject content. Please try again.");
    }
  }

  async function handleBulkApprove() {
    if (!canPerformAction(role, "approveContent")) {
      alert("You do not have permission to approve content");
      return;
    }

    try {
      const itemsToApprove =
        selectedItems.size > 0
          ? content.filter((item) => selectedItems.has(item.id))
          : content.slice(0, bulkApproveCount);

      for (const item of itemsToApprove) {
        const contentRef = doc(db, "service_content", item.id);
        await updateDoc(contentRef, {
          approvalStatus: "approved",
          approvedAt: new Date(),
          approvedBy: user?.email,
        });
      }

      // Log bulk activity
      await addDoc(collection(db, "activity_log"), {
        type: "content",
        message: `Bulk approved ${itemsToApprove.length} content items`,
        status: "success",
        userId: user?.uid,
        userEmail: user?.email,
        timestamp: Timestamp.now(),
      });

      setSelectedItems(new Set());
      loadContent();
      alert(`Successfully approved ${itemsToApprove.length} items`);
    } catch (error) {
      console.error("Error bulk approving:", error);
      alert("Failed to approve items. Check console for details.");
    }
  }

  async function handleBulkApproveQuality() {
    if (!canPerformAction(role, "approveContent")) {
      alert("You do not have permission to approve content");
      return;
    }

    try {
      const qualityThreshold = 0.75;
      const itemsToApprove = content.filter(
        (item) =>
          item.aiQualityScore && item.aiQualityScore >= qualityThreshold,
      );

      for (const item of itemsToApprove) {
        const contentRef = doc(db, "service_content", item.id);
        await updateDoc(contentRef, {
          approvalStatus: "approved",
          approvedAt: new Date(),
          approvedBy: user?.email,
        });
      }

      // Log activity
      await addDoc(collection(db, "activity_log"), {
        type: "ai",
        message: `Auto-approved ${itemsToApprove.length} high-quality content items (>= 75%)`,
        status: "success",
        userId: user?.uid,
        userEmail: user?.email,
        timestamp: Timestamp.now(),
      });

      loadContent();
      alert(
        `Successfully approved ${itemsToApprove.length} items with quality score >= 75%`,
      );
    } catch (error) {
      console.error("Error bulk approving by quality:", error);
      alert("Failed to approve items. Check console for details.");
    }
  }

  function toggleItemSelection(itemId: string) {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  }

  function toggleSelectAll() {
    if (selectedItems.size === content.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(content.map((item) => item.id)));
    }
  }

  if (role !== "admin" && role !== "superadmin") {
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
            <div className="text-3xl font-bold text-blue-600">
              {content.length}
            </div>
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

        {/* Filters */}
        <div className="bg-gray-50 border border-gray-200 p-6 rounded-lg mb-6">
          <h2 className="font-bold mb-4">Filters</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Website
              </label>
              <select
                value={websiteFilter}
                onChange={(e) => setWebsiteFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Websites</option>
                <option value="airport">Airport</option>
                <option value="corporate">Corporate</option>
                <option value="wedding">Wedding</option>
                <option value="partyBus">Party Bus</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Range
              </label>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as "pending" | "all")}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="pending">Pending Only</option>
                <option value="all">All Statuses</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bulk Approve Section */}
        <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg mb-8">
          <h2 className="font-bold mb-4">Bulk Actions</h2>
          <div className="flex gap-4 flex-wrap">
            <button
              onClick={toggleSelectAll}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              {selectedItems.size === content.length
                ? "Deselect All"
                : "Select All"}
            </button>
            <button
              onClick={handleBulkApprove}
              disabled={selectedItems.size === 0}
              className={`px-6 py-2 rounded-lg font-medium ${
                selectedItems.size > 0
                  ? "bg-green-600 text-white hover:bg-green-700"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              Approve Selected ({selectedItems.size})
            </button>
            <button
              onClick={handleBulkApproveQuality}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
            >
              Auto-Approve High Quality (75%+)
            </button>
          </div>
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
                    className={`p-4 rounded-lg border-2 transition ${
                      selectedContent?.id === item.id
                        ? "border-blue-600 bg-blue-50"
                        : selectedItems.has(item.id)
                          ? "border-green-500 bg-green-50"
                          : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={selectedItems.has(item.id)}
                        onChange={() => toggleItemSelection(item.id)}
                        className="w-5 h-5 mt-1"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div
                        className="flex-1 cursor-pointer"
                        onClick={() => setSelectedContent(item)}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="font-bold text-sm">
                            {item.serviceName || item.serviceId}
                          </div>
                          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded capitalize">
                            {item.websiteId}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 mb-2">
                          {item.locationName || item.locationId}
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-400">
                          {item.aiQualityScore && (
                            <div>
                              Quality:{" "}
                              <span
                                className={`font-bold ${
                                  item.aiQualityScore >= 0.75
                                    ? "text-green-600"
                                    : item.aiQualityScore >= 0.5
                                      ? "text-yellow-600"
                                      : "text-red-600"
                                }`}
                              >
                                {(item.aiQualityScore * 100).toFixed(0)}%
                              </span>
                            </div>
                          )}
                          <div>
                            {new Date(item.generatedAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Preview */}
            {selectedContent ? (
              <div className="border rounded-lg p-6 bg-gray-50">
                <div className="mb-4">
                  <h3 className="text-lg font-bold mb-2">
                    {selectedContent.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {selectedContent.metaDescription}
                  </p>

                  <div className="bg-white p-4 rounded mb-4 max-h-60 overflow-y-auto">
                    <div
                      className="text-sm"
                      dangerouslySetInnerHTML={{
                        __html:
                          selectedContent.content.substring(0, 500) + "...",
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
