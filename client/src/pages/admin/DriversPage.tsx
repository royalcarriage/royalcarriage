import { AdminLayout } from "@/components/admin/AdminLayout";
import { DataTable, Column } from "@/components/admin/DataTable";
import { SEO } from "@/components/SEO";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Eye, Edit, Trash2, Phone, Mail, Star, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Driver {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: "active" | "inactive" | "pending";
  rating: number;
  totalTrips: number;
  totalEarnings: number;
  vehicleAssigned: string | null;
  joinedDate: string;
}

// Mock data
const drivers: Driver[] = [
  {
    id: "1",
    name: "Michael Johnson",
    email: "michael.j@email.com",
    phone: "(312) 555-0123",
    status: "active",
    rating: 4.9,
    totalTrips: 342,
    totalEarnings: 28500,
    vehicleAssigned: "Lincoln Navigator - ABC123",
    joinedDate: "2023-03-15",
  },
  {
    id: "2",
    name: "Emily Brown",
    email: "emily.b@email.com",
    phone: "(312) 555-0124",
    status: "active",
    rating: 4.8,
    totalTrips: 287,
    totalEarnings: 24200,
    vehicleAssigned: "Cadillac Escalade - XYZ789",
    joinedDate: "2023-05-20",
  },
  {
    id: "3",
    name: "David Lee",
    email: "david.l@email.com",
    phone: "(312) 555-0125",
    status: "active",
    rating: 4.7,
    totalTrips: 198,
    totalEarnings: 16800,
    vehicleAssigned: "Mercedes S-Class - DEF456",
    joinedDate: "2023-08-10",
  },
  {
    id: "4",
    name: "Sarah Wilson",
    email: "sarah.w@email.com",
    phone: "(312) 555-0126",
    status: "pending",
    rating: 0,
    totalTrips: 0,
    totalEarnings: 0,
    vehicleAssigned: null,
    joinedDate: "2024-01-10",
  },
  {
    id: "5",
    name: "James Taylor",
    email: "james.t@email.com",
    phone: "(312) 555-0127",
    status: "inactive",
    rating: 4.5,
    totalTrips: 156,
    totalEarnings: 13200,
    vehicleAssigned: null,
    joinedDate: "2023-02-01",
  },
];

const statusColors: Record<Driver["status"], string> = {
  active:
    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  inactive: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
  pending:
    "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
};

const statusLabels: Record<Driver["status"], string> = {
  active: "Active",
  inactive: "Inactive",
  pending: "Pending Verification",
};

const columns: Column<Driver>[] = [
  {
    id: "name",
    header: "Driver",
    accessorKey: "name",
    sortable: true,
    cell: (row) => (
      <div className="flex items-center gap-3">
        <Avatar className="h-9 w-9">
          <AvatarFallback>
            {row.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium">{row.name}</p>
          <p className="text-xs text-muted-foreground">{row.email}</p>
        </div>
      </div>
    ),
  },
  {
    id: "phone",
    header: "Contact",
    accessorKey: "phone",
    cell: (row) => (
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-1 text-sm">
          <Phone className="h-3 w-3" />
          {row.phone}
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Mail className="h-3 w-3" />
          {row.email}
        </div>
      </div>
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
  {
    id: "rating",
    header: "Rating",
    accessorKey: "rating",
    sortable: true,
    cell: (row) =>
      row.rating > 0 ? (
        <div className="flex items-center gap-1">
          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
          <span className="font-medium">{row.rating.toFixed(1)}</span>
        </div>
      ) : (
        <span className="text-muted-foreground">No ratings</span>
      ),
  },
  {
    id: "totalTrips",
    header: "Trips",
    accessorKey: "totalTrips",
    sortable: true,
    cell: (row) => <span className="font-medium">{row.totalTrips}</span>,
  },
  {
    id: "totalEarnings",
    header: "Earnings",
    accessorKey: "totalEarnings",
    sortable: true,
    cell: (row) => (
      <span className="font-medium">${row.totalEarnings.toLocaleString()}</span>
    ),
  },
  {
    id: "vehicleAssigned",
    header: "Vehicle",
    accessorKey: "vehicleAssigned",
    cell: (row) =>
      row.vehicleAssigned ? (
        <span className="text-sm">{row.vehicleAssigned}</span>
      ) : (
        <span className="text-muted-foreground text-sm">Unassigned</span>
      ),
  },
];

export default function DriversPage() {
  const { toast } = useToast();

  const handleAddDriver = () => {
    toast({
      title: "Add Driver",
      description: "Opening driver registration form...",
    });
  };

  const handleActivateDrivers = (rows: Driver[]) => {
    toast({
      title: "Drivers Activated",
      description: `${rows.length} driver(s) have been activated.`,
    });
  };

  const handleDeactivateDrivers = (rows: Driver[]) => {
    toast({
      title: "Drivers Deactivated",
      description: `${rows.length} driver(s) have been deactivated.`,
    });
  };

  return (
    <>
      <SEO
        title="Drivers | Royal Carriage Admin"
        description="Manage drivers and their assignments"
        noindex={true}
      />
      <AdminLayout
        title="Drivers"
        subtitle="Manage your driver fleet and assignments"
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Drivers" },
        ]}
        actions={
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Driver
          </Button>
        }
      >
        <DataTable
          data={drivers}
          columns={columns}
          searchPlaceholder="Search drivers..."
          searchKey="name"
          filters={[
            {
              id: "status",
              label: "Status",
              options: [
                { value: "active", label: "Active" },
                { value: "inactive", label: "Inactive" },
                { value: "pending", label: "Pending" },
              ],
            },
          ]}
          bulkActions={[
            {
              label: "Activate",
              onClick: handleActivateDrivers,
            },
            {
              label: "Deactivate",
              onClick: handleDeactivateDrivers,
              variant: "outline",
            },
          ]}
          rowActions={(row) => (
            <>
              <DropdownMenuItem className="cursor-pointer">
                <Eye className="h-4 w-4 mr-2" />
                View Profile
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <Edit className="h-4 w-4 mr-2" />
                Edit Driver
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Remove Driver
              </DropdownMenuItem>
            </>
          )}
          emptyState={{
            title: "No drivers found",
            description: "Get started by adding your first driver.",
            action: {
              label: "Add Driver",
              onClick: handleAddDriver,
            },
          }}
        />
      </AdminLayout>
    </>
  );
}
