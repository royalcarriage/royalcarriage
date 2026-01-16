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
import { AlertTriangle, Upload, Search } from "lucide-react";

const mockMissing = [
  { id: 1, page: "/fleet/luxury-sedan", imageName: "sedan-hero.jpg", priority: "high", lastChecked: "2024-01-15" },
  { id: 2, page: "/services/wedding", imageName: "wedding-gallery-3.jpg", priority: "medium", lastChecked: "2024-01-15" },
  { id: 3, page: "/about", imageName: "team-photo.jpg", priority: "low", lastChecked: "2024-01-14" },
  { id: 4, page: "/fleet/party-bus", imageName: "party-bus-interior-2.jpg", priority: "medium", lastChecked: "2024-01-14" },
  { id: 5, page: "/services/corporate", imageName: "corporate-fleet.jpg", priority: "high", lastChecked: "2024-01-13" },
];

const priorityColors = {
  high: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  medium: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  low: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
};

export default function MissingPage() {
  return (
    <>
      <SEO
        title="Missing Images | Royal Carriage Admin"
        description="Report of missing image assets"
        noindex={true}
      />
      <AdminLayout
        title="Missing Images"
        subtitle="Images referenced but not found in the system"
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Images", href: "/admin/images" },
          { label: "Missing" },
        ]}
        actions={
          <Button>
            <Search className="h-4 w-4 mr-2" />
            Scan Pages
          </Button>
        }
      >
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <div>
                <CardTitle>Missing Images Report</CardTitle>
                <CardDescription>
                  Images that are referenced in content but missing from the library
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Page</TableHead>
                  <TableHead>Image Name</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Last Checked</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockMissing.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.page}</TableCell>
                    <TableCell className="text-muted-foreground">{item.imageName}</TableCell>
                    <TableCell>
                      <Badge className={priorityColors[item.priority as keyof typeof priorityColors]} variant="secondary">
                        {item.priority}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {item.lastChecked}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        <Upload className="h-4 w-4 mr-2" />
                        Upload
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
