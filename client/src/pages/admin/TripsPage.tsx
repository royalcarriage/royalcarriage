import { AdminLayout } from "@/components/admin/AdminLayout";
import { DataTable, Column } from "@/components/admin/DataTable";
import { SEO } from "@/components/SEO";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Eye, Edit, Trash2, MapPin, Calendar, Clock, Plus } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface Trip {
  id: string;
  tripNumber: string;
  customer: string;
  driver: string;
  pickup: string;
  dropoff: string;
  date: Date;
  time: string;
  status: "scheduled" | "in_progress" | "completed" | "cancelled";
  amount: number;
  vehicleType: string;
}

// Mock data
const trips: Trip[] = [
  {
    id: "1",
    tripNumber: "TRP-4521",
    customer: "John Smith",
    driver: "Michael Johnson",
    pickup: "O'Hare International Airport",
    dropoff: "Downtown Chicago, IL",
    date: new Date("2024-01-15"),
    time: "14:30",
    status: "completed",
    amount: 85,
    vehicleType: "Sedan",
  },
  {
    id: "2",
    tripNumber: "TRP-4522",
    customer: "Sarah Williams",
    driver: "Emily Brown",
    pickup: "Midway Airport",
    dropoff: "Naperville, IL",
    date: new Date("2024-01-15"),
    time: "16:00",
    status: "in_progress",
    amount: 120,
    vehicleType: "SUV",
  },
  {
    id: "3",
    tripNumber: "TRP-4523",
    customer: "Robert Davis",
    driver: "David Lee",
    pickup: "Willis Tower",
    dropoff: "O'Hare International Airport",
    date: new Date("2024-01-16"),
    time: "08:00",
    status: "scheduled",
    amount: 75,
    vehicleType: "Sedan",
  },
  {
    id: "4",
    tripNumber: "TRP-4524",
    customer: "Jennifer Miller",
    driver: "Unassigned",
    pickup: "Schaumburg, IL",
    dropoff: "O'Hare International Airport",
    date: new Date("2024-01-16"),
    time: "10:30",
    status: "scheduled",
    amount: 95,
    vehicleType: "SUV",
  },
  {
    id: "5",
    tripNumber: "TRP-4520",
    customer: "Thomas Wilson",
    driver: "Michael Johnson",
    pickup: "Oak Brook, IL",
    dropoff: "Midway Airport",
    date: new Date("2024-01-14"),
    time: "06:00",
    status: "cancelled",
    amount: 110,
    vehicleType: "Sedan",
  },
];

const statusColors: Record<Trip["status"], string> = {
  scheduled: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  in_progress:
    "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  completed:
    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

const statusLabels: Record<Trip["status"], string> = {
  scheduled: "Scheduled",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

const columns: Column<Trip>[] = [
  {
    id: "tripNumber",
    header: "Trip #",
    accessorKey: "tripNumber",
    sortable: true,
    cell: (row) => (
      <span className="font-medium text-primary">{row.tripNumber}</span>
    ),
  },
  {
    id: "customer",
    header: "Customer",
    accessorKey: "customer",
    sortable: true,
  },
  {
    id: "driver",
    header: "Driver",
    accessorKey: "driver",
    cell: (row) => (
      <span className={row.driver === "Unassigned" ? "text-amber-600" : ""}>
        {row.driver}
      </span>
    ),
  },
  {
    id: "route",
    header: "Route",
    cell: (row) => (
      <div className="flex flex-col gap-1 max-w-xs">
        <div className="flex items-center gap-1 text-xs">
          <MapPin className="h-3 w-3 text-green-500" />
          <span className="truncate">{row.pickup}</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3 text-red-500" />
          <span className="truncate">{row.dropoff}</span>
        </div>
      </div>
    ),
  },
  {
    id: "datetime",
    header: "Date & Time",
    cell: (row) => (
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-1 text-sm">
          <Calendar className="h-3 w-3" />
          {format(row.date, "MMM d, yyyy")}
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          {row.time}
        </div>
      </div>
    ),
    sortable: true,
  },
  {
    id: "vehicleType",
    header: "Vehicle",
    accessorKey: "vehicleType",
  },
  {
    id: "amount",
    header: "Amount",
    accessorKey: "amount",
    sortable: true,
    cell: (row) => (
      <span className="font-medium">${row.amount.toFixed(2)}</span>
    ),
  },
  {
    id: "status",
    header: "Status",
    accessorKey: "status",
    cell: (row) => (
      <Badge className={statusColors[row.status]} variant="secondary">
        {statusLabels[row.status]}
      </Badge>
    ),
  },
];

export default function TripsPage() {
  const { toast } = useToast();

  const handleCreateTrip = () => {
    toast({
      title: "Create Trip",
      description: "Opening trip booking form...",
    });
  };

  const handleAssignDriver = (rows: Trip[]) => {
    toast({
      title: "Assign Driver",
      description: `Opening driver assignment for ${rows.length} trip(s)...`,
    });
  };

  const handleCancelTrips = (rows: Trip[]) => {
    toast({
      title: "Trips Cancelled",
      description: `${rows.length} trip(s) have been cancelled.`,
      variant: "destructive",
    });
  };

  return (
    <>
      <SEO
        title="Trips | Royal Carriage Admin"
        description="Manage all trips and bookings"
        noindex={true}
      />
      <AdminLayout
        title="Trips"
        subtitle="Manage all trips and bookings across your fleet"
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Trips" },
        ]}
        actions={
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Trip
          </Button>
        }
      >
        <DataTable
          data={trips}
          columns={columns}
          searchPlaceholder="Search trips..."
          searchKey="customer"
          filters={[
            {
              id: "status",
              label: "Status",
              options: [
                { value: "scheduled", label: "Scheduled" },
                { value: "in_progress", label: "In Progress" },
                { value: "completed", label: "Completed" },
                { value: "cancelled", label: "Cancelled" },
              ],
            },
            {
              id: "vehicleType",
              label: "Vehicle Type",
              options: [
                { value: "sedan", label: "Sedan" },
                { value: "suv", label: "SUV" },
                { value: "sprinter", label: "Sprinter" },
              ],
            },
          ]}
          bulkActions={[
            {
              label: "Assign Driver",
              onClick: handleAssignDriver,
            },
            {
              label: "Cancel",
              onClick: handleCancelTrips,
              variant: "destructive",
            },
          ]}
          rowActions={(row) => (
            <>
              <DropdownMenuItem className="cursor-pointer">
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <Edit className="h-4 w-4 mr-2" />
                Edit Trip
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Cancel Trip
              </DropdownMenuItem>
            </>
          )}
          emptyState={{
            title: "No trips found",
            description: "Get started by creating your first trip.",
            action: {
              label: "Create Trip",
              onClick: handleCreateTrip,
            },
          }}
        />
      </AdminLayout>
    </>
  );
}
