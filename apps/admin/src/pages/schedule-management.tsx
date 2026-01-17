import React, { useEffect, useState, useCallback } from "react";
import { db } from "../lib/firebase";
import {
  collection,
  getDocs,
  query,
  orderBy,
  where,
  doc,
  updateDoc,
  deleteDoc,
  addDoc,
  Timestamp,
  limit,
} from "firebase/firestore";
import { useAuth } from "../state/AuthProvider";
import { getFunctions, httpsCallable } from "firebase/functions";

// ============================================================================
// INTERFACES
// ============================================================================

interface Schedule {
  id: string;
  name: string;
  description: string;
  websiteId: string;
  frequency: "daily" | "weekly" | "monthly" | "custom";
  cronExpression: string;
  timezone: string;
  enabled: boolean;
  locationIds: string[];
  serviceIds: string[];
  maxItemsPerRun: number;
  qualityThreshold: number;
  notifyOnComplete: boolean;
  notifyEmail?: string;
  createdAt: Timestamp;
  createdBy: string;
  updatedAt: Timestamp;
  lastExecutedAt?: Timestamp;
  nextExecutionAt?: Timestamp;
  totalExecutions?: number;
  successfulExecutions?: number;
}

interface ScheduleExecution {
  id: string;
  scheduleId: string;
  scheduleName: string;
  status: "pending" | "running" | "completed" | "failed" | "partial";
  startedAt: Timestamp;
  completedAt?: Timestamp;
  duration?: number;
  itemsProcessed: number;
  itemsSucceeded: number;
  itemsFailed: number;
  averageQualityScore?: number;
  errorMessage?: string;
  triggeredBy: "scheduled" | "manual";
  triggeredByUserId?: string;
}

interface Location {
  id: string;
  name: string;
}

