import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { StatsCard, StatsGrid } from "@/components/admin/StatsCard";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DollarSign,
  Users,
  Wallet,
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle,
  Download,
  Send,
  FileText,
  CreditCard,
} from "lucide-react";

interface PayoutBatch {
  id: string;
  period: string;
  status: "draft" | "review" | "approved" | "paid";
  driverCount: number;
  totalAmount: number;
  createdAt: string;
  approvedBy: string | null;
  paidAt: string | null;
}

interface DriverPayout {
  id: string;
  driverName: string;
  driverEmail: string;
  trips: number;
  grossAmount: number;
  deductions: number;
  netAmount: number;
  status: "pending" | "approved" | "paid";
}

// Mock data
const payoutBatches: PayoutBatch[] = [
  {
    id: "1",
    period: "Jan 8 - Jan 14, 2024",
    status: "review",
    driverCount: 22,
    totalAmount: 18230,
    createdAt: "2024-01-15",
    approvedBy: null,
    paidAt: null,
  },
  {
    id: "2",
    period: "Jan 1 - Jan 7, 2024",
    status: "paid",
    driverCount: 20,
    totalAmount: 16450,
    createdAt: "2024-01-08",
    approvedBy: "Admin User",
    paidAt: "2024-01-09",
  },
  {
    id: "3",
    period: "Dec 25 - Dec 31, 2023",
    status: "paid",
    driverCount: 18,
    totalAmount: 14280,
    createdAt: "2024-01-01",
    approvedBy: "Admin User",
    paidAt: "2024-01-02",
  },
];

const currentPayouts: DriverPayout[] = [
  {
    id: "1",
    driverName: "Michael Johnson",
    driverEmail: "michael.j@email.com",
    trips: 48,
    grossAmount: 1850,
    deductions: 125,
    netAmount: 1725,
    status: "pending",
  },
  {
    id: "2",
    driverName: "Emily Brown",
    driverEmail: "emily.b@email.com",
    trips: 42,
    grossAmount: 1620,
    deductions: 85,
    netAmount: 1535,
    status: "pending",
  },
  {
    id: "3",
    driverName: "David Lee",
    driverEmail: "david.l@email.com",
    trips: 38,
    grossAmount: 1480,
    deductions: 200,
    netAmount: 1280,
    status: "pending",
  },
  {
    id: "4",
    driverName: "Sarah Wilson",
    driverEmail: "sarah.w@email.com",
    trips: 35,
    grossAmount: 1350,
    deductions: 0,
    netAmount: 1350,
    status: "pending",
  },
  {
    id: "5",
    driverName: "James Taylor",
    driverEmail: "james.t@email.com",
    trips: 32,
    grossAmount: 1240,
    deductions: 50,
    netAmount: 1190,
    status: "pending",
  },
];

const statusColors: Record<PayoutBatch["status"], string> = {
  draft: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
  review:
    "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  approved: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  paid: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
};

const statusLabels: Record<PayoutBatch["status"], string> = {
  draft: "Draft",
  review: "Pending Review",
  approved: "Approved",
  paid: "Paid",
};

