import { AdminLayout } from "@/components/admin/AdminLayout";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Clock, Plus, Trash2 } from "lucide-react";

const mockQueue = [
  { id: 1, topic: "Best Airport Limo Services in Chicago", priority: "high", status: "pending", addedDate: "2024-01-15" },
  { id: 2, topic: "Corporate Transportation Tips", priority: "medium", status: "pending", addedDate: "2024-01-14" },
  { id: 3, topic: "Wedding Limousine Planning Guide", priority: "high", status: "processing", addedDate: "2024-01-13" },
  { id: 4, topic: "Party Bus Rental for Chicago Events", priority: "medium", status: "pending", addedDate: "2024-01-12" },
  { id: 5, topic: "O'Hare Airport Transportation Guide", priority: "low", status: "pending", addedDate: "2024-01-11" },
];

const priorityColors = {
  high: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  medium: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  low: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
};

const statusColors = {
  pending: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
  processing: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
};

export default function QueuePage() {
  return (
    <>
      <SEO
        title="SEO Bot Queue | Royal Carriage Admin"
        description="Manage SEO content generation queue"
        noindex={true}
      />
      <AdminLayout
        title="SEO Bot Queue"
        subtitle="Manage topics for automated content generation"
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "SEO Bot", href: "/admin/seo-bot" },
          { label: "Queue" },
        ]}
        actions={
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Topic
          </Button>
        }
      >
        <Card>
          <CardHeader>
            <CardTitle>Topic Queue</CardTitle>
            <CardDescription>
              Topics waiting to be processed by the SEO content generator
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Topic</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Added</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockQueue.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium max-w-md">{item.topic}</TableCell>
                    <TableCell>
                      <Badge className={priorityColors[item.priority as keyof typeof priorityColors]} variant="secondary">
                        {item.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[item.status as keyof typeof statusColors]} variant="secondary">
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {item.addedDate}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </AdminLayout>
    </>
  );
}
