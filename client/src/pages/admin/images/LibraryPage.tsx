import { AdminLayout } from "@/components/admin/AdminLayout";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Upload, Search, Image as ImageIcon, Trash2, Download } from "lucide-react";

const mockImages = [
  { id: 1, name: "airport-limo-ohare.jpg", size: "245 KB", uploaded: "2024-01-15", type: "Airport" },
  { id: 2, name: "wedding-limousine.jpg", size: "312 KB", uploaded: "2024-01-14", type: "Wedding" },
  { id: 3, name: "party-bus-exterior.jpg", size: "428 KB", uploaded: "2024-01-13", type: "Party Bus" },
  { id: 4, name: "corporate-sedan.jpg", size: "198 KB", uploaded: "2024-01-12", type: "Corporate" },
  { id: 5, name: "luxury-suv-interior.jpg", size: "356 KB", uploaded: "2024-01-11", type: "Fleet" },
  { id: 6, name: "midway-airport-pickup.jpg", size: "289 KB", uploaded: "2024-01-10", type: "Airport" },
];

export default function LibraryPage() {
  return (
    <>
      <SEO
        title="Image Library | Royal Carriage Admin"
        description="Manage image assets"
        noindex={true}
      />
      <AdminLayout
        title="Image Library"
        subtitle="Manage and organize image assets"
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Images", href: "/admin/images" },
          { label: "Library" },
        ]}
        actions={
          <Button>
            <Upload className="h-4 w-4 mr-2" />
            Upload Images
          </Button>
        }
      >
        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search images..."
                  className="pl-10"
                />
              </div>
              <Button variant="outline">Filter by Type</Button>
            </div>
          </CardContent>
        </Card>

        {/* Image Grid */}
        <Card>
          <CardHeader>
            <CardTitle>Image Gallery</CardTitle>
            <CardDescription>All uploaded images and assets</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {mockImages.map((image) => (
                <Card key={image.id} className="overflow-hidden group">
                  <div className="aspect-video bg-muted flex items-center justify-center relative">
                    <ImageIcon className="h-12 w-12 text-muted-foreground" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button variant="secondary" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="secondary" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <CardContent className="p-3">
                    <p className="text-sm font-medium truncate">{image.name}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-muted-foreground">{image.size}</span>
                      <Badge variant="outline" className="text-xs">{image.type}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </AdminLayout>
    </>
  );
}
