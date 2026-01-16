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
import { FileText, Eye, Edit, Trash2, Clock } from "lucide-react";

const mockDrafts = [
  { id: 1, title: "Best Airport Limo Services in Chicago", wordCount: 1250, status: "ready", createdDate: "2024-01-15", quality: 95 },
  { id: 2, title: "Corporate Transportation Tips", wordCount: 980, status: "ready", createdDate: "2024-01-14", quality: 88 },
  { id: 3, title: "Wedding Limousine Planning Guide", wordCount: 1420, status: "ready", createdDate: "2024-01-13", quality: 92 },
  { id: 4, title: "Party Bus Rental for Chicago Events", wordCount: 1100, status: "needs_review", createdDate: "2024-01-12", quality: 78 },
  { id: 5, title: "O'Hare Airport Transportation Guide", wordCount: 1350, status: "ready", createdDate: "2024-01-11", quality: 90 },
];

const statusColors = {
  ready: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  needs_review: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
};

export default function DraftsPage() {
  return (
    <>
      <SEO
        title="SEO Bot Drafts | Royal Carriage Admin"
        description="Review and manage SEO content drafts"
        noindex={true}
      />
      <AdminLayout
        title="SEO Bot Drafts"
        subtitle="Review and edit AI-generated content drafts"
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "SEO Bot", href: "/admin/seo-bot" },
          { label: "Drafts" },
        ]}
      >
        <Card>
          <CardHeader>
            <CardTitle>Content Drafts</CardTitle>
            <CardDescription>
              AI-generated content waiting for review and approval
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Word Count</TableHead>
                  <TableHead>Quality Score</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockDrafts.map((draft) => (
                  <TableRow key={draft.id}>
                    <TableCell className="font-medium max-w-md">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        {draft.title}
                      </div>
                    </TableCell>
                    <TableCell>{draft.wordCount}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className={`font-semibold ${draft.quality >= 90 ? 'text-green-600' : draft.quality >= 80 ? 'text-amber-600' : 'text-red-600'}`}>
                          {draft.quality}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[draft.status as keyof typeof statusColors]} variant="secondary">
                        {draft.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {draft.createdDate}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
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
