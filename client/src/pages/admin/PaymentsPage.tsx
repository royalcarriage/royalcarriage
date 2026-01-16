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
  RefreshCw,
  CreditCard,
  DollarSign,
  CheckCircle,
  Clock,
  AlertTriangle,
  Plus,
} from "lucide-react";

interface Payment {
  id: string;
  paymentId: string;
  customer: string;
  company: string | null;
  amount: number;
  method: "credit_card" | "bank_transfer" | "check" | "cash";
  status: "completed" | "pending" | "failed" | "refunded";
  date: string;
  invoiceNumber: string | null;
  description: string;
}

// Mock data
const payments: Payment[] = [
  {
    id: "1",
    paymentId: "PAY-2024-001",
    customer: "Sarah Williams",
    company: "Acme Corporation",
    amount: 4850,
    method: "credit_card",
    status: "completed",
    date: "2024-01-12",
    invoiceNumber: "INV-2024-001",
    description: "Invoice payment - 12 trips",
  },
  {
    id: "2",
    paymentId: "PAY-2024-002",
    customer: "John Smith",
    company: null,
    amount: 1250,
    method: "credit_card",
    status: "completed",
    date: "2024-01-18",
    invoiceNumber: "INV-2024-005",
    description: "Invoice payment - 5 trips",
  },
  {
    id: "3",
    paymentId: "PAY-2024-003",
    customer: "Thomas Wilson",
    company: "Global Finance Inc",
    amount: 7200,
    method: "bank_transfer",
    status: "pending",
    date: "2024-01-15",
    invoiceNumber: "INV-2024-002",
    description: "Invoice payment - 18 trips",
  },
  {
    id: "4",
    paymentId: "PAY-2024-004",
    customer: "Jennifer Miller",
    company: null,
    amount: 85,
    method: "credit_card",
    status: "failed",
    date: "2024-01-14",
    invoiceNumber: null,
    description: "Trip payment - O'Hare to Downtown",
  },
  {
    id: "5",
    paymentId: "PAY-2024-005",
    customer: "Robert Davis",
    company: "Tech Innovations LLC",
    amount: 450,
    method: "credit_card",
    status: "refunded",
    date: "2024-01-10",
    invoiceNumber: null,
    description: "Trip cancellation refund",
  },
];

const statusColors: Record<Payment["status"], string> = {
  completed:
    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  pending:
    "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  failed: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  refunded: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
};

const statusLabels: Record<Payment["status"], string> = {
  completed: "Completed",
  pending: "Pending",
  failed: "Failed",
  refunded: "Refunded",
};

const methodLabels: Record<Payment["method"], string> = {
  credit_card: "Credit Card",
  bank_transfer: "Bank Transfer",
  check: "Check",
  cash: "Cash",
};

const columns: Column<Payment>[] = [
  {
    id: "paymentId",
    header: "Payment ID",
    accessorKey: "paymentId",
    sortable: true,
    cell: (row) => (
      <span className="font-medium text-primary">{row.paymentId}</span>
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
      <span
        className={`font-medium ${row.status === "refunded" ? "text-red-600" : ""}`}
      >
        {row.status === "refunded" ? "-" : ""}${row.amount.toLocaleString()}
      </span>
    ),
  },
  {
    id: "method",
    header: "Method",
    accessorKey: "method",
    cell: (row) => (
      <div className="flex items-center gap-2">
        <CreditCard className="h-4 w-4 text-muted-foreground" />
        <span>{methodLabels[row.method]}</span>
      </div>
    ),
  },
  {
    id: "description",
    header: "Description",
    accessorKey: "description",
    cell: (row) => (
      <div>
        <p className="text-sm">{row.description}</p>
        {row.invoiceNumber && (
          <p className="text-xs text-muted-foreground">{row.invoiceNumber}</p>
        )}
      </div>
    ),
  },
  {
    id: "date",
    header: "Date",
    accessorKey: "date",
    sortable: true,
    cell: (row) => new Date(row.date).toLocaleDateString(),
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

export default function PaymentsPage() {
  const totalReceived = payments
    .filter((p) => p.status === "completed")
    .reduce((sum, p) => sum + p.amount, 0);

  const totalPending = payments
    .filter((p) => p.status === "pending")
    .reduce((sum, p) => sum + p.amount, 0);

  const failedCount = payments.filter((p) => p.status === "failed").length;

  return (
    <>
      <SEO
        title="Payments | Royal Carriage Admin"
        description="Manage payments and transactions"
        noindex={true}
      />
      <AdminLayout
        title="Payments"
        subtitle="Track and manage all payment transactions"
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Payments" },
        ]}
        actions={
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Record Payment
          </Button>
        }
      >
        {/* Stats */}
        <StatsGrid columns={4} className="mb-6">
          <StatsCard
            title="Total Received"
            value={`$${totalReceived.toLocaleString()}`}
            icon={<CheckCircle className="h-4 w-4" />}
            trend={{ value: 18, label: "vs last month" }}
          />
          <StatsCard
            title="Pending"
            value={`$${totalPending.toLocaleString()}`}
            icon={<Clock className="h-4 w-4" />}
            description="Awaiting confirmation"
          />
          <StatsCard
            title="Failed Payments"
            value={failedCount.toString()}
            icon={<AlertTriangle className="h-4 w-4" />}
            description="Requires attention"
          />
          <StatsCard
            title="Success Rate"
            value="96%"
            icon={<DollarSign className="h-4 w-4" />}
            trend={{ value: 2, label: "vs last month" }}
          />
        </StatsGrid>

        <DataTable
          data={payments}
          columns={columns}
          searchPlaceholder="Search payments..."
          searchKey="customer"
          filters={[
            {
              id: "status",
              label: "Status",
              options: [
                { value: "completed", label: "Completed" },
                { value: "pending", label: "Pending" },
                { value: "failed", label: "Failed" },
                { value: "refunded", label: "Refunded" },
              ],
            },
            {
              id: "method",
              label: "Method",
              options: [
                { value: "credit_card", label: "Credit Card" },
                { value: "bank_transfer", label: "Bank Transfer" },
                { value: "check", label: "Check" },
                { value: "cash", label: "Cash" },
              ],
            },
          ]}
          rowActions={(row) => (
            <>
              <DropdownMenuItem className="cursor-pointer">
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </DropdownMenuItem>
              {row.status === "failed" && (
                <DropdownMenuItem className="cursor-pointer">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry Payment
                </DropdownMenuItem>
              )}
              {row.status === "completed" && (
                <DropdownMenuItem className="cursor-pointer">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Issue Refund
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer">
                Download Receipt
              </DropdownMenuItem>
            </>
          )}
          emptyState={{
            title: "No payments found",
            description:
              "Payments will appear here once transactions are processed.",
          }}
        />
      </AdminLayout>
    </>
  );
}
