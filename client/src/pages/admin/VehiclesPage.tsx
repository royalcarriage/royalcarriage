import { AdminLayout } from "@/components/admin/AdminLayout";
import { DataTable, Column } from "@/components/admin/DataTable";
import { SEO } from "@/components/SEO";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Eye, Edit, Trash2, Car, Users, Briefcase, Plus } from "lucide-react";

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  type: "sedan" | "suv" | "sprinter" | "luxury";
  status: "available" | "in_use" | "maintenance" | "retired";
  capacity: number;
  assignedDriver: string | null;
  lastService: string;
  mileage: number;
}

// Mock data
const vehicles: Vehicle[] = [
  {
    id: "1",
    make: "Lincoln",
    model: "Navigator",
    year: 2023,
    licensePlate: "ABC-1234",
    type: "suv",
    status: "available",
    capacity: 6,
    assignedDriver: "Michael Johnson",
    lastService: "2024-01-05",
    mileage: 15420,
  },
  {
    id: "2",
    make: "Cadillac",
    model: "Escalade",
    year: 2024,
    licensePlate: "XYZ-5678",
    type: "suv",
    status: "in_use",
    capacity: 7,
    assignedDriver: "Emily Brown",
    lastService: "2024-01-10",
    mileage: 8320,
  },
  {
    id: "3",
    make: "Mercedes-Benz",
    model: "S-Class",
    year: 2023,
    licensePlate: "DEF-9012",
    type: "luxury",
    status: "available",
    capacity: 3,
    assignedDriver: "David Lee",
    lastService: "2023-12-20",
    mileage: 22150,
  },
  {
    id: "4",
    make: "Mercedes-Benz",
    model: "Sprinter",
    year: 2022,
    licensePlate: "GHI-3456",
    type: "sprinter",
    status: "maintenance",
    capacity: 12,
    assignedDriver: null,
    lastService: "2024-01-12",
    mileage: 45680,
  },
  {
    id: "5",
    make: "BMW",
    model: "7 Series",
    year: 2023,
    licensePlate: "JKL-7890",
    type: "sedan",
    status: "available",
    capacity: 3,
    assignedDriver: null,
    lastService: "2024-01-08",
    mileage: 18920,
  },
];

const statusColors: Record<Vehicle["status"], string> = {
  available: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  in_use: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  maintenance: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  retired: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
};

const statusLabels: Record<Vehicle["status"], string> = {
  available: "Available",
  in_use: "In Use",
  maintenance: "Maintenance",
  retired: "Retired",
};

const typeLabels: Record<Vehicle["type"], string> = {
  sedan: "Sedan",
  suv: "SUV",
  sprinter: "Sprinter",
  luxury: "Luxury",
};

const columns: Column<Vehicle>[] = [
  {
    id: "vehicle",
    header: "Vehicle",
    cell: (row) => (
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
          <Car className="h-5 w-5 text-muted-foreground" />
        </div>
        <div>
          <p className="font-medium">
            {row.year} {row.make} {row.model}
          </p>
          <p className="text-xs text-muted-foreground">{row.licensePlate}</p>
        </div>
      </div>
    ),
    sortable: true,
  },
  {
    id: "type",
    header: "Type",
    accessorKey: "type",
    cell: (row) => (
      <Badge variant="outline">{typeLabels[row.type]}</Badge>
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
    id: "capacity",
    header: "Capacity",
    accessorKey: "capacity",
    cell: (row) => (
      <div className="flex items-center gap-1">
        <Users className="h-4 w-4 text-muted-foreground" />
        <span>{row.capacity} passengers</span>
      </div>
    ),
  },
  {
    id: "assignedDriver",
    header: "Assigned Driver",
    accessorKey: "assignedDriver",
    cell: (row) =>
      row.assignedDriver ? (
        <span>{row.assignedDriver}</span>
      ) : (
        <span className="text-muted-foreground">Unassigned</span>
      ),
  },
  {
    id: "mileage",
    header: "Mileage",
    accessorKey: "mileage",
    sortable: true,
    cell: (row) => (
      <span>{row.mileage.toLocaleString()} mi</span>
    ),
  },
  {
    id: "lastService",
    header: "Last Service",
    accessorKey: "lastService",
    sortable: true,
    cell: (row) => (
      <div className="flex items-center gap-1 text-sm">
        <Briefcase className="h-3 w-3" />
        {new Date(row.lastService).toLocaleDateString()}
      </div>
    ),
  },
];

export default function VehiclesPage() {
  return (
    <>
      <SEO
        title="Vehicles | Royal Carriage Admin"
        description="Manage your vehicle fleet"
        noindex={true}
      />
      <AdminLayout
        title="Vehicles"
        subtitle="Manage your vehicle fleet and maintenance schedules"
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Vehicles" },
        ]}
        actions={
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Vehicle
          </Button>
        }
      >
        <DataTable
          data={vehicles}
          columns={columns}
          searchPlaceholder="Search vehicles..."
          searchKey="make"
          filters={[
            {
              id: "status",
              label: "Status",
              options: [
                { value: "available", label: "Available" },
                { value: "in_use", label: "In Use" },
                { value: "maintenance", label: "Maintenance" },
                { value: "retired", label: "Retired" },
              ],
            },
            {
              id: "type",
              label: "Type",
              options: [
                { value: "sedan", label: "Sedan" },
                { value: "suv", label: "SUV" },
                { value: "sprinter", label: "Sprinter" },
                { value: "luxury", label: "Luxury" },
              ],
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
                Edit Vehicle
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Retire Vehicle
              </DropdownMenuItem>
            </>
          )}
          emptyState={{
            title: "No vehicles found",
            description: "Get started by adding your first vehicle.",
            action: {
              label: "Add Vehicle",
              onClick: () => () => {},
            },
          }}
        />
      </AdminLayout>
    </>
  );
}
