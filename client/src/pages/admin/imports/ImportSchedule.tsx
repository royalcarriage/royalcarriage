import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Calendar, Clock, Bell, Plus, Trash2, CheckCircle } from "lucide-react";

interface ImportSchedule {
  id: string;
  name: string;
  type: "moovs" | "ads";
  frequency: "daily" | "weekly" | "biweekly" | "monthly";
  dayOfWeek?: number;
  dayOfMonth?: number;
  time: string;
  enabled: boolean;
  lastRun?: string;
  nextRun: string;
  reminderEnabled: boolean;
  reminderMinutesBefore: number;
  createdBy: string;
  createdAt: string;
}

interface ScheduleReminder {
  id: string;
  scheduleId: string;
  scheduleName: string;
  dueAt: string;
  dismissed: boolean;
}

// Mock data
const generateMockSchedules = (): ImportSchedule[] => {
  return [
    {
      id: "1",
      name: "Weekly Moovs Import",
      type: "moovs",
      frequency: "weekly",
      dayOfWeek: 1,
      time: "09:00",
      enabled: true,
      lastRun: "2024-01-15T09:00:00Z",
      nextRun: "2024-01-22T09:00:00Z",
      reminderEnabled: true,
      reminderMinutesBefore: 60,
      createdBy: "admin@royalcarriage.com",
      createdAt: "2024-01-01T10:00:00Z",
    },
    {
      id: "2",
      name: "Daily Ads Performance",
      type: "ads",
      frequency: "daily",
      time: "08:00",
      enabled: true,
      lastRun: "2024-01-17T08:00:00Z",
      nextRun: "2024-01-18T08:00:00Z",
      reminderEnabled: true,
      reminderMinutesBefore: 30,
      createdBy: "admin@royalcarriage.com",
      createdAt: "2024-01-01T10:00:00Z",
    },
    {
      id: "3",
      name: "Monthly Moovs Archive",
      type: "moovs",
      frequency: "monthly",
      dayOfMonth: 1,
      time: "06:00",
      enabled: true,
      lastRun: "2024-01-01T06:00:00Z",
      nextRun: "2024-02-01T06:00:00Z",
      reminderEnabled: false,
      reminderMinutesBefore: 0,
      createdBy: "admin@royalcarriage.com",
      createdAt: "2024-01-01T10:00:00Z",
    },
    {
      id: "4",
      name: "Biweekly Campaign Review",
      type: "ads",
      frequency: "biweekly",
      dayOfWeek: 3,
      time: "10:00",
      enabled: false,
      nextRun: "2024-01-24T10:00:00Z",
      reminderEnabled: true,
      reminderMinutesBefore: 120,
      createdBy: "admin@royalcarriage.com",
      createdAt: "2024-01-01T10:00:00Z",
    },
  ];
};

const generateMockReminders = (): ScheduleReminder[] => {
  return [
    {
      id: "r1",
      scheduleId: "1",
      scheduleName: "Weekly Moovs Import",
      dueAt: new Date(Date.now() + 45 * 60 * 1000).toISOString(),
      dismissed: false,
    },
    {
      id: "r2",
      scheduleId: "2",
      scheduleName: "Daily Ads Performance",
      dueAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      dismissed: false,
    },
  ];
};

