import { AdminLayout } from "@/components/admin/AdminLayout";
import { DataTable, Column } from "@/components/admin/DataTable";
import { SEO } from "@/components/SEO";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Eye, Edit, Trash2, Building2, Phone, Mail, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Customer {
  id: string;
  name: string;
  company: string | null;
  email: string;
  phone: string;
  type: "individual" | "corporate";
  status: "active" | "inactive";
  totalTrips: number;
  totalSpent: number;
  lastBooking: string;
}

// Mock data
const customers: Customer[] = [
  {
    id: "1",
    name: "John Smith",
    company: null,
    email: "john.smith@email.com",
    phone: "(312) 555-0101",
    type: "individual",
    status: "active",
    totalTrips: 24,
    totalSpent: 3450,
    lastBooking: "2024-01-14",
  },
  {
    id: "2",
    name: "Sarah Williams",
    company: "Acme Corporation",
    email: "sarah@acmecorp.com",
    phone: "(312) 555-0102",
    type: "corporate",
    status: "active",
    totalTrips: 156,
    totalSpent: 28500,
    lastBooking: "2024-01-15",
  },
  {
    id: "3",
    name: "Robert Davis",
    company: "Tech Innovations LLC",
    email: "rdavis@techinnovations.com",
    phone: "(312) 555-0103",
    type: "corporate",
    status: "active",
    totalTrips: 89,
    totalSpent: 15200,
    lastBooking: "2024-01-13",
  },
  {
    id: "4",
    name: "Jennifer Miller",
    company: null,
    email: "jmiller@email.com",
    phone: "(312) 555-0104",
    type: "individual",
    status: "inactive",
    totalTrips: 5,
    totalSpent: 650,
    lastBooking: "2023-11-20",
  },
  {
    id: "5",
    name: "Thomas Wilson",
    company: "Global Finance Inc",
    email: "twilson@globalfinance.com",
    phone: "(312) 555-0105",
    type: "corporate",
    status: "active",
    totalTrips: 234,
    totalSpent: 42800,
    lastBooking: "2024-01-15",
  },
];

const statusColors: Record<Customer["status"], string> = {
  active: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  inactive: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
};

const typeColors: Record<Customer["type"], string> = {
  individual: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  corporate: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
};

const columns: Column<Customer>[] = [
  {
    id: "name",
    header: "Customer",
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
          {row.company && (
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Building2 className="h-3 w-3" />
              {row.company}
            </p>
          )}
        </div>
      </div>
    ),
  },
  {
    id: "contact",
    header: "Contact",
    cell: (row) => (
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-1 text-sm">
          <Mail className="h-3 w-3" />
          {row.email}
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Phone className="h-3 w-3" />
          {row.phone}
        </div>
      </div>
    ),
  },
  {
    id: "type",
    header: "Type",
    accessorKey: "type",
    cell: (row) => (
      <Badge className={typeColors[row.type]} variant="secondary">
        {row.type.charAt(0).toUpperCase() + row.type.slice(1)}
      </Badge>
    ),
  },
  {
    id: "status",
    header: "Status",
    accessorKey: "status",
    cell: (row) => (
      <Badge className={statusColors[row.status]} variant="secondary">
        {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
      </Badge>
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
    id: "totalSpent",
    header: "Total Spent",
    accessorKey: "totalSpent",
    sortable: true,
    cell: (row) => (
      <span className="font-medium">${row.totalSpent.toLocaleString()}</span>
    ),
  },
  {
    id: "lastBooking",
    header: "Last Booking",
    accessorKey: "lastBooking",
    sortable: true,
    cell: (row) => new Date(row.lastBooking).toLocaleDateString(),
  },
];

export default function CustomersPage() {
  const { toast } = useToast();
  
  const handleAddCustomer = () => {
    toast({
      title: "Add Customer",
      description: "Opening customer form...",
    });
  };

  return (
    <>
      <SEO
        title="Customers | Royal Carriage Admin"
        description="Manage your customers"
        noindex={true}
      />
      <AdminLayout
        title="Customers"
        subtitle="Manage your individual and corporate customers"
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Customers" },
        ]}
        actions={
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Customer
          </Button>
        }
      >
        <DataTable
          data={customers}
          columns={columns}
          searchPlaceholder="Search customers..."
          searchKey="name"
          filters={[
            {
              id: "type",
              label: "Type",
              options: [
                { value: "individual", label: "Individual" },
                { value: "corporate", label: "Corporate" },
              ],
            },
            {
              id: "status",
              label: "Status",
              options: [
                { value: "active", label: "Active" },
                { value: "inactive", label: "Inactive" },
              ],
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
                Edit Customer
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Customer
              </DropdownMenuItem>
            </>
          )}
          emptyState={{
            title: "No customers found",
            description: "Get started by adding your first customer.",
            action: {
              label: "Add Customer",
              onClick: handleAddCustomer,
            },
          }}
        />
      </AdminLayout>
    </>
  );
}
