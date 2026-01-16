import { AdminLayout } from "@/components/admin/AdminLayout";
import { DataTable, Column } from "@/components/admin/DataTable";
import { StatsCard, StatsGrid } from "@/components/admin/StatsCard";
import { SEO } from "@/components/SEO";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Eye,
  Edit,
  Send,
  Download,
  DollarSign,
  Clock,
  CheckCircle,
  AlertTriangle,
  Plus,
  FileText,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Invoice {
  id: string;
  invoiceNumber: string;
  customer: string;
  company: string | null;
  amount: number;
  status: "draft" | "sent" | "paid" | "overdue" | "cancelled";
  issueDate: string;
  dueDate: string;
  paidDate: string | null;
  trips: number;
}

// Mock data
const invoices: Invoice[] = [
  {
    id: "1",
    invoiceNumber: "INV-2024-001",
    customer: "Sarah Williams",
    company: "Acme Corporation",
    amount: 4850,
    status: "paid",
    issueDate: "2024-01-01",
    dueDate: "2024-01-15",
    paidDate: "2024-01-12",
    trips: 12,
  },
  {
    id: "2",
    invoiceNumber: "INV-2024-002",
    customer: "Thomas Wilson",
    company: "Global Finance Inc",
    amount: 7200,
    status: "sent",
    issueDate: "2024-01-08",
    dueDate: "2024-01-22",
    paidDate: null,
    trips: 18,
  },
  {
    id: "3",
    invoiceNumber: "INV-2024-003",
    customer: "Robert Davis",
    company: "Tech Innovations LLC",
    amount: 3450,
    status: "overdue",
    issueDate: "2023-12-15",
    dueDate: "2023-12-29",
    paidDate: null,
    trips: 8,
  },
  {
    id: "4",
    invoiceNumber: "INV-2024-004",
    customer: "Jennifer Miller",
    company: null,
    amount: 580,
    status: "draft",
    issueDate: "2024-01-15",
    dueDate: "2024-01-29",
    paidDate: null,
    trips: 2,
  },
  {
    id: "5",
    invoiceNumber: "INV-2024-005",
    customer: "John Smith",
    company: null,
    amount: 1250,
    status: "paid",
    issueDate: "2024-01-05",
    dueDate: "2024-01-19",
    paidDate: "2024-01-18",
    trips: 5,
  },
];

const statusColors: Record<Invoice["status"], string> = {
  draft: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
  sent: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  paid: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  overdue: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  cancelled: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
};

const statusLabels: Record<Invoice["status"], string> = {
  draft: "Draft",
  sent: "Sent",
  paid: "Paid",
  overdue: "Overdue",
  cancelled: "Cancelled",
};

const columns: Column<Invoice>[] = [
  {
    id: "invoiceNumber",
    header: "Invoice #",
    accessorKey: "invoiceNumber",
    sortable: true,
    cell: (row) => (
      <div className="flex items-center gap-2">
        <FileText className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium text-primary">{row.invoiceNumber}</span>
      </div>
    ),
  },
  {
    id: "customer",
    header: "Customer",
    accessorKey: "customer",
    sortable: true,
    cell: (row) => (
      <div>
        <p className="font-medium">{row.customer}</p>
        {row.company && (
          <p className="text-xs text-muted-foreground">{row.company}</p>
        )}
      </div>
    ),
  },
  {
    id: "amount",
    header: "Amount",
    accessorKey: "amount",
    sortable: true,
    cell: (row) => (
      <span className="font-medium">${row.amount.toLocaleString()}</span>
    ),
  },
  {
    id: "trips",
    header: "Trips",
    accessorKey: "trips",
    cell: (row) => <span>{row.trips} trips</span>,
  },
  {
    id: "issueDate",
    header: "Issue Date",
    accessorKey: "issueDate",
    sortable: true,
    cell: (row) => new Date(row.issueDate).toLocaleDateString(),
  },
  {
    id: "dueDate",
    header: "Due Date",
    accessorKey: "dueDate",
    sortable: true,
    cell: (row) => new Date(row.dueDate).toLocaleDateString(),
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

export default function InvoicesPage() {
  const { toast } = useToast();

  const totalOutstanding = invoices
    .filter((i) => i.status === "sent" || i.status === "overdue")
    .reduce((sum, i) => sum + i.amount, 0);

  const totalPaid = invoices
    .filter((i) => i.status === "paid")
    .reduce((sum, i) => sum + i.amount, 0);

  const overdueCount = invoices.filter((i) => i.status === "overdue").length;

  const handleCreateInvoice = () => {
    toast({
      title: "Create Invoice",
      description: "Opening invoice creation form...",
    });
  };

  const handleSendInvoices = (rows: Invoice[]) => {
    toast({
      title: "Invoices Sent",
      description: `${rows.length} invoice(s) have been sent to customers.`,
    });
  };

  const handleMarkPaid = (rows: Invoice[]) => {
    toast({
      title: "Invoices Marked Paid",
      description: `${rows.length} invoice(s) have been marked as paid.`,
    });
  };

  return (
    <>
      <SEO
        title="Invoices | Royal Carriage Admin"
        description="Manage customer invoices"
        noindex={true}
      />
      <AdminLayout
        title="Invoices"
        subtitle="Manage customer invoices and billing"
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Invoices" },
        ]}
        actions={
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Invoice
          </Button>
        }
      >
        {/* Stats */}
        <StatsGrid columns={4} className="mb-6">
          <StatsCard
            title="Total Outstanding"
            value={`$${totalOutstanding.toLocaleString()}`}
            icon={<Clock className="h-4 w-4" />}
            description="Awaiting payment"
          />
          <StatsCard
            title="Paid This Month"
            value={`$${totalPaid.toLocaleString()}`}
            icon={<CheckCircle className="h-4 w-4" />}
            trend={{ value: 15, label: "vs last month" }}
          />
          <StatsCard
            title="Overdue"
            value={overdueCount.toString()}
            icon={<AlertTriangle className="h-4 w-4" />}
            description="Requires follow-up"
          />
          <StatsCard
            title="Avg. Payment Time"
            value="8 days"
            icon={<DollarSign className="h-4 w-4" />}
            trend={{ value: -2, label: "vs last month" }}
          />
        </StatsGrid>

        <DataTable
          data={invoices}
          columns={columns}
          searchPlaceholder="Search invoices..."
          searchKey="customer"
          filters={[
            {
              id: "status",
              label: "Status",
              options: [
                { value: "draft", label: "Draft" },
                { value: "sent", label: "Sent" },
                { value: "paid", label: "Paid" },
                { value: "overdue", label: "Overdue" },
              ],
            },
          ]}
          bulkActions={[
            {
              label: "Send",
              onClick: handleSendInvoices,
            },
            {
              label: "Mark Paid",
              onClick: handleMarkPaid,
            },
          ]}
          rowActions={() => (
            <>
              <DropdownMenuItem className="cursor-pointer">
                <Eye className="h-4 w-4 mr-2" />
                View Invoice
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <Edit className="h-4 w-4 mr-2" />
                Edit Invoice
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <Send className="h-4 w-4 mr-2" />
                Send to Customer
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer text-destructive">
                Cancel Invoice
              </DropdownMenuItem>
            </>
          )}
          emptyState={{
            title: "No invoices found",
            description: "Get started by creating your first invoice.",
            action: {
              label: "Create Invoice",
              onClick: handleCreateInvoice,
            },
          }}
        />
      </AdminLayout>
    </>
  );
}