const DAYS_OF_WEEK = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export default function ImportSchedule() {
  const [schedules, setSchedules] = useState<ImportSchedule[]>(
    generateMockSchedules(),
  );
  const [reminders, setReminders] = useState<ScheduleReminder[]>(
    generateMockReminders(),
  );
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [filterType, setFilterType] = useState<string>("all");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [scheduleToDelete, setScheduleToDelete] =
    useState<ImportSchedule | null>(null);

  const activeReminders = reminders.filter((r) => !r.dismissed);

  const filteredSchedules = schedules.filter(
    (s) => filterType === "all" || s.type === filterType,
  );

  const handleToggleSchedule = (scheduleId: string) => {
    setSchedules((prev) =>
      prev.map((s) =>
        s.id === scheduleId ? { ...s, enabled: !s.enabled } : s,
      ),
    );
    // TODO: Firebase update
    console.log("Toggled schedule:", scheduleId);
  };

  const handleDeleteSchedule = (scheduleId: string) => {
    const schedule = schedules.find((s) => s.id === scheduleId);
    if (!schedule) return;

    setScheduleToDelete(schedule);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (!scheduleToDelete) return;

    setSchedules((prev) => prev.filter((s) => s.id !== scheduleToDelete.id));
    setDeleteConfirmOpen(false);
    setScheduleToDelete(null);

    // TODO: Firebase delete
    console.log("Deleted schedule:", scheduleToDelete.id);
  };

  const handleDismissReminder = (reminderId: string) => {
    setReminders((prev) =>
      prev.map((r) => (r.id === reminderId ? { ...r, dismissed: true } : r)),
    );
    // TODO: Firebase update
    console.log("Dismissed reminder:", reminderId);
  };

  const formatNextRun = (nextRun: string) => {
    const date = new Date(nextRun);
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `in ${days}d ${hours % 24}h`;
    } else if (hours > 0) {
      return `in ${hours}h`;
    } else {
      return `in ${Math.floor(diff / (1000 * 60))}m`;
    }
  };

  const getFrequencyDescription = (schedule: ImportSchedule) => {
    switch (schedule.frequency) {
      case "daily":
        return `Daily at ${schedule.time}`;
      case "weekly":
        return `Weekly on ${DAYS_OF_WEEK[schedule.dayOfWeek!]} at ${schedule.time}`;
      case "biweekly":
        return `Biweekly on ${DAYS_OF_WEEK[schedule.dayOfWeek!]} at ${schedule.time}`;
      case "monthly":
        return `Monthly on day ${schedule.dayOfMonth} at ${schedule.time}`;
      default:
        return schedule.frequency;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Import Schedules</h1>
          <p className="text-gray-600 mt-1">
            Manage recurring imports with reminder notifications
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Schedule
        </Button>
      </div>

      {/* Active Reminders */}
      {activeReminders.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-900">
              <Bell className="w-5 h-5" />
              Active Reminders ({activeReminders.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activeReminders.map((reminder) => {
                const timeUntil =
                  new Date(reminder.dueAt).getTime() - Date.now();
                const minutes = Math.floor(timeUntil / (1000 * 60));

                return (
                  <div
                    key={reminder.id}
                    className="flex items-center justify-between p-3 bg-white rounded-lg border border-orange-200"
                  >
                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-orange-600" />
                      <div>
                        <p className="font-semibold text-orange-900">
                          {reminder.scheduleName}
                        </p>
                        <p className="text-sm text-orange-700">
                          Due in {minutes} minutes
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDismissReminder(reminder.id)}
                    >
                      Dismiss
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Total Schedules</p>
                <p className="text-2xl font-bold">{schedules.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold">
                  {schedules.filter((s) => s.enabled).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-sm text-gray-600">With Reminders</p>
                <p className="text-2xl font-bold">
                  {schedules.filter((s) => s.reminderEnabled).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">Pending Reminders</p>
                <p className="text-2xl font-bold">{activeReminders.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Schedules Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Scheduled Imports</CardTitle>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="moovs">Moovs Only</SelectItem>
                <SelectItem value="ads">Ads Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Frequency</TableHead>
                <TableHead>Next Run</TableHead>
                <TableHead>Last Run</TableHead>
                <TableHead>Reminder</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSchedules.map((schedule) => (
                <TableRow key={schedule.id}>
                  <TableCell className="font-medium">{schedule.name}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        schedule.type === "moovs" ? "default" : "secondary"
                      }
                    >
                      {schedule.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {getFrequencyDescription(schedule)}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm">
                        {new Date(schedule.nextRun).toLocaleString()}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatNextRun(schedule.nextRun)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {schedule.lastRun
                      ? new Date(schedule.lastRun).toLocaleDateString()
                      : "Never"}
                  </TableCell>
                  <TableCell>
                    {schedule.reminderEnabled ? (
                      <div className="flex items-center gap-1 text-xs">
                        <Bell className="w-3 h-3" />
                        <span>{schedule.reminderMinutesBefore}m before</span>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">None</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={schedule.enabled}
                        onCheckedChange={() =>
                          handleToggleSchedule(schedule.id)
                        }
                      />
                      <span className="text-sm">
                        {schedule.enabled ? "Active" : "Paused"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteSchedule(schedule.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create Schedule Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Import Schedule</DialogTitle>
            <DialogDescription>
              Set up a recurring import with optional reminder notifications
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="schedule-name">Schedule Name</Label>
              <Input
                id="schedule-name"
                placeholder="e.g., Weekly Moovs Import"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="schedule-type">Import Type</Label>
                <Select>
                  <SelectTrigger id="schedule-type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="moovs">Moovs</SelectItem>
                    <SelectItem value="ads">Ads</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="schedule-frequency">Frequency</Label>
                <Select>
                  <SelectTrigger id="schedule-frequency">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="biweekly">Biweekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="schedule-time">Time</Label>
                <Input id="schedule-time" type="time" defaultValue="09:00" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reminder-minutes">
                  Reminder (minutes before)
                </Label>
                <Input
                  id="reminder-minutes"
                  type="number"
                  defaultValue="60"
                  min="0"
                  max="1440"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="reminder-enabled" defaultChecked />
              <Label htmlFor="reminder-enabled">
                Enable reminder notifications
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                // TODO: Create schedule in Firebase
                console.log("Creating new schedule");
                setIsCreateDialogOpen(false);
              }}
            >
              Create Schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Schedule</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{scheduleToDelete?.name}"? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* TODO: Firebase Integration */}
      <div className="p-4 bg-gray-50 rounded border border-gray-200 text-sm text-gray-600">
        <strong>TODO:</strong> Firebase integration:
        <ul className="list-disc list-inside mt-2 ml-4">
          <li>Store schedules in Firestore collection: import_schedules</li>
          <li>Use Cloud Scheduler to trigger imports at scheduled times</li>
          <li>
            Create Cloud Function to check reminders and send notifications
          </li>
          <li>Track reminder dismissals per user in Firestore</li>
          <li>Add email/push notifications for reminders</li>
        </ul>
      </div>
    </div>
  );
}