export default function PayrollPage() {
  const [selectedDrivers, setSelectedDrivers] = useState<Set<string>>(
    new Set(),
  );
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);

  const toggleDriver = (id: string) => {
    setSelectedDrivers((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const toggleAllDrivers = () => {
    if (selectedDrivers.size === currentPayouts.length) {
      setSelectedDrivers(new Set());
    } else {
      setSelectedDrivers(new Set(currentPayouts.map((d) => d.id)));
    }
  };

  const totalSelected = currentPayouts
    .filter((d) => selectedDrivers.has(d.id))
    .reduce((sum, d) => sum + d.netAmount, 0);

  return (
    <>
      <SEO
        title="Payroll | Royal Carriage Admin"
        description="Manage driver payouts and payroll"
        noindex={true}
      />
      <AdminLayout
        title="Payroll & Payouts"
        subtitle="Manage driver payments and payout batches"
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Payroll" },
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button>
              <Calendar className="h-4 w-4 mr-2" />
              Create Batch
            </Button>
          </div>
        }
      >
        {/* Stats */}
        <StatsGrid columns={4} className="mb-6">
          <StatsCard
            title="Pending Payouts"
            value="$18,230"
            icon={<Wallet className="h-4 w-4" />}
            description="22 drivers"
          />
          <StatsCard
            title="Paid This Month"
            value="$30,730"
            icon={<CheckCircle className="h-4 w-4" />}
            trend={{ value: 12, label: "vs last month" }}
          />
          <StatsCard
            title="Active Drivers"
            value="18"
            icon={<Users className="h-4 w-4" />}
            description="Eligible for payout"
          />
          <StatsCard
            title="Total Deductions"
            value="$460"
            icon={<AlertTriangle className="h-4 w-4" />}
            description="This batch"
          />
        </StatsGrid>

        <Tabs defaultValue="current" className="space-y-6">
          <TabsList>
            <TabsTrigger value="current">Current Batch</TabsTrigger>
            <TabsTrigger value="history">Payout History</TabsTrigger>
            <TabsTrigger value="deductions">Deductions</TabsTrigger>
          </TabsList>

          {/* Current Batch */}
          <TabsContent value="current">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      Week of Jan 8 - Jan 14, 2024
                      <Badge className={statusColors.review}>
                        {statusLabels.review}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      Review and approve driver payouts for this period
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedDrivers.size > 0 && (
                      <span className="text-sm text-muted-foreground">
                        {selectedDrivers.size} selected ($
                        {totalSelected.toLocaleString()})
                      </span>
                    )}
                    <Dialog
                      open={isApproveDialogOpen}
                      onOpenChange={setIsApproveDialogOpen}
                    >
                      <DialogTrigger asChild>
                        <Button disabled={selectedDrivers.size === 0}>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approve Selected
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Approve Payouts</DialogTitle>
                          <DialogDescription>
                            You are about to approve payouts for{" "}
                            {selectedDrivers.size} drivers totaling $
                            {totalSelected.toLocaleString()}.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                          <div className="bg-muted rounded-lg p-4 space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Drivers</span>
                              <span className="font-medium">
                                {selectedDrivers.size}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Total Payout</span>
                              <span className="font-medium">
                                ${totalSelected.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => setIsApproveDialogOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button onClick={() => setIsApproveDialogOpen(false)}>
                            <Send className="h-4 w-4 mr-2" />
                            Approve & Process
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={
                            selectedDrivers.size === currentPayouts.length
                          }
                          onCheckedChange={toggleAllDrivers}
                        />
                      </TableHead>
                      <TableHead>Driver</TableHead>
                      <TableHead>Trips</TableHead>
                      <TableHead>Gross Amount</TableHead>
                      <TableHead>Deductions</TableHead>
                      <TableHead>Net Payout</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentPayouts.map((payout) => (
                      <TableRow key={payout.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedDrivers.has(payout.id)}
                            onCheckedChange={() => toggleDriver(payout.id)}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>
                                {payout.driverName
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{payout.driverName}</p>
                              <p className="text-xs text-muted-foreground">
                                {payout.driverEmail}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{payout.trips}</TableCell>
                        <TableCell>
                          ${payout.grossAmount.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          {payout.deductions > 0 ? (
                            <span className="text-red-600">
                              -${payout.deductions}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">$0</span>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">
                          ${payout.netAmount.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="gap-1">
                            <Clock className="h-3 w-3" />
                            Pending
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <FileText className="h-4 w-4 mr-1" />
                            Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payout History */}
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Payout History</CardTitle>
                <CardDescription>
                  View past payout batches and their status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Period</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Drivers</TableHead>
                      <TableHead>Total Amount</TableHead>
                      <TableHead>Approved By</TableHead>
                      <TableHead>Paid Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payoutBatches.map((batch) => (
                      <TableRow key={batch.id}>
                        <TableCell className="font-medium">
                          {batch.period}
                        </TableCell>
                        <TableCell>
                          <Badge className={statusColors[batch.status]}>
                            {statusLabels[batch.status]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            {batch.driverCount}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          ${batch.totalAmount.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          {batch.approvedBy || (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {batch.paidAt ? (
                            new Date(batch.paidAt).toLocaleDateString()
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <FileText className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Deductions */}
          <TabsContent value="deductions">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Deductions</CardTitle>
                    <CardDescription>
                      Manage driver deductions for damages, fuel cards, and
                      chargebacks
                    </CardDescription>
                  </div>
                  <Button>
                    <DollarSign className="h-4 w-4 mr-2" />
                    Add Deduction
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Driver</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>MJ</AvatarFallback>
                          </Avatar>
                          <span>Michael Johnson</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">Damage</Badge>
                      </TableCell>
                      <TableCell className="text-red-600 font-medium">
                        -$125
                      </TableCell>
                      <TableCell className="text-sm">
                        Minor vehicle scratch repair
                      </TableCell>
                      <TableCell>Jan 10, 2024</TableCell>
                      <TableCell>
                        <Badge className="bg-green-100 text-green-800">
                          Applied
                        </Badge>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>DL</AvatarFallback>
                          </Avatar>
                          <span>David Lee</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">Fuel Card</Badge>
                      </TableCell>
                      <TableCell className="text-red-600 font-medium">
                        -$200
                      </TableCell>
                      <TableCell className="text-sm">
                        Fuel card overage - December
                      </TableCell>
                      <TableCell>Jan 5, 2024</TableCell>
                      <TableCell>
                        <Badge className="bg-green-100 text-green-800">
                          Applied
                        </Badge>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>EB</AvatarFallback>
                          </Avatar>
                          <span>Emily Brown</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">Chargeback</Badge>
                      </TableCell>
                      <TableCell className="text-red-600 font-medium">
                        -$85
                      </TableCell>
                      <TableCell className="text-sm">
                        Customer dispute - Trip #4412
                      </TableCell>
                      <TableCell>Jan 12, 2024</TableCell>
                      <TableCell>
                        <Badge className="bg-amber-100 text-amber-800">
                          Pending Review
                        </Badge>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </AdminLayout>
    </>
  );
}