interface Service {
  id: string;
  name: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function ScheduleManagementPage() {
  const { user, role } = useAuth();
  const [loading, setLoading] = useState(true);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [executions, setExecutions] = useState<ScheduleExecution[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedWebsite, setSelectedWebsite] = useState<string>("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [selectedScheduleHistory, setSelectedScheduleHistory] = useState<
    string | null
  >(null);
  const [executing, setExecuting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form state for create/edit
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    websiteId: "airport",
    frequency: "weekly" as "daily" | "weekly" | "monthly" | "custom",
    cronExpression: "",
    timezone: "America/Chicago",
    locationIds: [] as string[],
    serviceIds: [] as string[],
    maxItemsPerRun: 50,
    qualityThreshold: 70,
    notifyOnComplete: true,
    notifyEmail: "",
  });

  // ============================================================================
  // DATA LOADING
  // ============================================================================

  const loadSchedules = useCallback(async () => {
    try {
      setLoading(true);
      let q;
      if (selectedWebsite === "all") {
        q = query(
          collection(db, "content_schedules"),
          orderBy("createdAt", "desc"),
        );
      } else {
        q = query(
          collection(db, "content_schedules"),
          where("websiteId", "==", selectedWebsite),
          orderBy("createdAt", "desc"),
        );
      }

      const snapshot = await getDocs(q);
      const schedulesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Schedule[];

      setSchedules(schedulesData);
    } catch (err) {
      console.error("Error loading schedules:", err);
      setError("Failed to load schedules");
    } finally {
      setLoading(false);
    }
  }, [selectedWebsite]);

  const loadExecutions = useCallback(async (scheduleId?: string) => {
    try {
      let q;
      if (scheduleId) {
        q = query(
          collection(db, "schedule_executions"),
          where("scheduleId", "==", scheduleId),
          orderBy("startedAt", "desc"),
          limit(20),
        );
      } else {
        q = query(
          collection(db, "schedule_executions"),
          orderBy("startedAt", "desc"),
          limit(50),
        );
      }

      const snapshot = await getDocs(q);
      const executionsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as ScheduleExecution[];

      setExecutions(executionsData);
    } catch (err) {
      console.error("Error loading executions:", err);
    }
  }, []);

  const loadLocationsAndServices = useCallback(async () => {
    try {
      const [locationsSnapshot, servicesSnapshot] = await Promise.all([
        getDocs(query(collection(db, "locations"), orderBy("name"))),
        getDocs(query(collection(db, "services"), orderBy("name"))),
      ]);

      setLocations(
        locationsSnapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name || doc.id,
        })),
      );

      setServices(
        servicesSnapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name || doc.id,
        })),
      );
    } catch (err) {
      console.error("Error loading locations/services:", err);
    }
  }, []);

  useEffect(() => {
    if (role !== "admin" && role !== "superadmin") {
      return;
    }
    loadSchedules();
    loadExecutions();
    loadLocationsAndServices();
  }, [role, loadSchedules, loadExecutions, loadLocationsAndServices]);

  // ============================================================================
  // SCHEDULE ACTIONS
  // ============================================================================

  const handleCreateSchedule = async () => {
    if (
      !formData.name ||
      !formData.websiteId ||
      formData.locationIds.length === 0 ||
      formData.serviceIds.length === 0
    ) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      setError(null);

      // Calculate next execution
      const cronExpression =
        formData.frequency === "custom"
          ? formData.cronExpression
          : frequencyToCron(formData.frequency);

      const scheduleData = {
        ...formData,
        cronExpression,
        enabled: true,
        createdAt: Timestamp.now(),
        createdBy: user?.uid || "unknown",
        updatedAt: Timestamp.now(),
        nextExecutionAt: Timestamp.fromDate(
          calculateNextExecution(cronExpression),
        ),
      };

      await addDoc(collection(db, "content_schedules"), scheduleData);

      setSuccessMessage(`Schedule "${formData.name}" created successfully`);
      setShowCreateModal(false);
      resetForm();
      loadSchedules();
    } catch (err) {
      console.error("Error creating schedule:", err);
      setError("Failed to create schedule");
    }
  };

  const handleUpdateSchedule = async () => {
    if (!editingSchedule) return;

    try {
      setError(null);

      const cronExpression =
        formData.frequency === "custom"
          ? formData.cronExpression
          : frequencyToCron(formData.frequency);

      const updateData = {
        ...formData,
        cronExpression,
        updatedAt: Timestamp.now(),
        nextExecutionAt: Timestamp.fromDate(
          calculateNextExecution(cronExpression),
        ),
      };

      await updateDoc(
        doc(db, "content_schedules", editingSchedule.id),
        updateData,
      );

      setSuccessMessage(`Schedule "${formData.name}" updated successfully`);
      setShowEditModal(false);
      setEditingSchedule(null);
      resetForm();
      loadSchedules();
    } catch (err) {
      console.error("Error updating schedule:", err);
      setError("Failed to update schedule");
    }
  };

  const handleDeleteSchedule = async (schedule: Schedule) => {
    if (
      !confirm(
        `Are you sure you want to delete schedule "${schedule.name}"? This cannot be undone.`,
      )
    ) {
      return;
    }

    try {
      await deleteDoc(doc(db, "content_schedules", schedule.id));
      setSuccessMessage(`Schedule "${schedule.name}" deleted`);
      loadSchedules();
    } catch (err) {
      console.error("Error deleting schedule:", err);
      setError("Failed to delete schedule");
    }
  };

  const handleToggleSchedule = async (schedule: Schedule) => {
    try {
      const newEnabled = !schedule.enabled;
      const updateData: any = {
        enabled: newEnabled,
        updatedAt: Timestamp.now(),
      };

      if (newEnabled) {
        updateData.nextExecutionAt = Timestamp.fromDate(
          calculateNextExecution(schedule.cronExpression),
        );
      }

      await updateDoc(doc(db, "content_schedules", schedule.id), updateData);
      setSuccessMessage(
        `Schedule "${schedule.name}" ${newEnabled ? "enabled" : "disabled"}`,
      );
      loadSchedules();
    } catch (err) {
      console.error("Error toggling schedule:", err);
      setError("Failed to toggle schedule");
    }
  };

  const handleExecuteNow = async (schedule: Schedule) => {
    try {
      setExecuting(schedule.id);
      setError(null);

      const functions = getFunctions();
      const executeScheduledGeneration = httpsCallable(
        functions,
        "executeScheduledGeneration",
      );

      const result = await executeScheduledGeneration({
        scheduleId: schedule.id,
        triggeredBy: "manual",
      });

      const data = result.data as any;
      setSuccessMessage(
        `Execution completed: ${data.itemsSucceeded} items generated, ${data.itemsFailed} failed`,
      );
      loadSchedules();
      loadExecutions();
    } catch (err: any) {
      console.error("Error executing schedule:", err);
      setError(err.message || "Failed to execute schedule");
    } finally {
      setExecuting(null);
    }
  };

  const openEditModal = (schedule: Schedule) => {
    setEditingSchedule(schedule);
    setFormData({
      name: schedule.name,
      description: schedule.description,
      websiteId: schedule.websiteId,
      frequency: schedule.frequency,
      cronExpression: schedule.cronExpression,
      timezone: schedule.timezone,
      locationIds: schedule.locationIds,
      serviceIds: schedule.serviceIds,
      maxItemsPerRun: schedule.maxItemsPerRun,
      qualityThreshold: schedule.qualityThreshold,
      notifyOnComplete: schedule.notifyOnComplete,
      notifyEmail: schedule.notifyEmail || "",
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      websiteId: "airport",
      frequency: "weekly",
      cronExpression: "",
      timezone: "America/Chicago",
      locationIds: [],
      serviceIds: [],
      maxItemsPerRun: 50,
      qualityThreshold: 70,
      notifyOnComplete: true,
      notifyEmail: "",
    });
  };

  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================

  function frequencyToCron(frequency: string): string {
    switch (frequency) {
      case "daily":
        return "0 3 * * *";
      case "weekly":
        return "0 3 * * 0";
      case "monthly":
        return "0 3 1 * *";
      default:
        return "0 3 * * *";
    }
  }

  function calculateNextExecution(cronExpression: string): Date {
    const now = new Date();
    const parts = cronExpression.split(" ");
    const next = new Date(now);

    if (parts.length === 5) {
      const [minute, hour, dayOfMonth, , dayOfWeek] = parts;
      next.setHours(parseInt(hour) || 3, parseInt(minute) || 0, 0, 0);

      if (next <= now) {
        if (dayOfWeek !== "*") {
          const targetDay = parseInt(dayOfWeek);
          const currentDay = next.getDay();
          const daysUntil = (targetDay - currentDay + 7) % 7 || 7;
          next.setDate(next.getDate() + daysUntil);
        } else if (dayOfMonth !== "*") {
          next.setMonth(next.getMonth() + 1);
          next.setDate(parseInt(dayOfMonth));
        } else {
          next.setDate(next.getDate() + 1);
        }
      }
    } else {
      next.setDate(next.getDate() + 1);
      next.setHours(3, 0, 0, 0);
    }

    return next;
  }

  function formatDate(timestamp?: Timestamp): string {
    if (!timestamp) return "Never";
    return timestamp.toDate().toLocaleString();
  }

  function formatDuration(ms?: number): string {
    if (!ms) return "-";
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${Math.round(ms / 1000)}s`;
    return `${Math.round(ms / 60000)}m`;
  }

  function getStatusColor(status: string): string {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "running":
        return "bg-blue-100 text-blue-800";
      case "partial":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  }

  function getWebsiteName(websiteId: string): string {
    const names: Record<string, string> = {
      airport: "Airport Black Car",
      corporate: "Executive Car Service",
      wedding: "Wedding Transportation",
      partyBus: "Party Bus",
    };
    return names[websiteId] || websiteId;
  }

  function getFrequencyDisplay(
    frequency: string,
    cronExpression: string,
  ): string {
    switch (frequency) {
      case "daily":
        return "Daily at 3:00 AM";
      case "weekly":
        return "Weekly (Sunday 3:00 AM)";
      case "monthly":
        return "Monthly (1st at 3:00 AM)";
      case "custom":
        return `Custom: ${cronExpression}`;
      default:
        return frequency;
    }
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  if (role !== "admin" && role !== "superadmin") {
    return <div className="p-8">Access Denied. Admins only.</div>;
  }

  return (
    <div className="p-8 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Schedule Management</h1>
          <p className="text-gray-600">
            Create and manage automated content generation schedules
          </p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
            <button
              onClick={() => setError(null)}
              className="float-right font-bold"
            >
              x
            </button>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            {successMessage}
            <button
              onClick={() => setSuccessMessage(null)}
              className="float-right font-bold"
            >
              x
            </button>
          </div>
        )}

        {/* Controls */}
        <div className="mb-8 flex gap-4 items-center">
          <select
            value={selectedWebsite}
            onChange={(e) => setSelectedWebsite(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="all">All Websites</option>
            <option value="airport">Airport Black Car</option>
            <option value="corporate">Executive Car Service</option>
            <option value="wedding">Wedding Transportation</option>
            <option value="partyBus">Party Bus</option>
          </select>

          <button
            onClick={() => {
              resetForm();
              setShowCreateModal(true);
            }}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition"
          >
            + Create Schedule
          </button>

          <button
            onClick={() => {
              loadSchedules();
              loadExecutions();
            }}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition"
          >
            Refresh
          </button>
        </div>

        {/* Schedule List */}
        {loading ? (
          <div className="text-center py-12">Loading schedules...</div>
        ) : schedules.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-600 mb-4">No schedules found</p>
            <button
              onClick={() => {
                resetForm();
                setShowCreateModal(true);
              }}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition"
            >
              Create Your First Schedule
            </button>
          </div>
        ) : (
          <div className="space-y-4 mb-12">
            {schedules.map((schedule) => (
              <div
                key={schedule.id}
                className={`border rounded-lg p-6 ${
                  schedule.enabled ? "bg-white" : "bg-gray-50"
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-bold">{schedule.name}</h3>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          schedule.enabled
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {schedule.enabled ? "Active" : "Disabled"}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mt-1">
                      {schedule.description || "No description"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleToggleSchedule(schedule)}
                      className={`px-3 py-1 text-sm rounded ${
                        schedule.enabled
                          ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                          : "bg-green-100 text-green-700 hover:bg-green-200"
                      }`}
                    >
                      {schedule.enabled ? "Disable" : "Enable"}
                    </button>
                    <button
                      onClick={() => handleExecuteNow(schedule)}
                      disabled={executing === schedule.id}
                      className={`px-3 py-1 text-sm rounded ${
                        executing === schedule.id
                          ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                          : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                      }`}
                    >
                      {executing === schedule.id ? "Running..." : "Run Now"}
                    </button>
                    <button
                      onClick={() => openEditModal(schedule)}
                      className="px-3 py-1 text-sm rounded bg-gray-100 text-gray-700 hover:bg-gray-200"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteSchedule(schedule)}
                      className="px-3 py-1 text-sm rounded bg-red-100 text-red-700 hover:bg-red-200"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Website:</span>
                    <br />
                    <span className="font-medium">
                      {getWebsiteName(schedule.websiteId)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Frequency:</span>
                    <br />
                    <span className="font-medium">
                      {getFrequencyDisplay(
                        schedule.frequency,
                        schedule.cronExpression,
                      )}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Last Run:</span>
                    <br />
                    <span className="font-medium">
                      {formatDate(schedule.lastExecutedAt)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Next Run:</span>
                    <br />
                    <span className="font-medium">
                      {schedule.enabled
                        ? formatDate(schedule.nextExecutionAt)
                        : "Disabled"}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Locations:</span>
                    <br />
                    <span className="font-medium">
                      {schedule.locationIds.length} selected
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Services:</span>
                    <br />
                    <span className="font-medium">
                      {schedule.serviceIds.length} selected
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Max Items/Run:</span>
                    <br />
                    <span className="font-medium">
                      {schedule.maxItemsPerRun}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Quality Threshold:</span>
                    <br />
                    <span className="font-medium">
                      {schedule.qualityThreshold}
                    </span>
                  </div>
                </div>

                <div className="mt-4">
                  <button
                    onClick={() =>
                      setSelectedScheduleHistory(
                        selectedScheduleHistory === schedule.id
                          ? null
                          : schedule.id,
                      )
                    }
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    {selectedScheduleHistory === schedule.id
                      ? "Hide History"
                      : "View Execution History"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Execution History Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-4">
            {selectedScheduleHistory
              ? "Schedule Execution History"
              : "Recent Executions"}
          </h2>

          {executions.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-600">No execution history found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="text-left p-3 border">Schedule</th>
                    <th className="text-left p-3 border">Status</th>
                    <th className="text-left p-3 border">Started</th>
                    <th className="text-left p-3 border">Duration</th>
                    <th className="text-center p-3 border">Processed</th>
                    <th className="text-center p-3 border">Succeeded</th>
                    <th className="text-center p-3 border">Failed</th>
                    <th className="text-center p-3 border">Avg Score</th>
                    <th className="text-left p-3 border">Triggered By</th>
                  </tr>
                </thead>
                <tbody>
                  {executions
                    .filter(
                      (e) =>
                        !selectedScheduleHistory ||
                        e.scheduleId === selectedScheduleHistory,
                    )
                    .map((execution) => (
                      <tr key={execution.id} className="hover:bg-gray-50">
                        <td className="p-3 border font-medium">
                          {execution.scheduleName}
                        </td>
                        <td className="p-3 border">
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${getStatusColor(
                              execution.status,
                            )}`}
                          >
                            {execution.status}
                          </span>
                        </td>
                        <td className="p-3 border text-sm">
                          {formatDate(execution.startedAt)}
                        </td>
                        <td className="p-3 border text-sm">
                          {formatDuration(execution.duration)}
                        </td>
                        <td className="p-3 border text-center">
                          {execution.itemsProcessed}
                        </td>
                        <td className="p-3 border text-center text-green-600">
                          {execution.itemsSucceeded}
                        </td>
                        <td className="p-3 border text-center text-red-600">
                          {execution.itemsFailed}
                        </td>
                        <td className="p-3 border text-center">
                          {execution.averageQualityScore || "-"}
                        </td>
                        <td className="p-3 border text-sm capitalize">
                          {execution.triggeredBy}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Create/Edit Modal */}
        {(showCreateModal || showEditModal) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b">
                <h2 className="text-2xl font-bold">
                  {showEditModal ? "Edit Schedule" : "Create New Schedule"}
                </h2>
              </div>

              <div className="p-6 space-y-6">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Schedule Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded-lg"
                    placeholder="e.g., Weekly Airport Content Generation"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded-lg"
                    rows={2}
                    placeholder="Optional description of this schedule"
                  />
                </div>

                {/* Website */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Website <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.websiteId}
                    onChange={(e) =>
                      setFormData({ ...formData, websiteId: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded-lg"
                  >
                    <option value="airport">Airport Black Car</option>
                    <option value="corporate">Executive Car Service</option>
                    <option value="wedding">Wedding Transportation</option>
                    <option value="partyBus">Party Bus</option>
                  </select>
                </div>

                {/* Frequency */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Frequency <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.frequency}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        frequency: e.target.value as
                          | "daily"
                          | "weekly"
                          | "monthly"
                          | "custom",
                      })
                    }
                    className="w-full px-4 py-2 border rounded-lg"
                  >
                    <option value="daily">Daily (3:00 AM)</option>
                    <option value="weekly">Weekly (Sunday 3:00 AM)</option>
                    <option value="monthly">Monthly (1st at 3:00 AM)</option>
                    <option value="custom">Custom (Cron Expression)</option>
                  </select>
                </div>

                {/* Custom Cron Expression */}
                {formData.frequency === "custom" && (
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Cron Expression <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.cronExpression}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          cronExpression: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border rounded-lg font-mono"
                      placeholder="0 3 * * *"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Format: minute hour day-of-month month day-of-week
                    </p>
                  </div>
                )}

                {/* Locations */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Locations <span className="text-red-500">*</span>
                  </label>
                  <div className="border rounded-lg p-3 max-h-40 overflow-y-auto">
                    <div className="mb-2">
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            locationIds:
                              formData.locationIds.length === locations.length
                                ? []
                                : locations.map((l) => l.id),
                          })
                        }
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        {formData.locationIds.length === locations.length
                          ? "Deselect All"
                          : "Select All"}
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {locations.map((location) => (
                        <label
                          key={location.id}
                          className="flex items-center gap-2 text-sm"
                        >
                          <input
                            type="checkbox"
                            checked={formData.locationIds.includes(location.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({
                                  ...formData,
                                  locationIds: [
                                    ...formData.locationIds,
                                    location.id,
                                  ],
                                });
                              } else {
                                setFormData({
                                  ...formData,
                                  locationIds: formData.locationIds.filter(
                                    (id) => id !== location.id,
                                  ),
                                });
                              }
                            }}
                          />
                          {location.name}
                        </label>
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.locationIds.length} selected
                  </p>
                </div>

                {/* Services */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Services <span className="text-red-500">*</span>
                  </label>
                  <div className="border rounded-lg p-3 max-h-40 overflow-y-auto">
                    <div className="mb-2">
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            serviceIds:
                              formData.serviceIds.length === services.length
                                ? []
                                : services.map((s) => s.id),
                          })
                        }
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        {formData.serviceIds.length === services.length
                          ? "Deselect All"
                          : "Select All"}
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {services.map((service) => (
                        <label
                          key={service.id}
                          className="flex items-center gap-2 text-sm"
                        >
                          <input
                            type="checkbox"
                            checked={formData.serviceIds.includes(service.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({
                                  ...formData,
                                  serviceIds: [
                                    ...formData.serviceIds,
                                    service.id,
                                  ],
                                });
                              } else {
                                setFormData({
                                  ...formData,
                                  serviceIds: formData.serviceIds.filter(
                                    (id) => id !== service.id,
                                  ),
                                });
                              }
                            }}
                          />
                          {service.name}
                        </label>
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.serviceIds.length} selected
                  </p>
                </div>

                {/* Settings Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Max Items Per Run
                    </label>
                    <input
                      type="number"
                      value={formData.maxItemsPerRun}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          maxItemsPerRun: parseInt(e.target.value) || 50,
                        })
                      }
                      className="w-full px-4 py-2 border rounded-lg"
                      min={1}
                      max={500}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Quality Threshold
                    </label>
                    <input
                      type="number"
                      value={formData.qualityThreshold}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          qualityThreshold: parseInt(e.target.value) || 70,
                        })
                      }
                      className="w-full px-4 py-2 border rounded-lg"
                      min={0}
                      max={100}
                    />
                  </div>
                </div>

                {/* Notifications */}
                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.notifyOnComplete}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          notifyOnComplete: e.target.checked,
                        })
                      }
                    />
                    <span className="text-sm font-medium">
                      Notify on completion
                    </span>
                  </label>
                </div>

                {formData.notifyOnComplete && (
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Notification Email
                    </label>
                    <input
                      type="email"
                      value={formData.notifyEmail}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          notifyEmail: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border rounded-lg"
                      placeholder="admin@example.com"
                    />
                  </div>
                )}
              </div>

              <div className="p-6 border-t flex justify-end gap-4">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setShowEditModal(false);
                    setEditingSchedule(null);
                    resetForm();
                  }}
                  className="px-6 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={
                    showEditModal ? handleUpdateSchedule : handleCreateSchedule
                  }
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700"
                >
                  {showEditModal ? "Update Schedule" : "Create Schedule"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
