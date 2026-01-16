import { AdminLayout } from "@/components/admin/AdminLayout";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Building2,
  Users,
  Shield,
  Bell,
  CreditCard,
  Palette,
  Link2,
  Save,
  Plus,
  Edit,
  Trash2,
  Check,
  X,
} from "lucide-react";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "owner" | "admin" | "manager" | "viewer";
  status: "active" | "pending";
  lastActive: string;
}

const teamMembers: TeamMember[] = [
  {
    id: "1",
    name: "Admin User",
    email: "admin@royalcarriage.com",
    role: "owner",
    status: "active",
    lastActive: "Now",
  },
  {
    id: "2",
    name: "John Manager",
    email: "john.m@royalcarriage.com",
    role: "admin",
    status: "active",
    lastActive: "2 hours ago",
  },
  {
    id: "3",
    name: "Sarah Coordinator",
    email: "sarah.c@royalcarriage.com",
    role: "manager",
    status: "active",
    lastActive: "1 day ago",
  },
  {
    id: "4",
    name: "Mike Viewer",
    email: "mike.v@royalcarriage.com",
    role: "viewer",
    status: "pending",
    lastActive: "Never",
  },
];

const roleColors: Record<TeamMember["role"], string> = {
  owner:
    "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  admin: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  manager:
    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  viewer: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
};

const permissions = [
  {
    feature: "Dashboard",
    owner: true,
    admin: true,
    manager: true,
    viewer: true,
  },
  {
    feature: "View Trips",
    owner: true,
    admin: true,
    manager: true,
    viewer: true,
  },
  {
    feature: "Create/Edit Trips",
    owner: true,
    admin: true,
    manager: true,
    viewer: false,
  },
  {
    feature: "Delete Trips",
    owner: true,
    admin: true,
    manager: false,
    viewer: false,
  },
  {
    feature: "View Drivers",
    owner: true,
    admin: true,
    manager: true,
    viewer: true,
  },
  {
    feature: "Manage Drivers",
    owner: true,
    admin: true,
    manager: true,
    viewer: false,
  },
  {
    feature: "View Vehicles",
    owner: true,
    admin: true,
    manager: true,
    viewer: true,
  },
  {
    feature: "Manage Vehicles",
    owner: true,
    admin: true,
    manager: false,
    viewer: false,
  },
  {
    feature: "Import Data",
    owner: true,
    admin: true,
    manager: false,
    viewer: false,
  },
  {
    feature: "View Payroll",
    owner: true,
    admin: true,
    manager: true,
    viewer: false,
  },
  {
    feature: "Approve Payouts",
    owner: true,
    admin: true,
    manager: false,
    viewer: false,
  },
  {
    feature: "Process Payments",
    owner: true,
    admin: false,
    manager: false,
    viewer: false,
  },
  {
    feature: "Manage Users",
    owner: true,
    admin: true,
    manager: false,
    viewer: false,
  },
  {
    feature: "Organization Settings",
    owner: true,
    admin: false,
    manager: false,
    viewer: false,
  },
  {
    feature: "Billing",
    owner: true,
    admin: false,
    manager: false,
    viewer: false,
  },
];

export default function SettingsPage() {
  return (
    <>
      <SEO
        title="Settings | Royal Carriage Admin"
        description="Manage organization settings"
        noindex={true}
      />
      <AdminLayout
        title="Settings"
        subtitle="Manage your organization settings and preferences"
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Settings" },
        ]}
      >
        <Tabs defaultValue="organization" className="space-y-6">
          <TabsList className="flex flex-wrap h-auto gap-2">
            <TabsTrigger value="organization" className="gap-2">
              <Building2 className="h-4 w-4" />
              Organization
            </TabsTrigger>
            <TabsTrigger value="team" className="gap-2">
              <Users className="h-4 w-4" />
              Team & Users
            </TabsTrigger>
            <TabsTrigger value="permissions" className="gap-2">
              <Shield className="h-4 w-4" />
              Permissions
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="billing" className="gap-2">
              <CreditCard className="h-4 w-4" />
              Billing
            </TabsTrigger>
            <TabsTrigger value="integrations" className="gap-2">
              <Link2 className="h-4 w-4" />
              Integrations
            </TabsTrigger>
          </TabsList>

          {/* Organization Settings */}
          <TabsContent value="organization">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Organization Details</CardTitle>
                  <CardDescription>
                    Basic information about your organization
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="orgName">Organization Name</Label>
                      <Input
                        id="orgName"
                        defaultValue="Royal Carriage Limousine"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="orgSlug">URL Slug</Label>
                      <Input id="orgSlug" defaultValue="royal-carriage" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="orgEmail">Contact Email</Label>
                      <Input
                        id="orgEmail"
                        type="email"
                        defaultValue="contact@royalcarriage.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="orgPhone">Phone Number</Label>
                      <Input id="orgPhone" defaultValue="(224) 801-3090" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="orgAddress">Address</Label>
                    <Input id="orgAddress" defaultValue="Chicago, IL" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select defaultValue="america-chicago">
                      <SelectTrigger className="w-full md:w-64">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="america-chicago">
                          America/Chicago (CST)
                        </SelectItem>
                        <SelectItem value="america-new_york">
                          America/New_York (EST)
                        </SelectItem>
                        <SelectItem value="america-los_angeles">
                          America/Los_Angeles (PST)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="h-5 w-5" />
                    Branding
                  </CardTitle>
                  <CardDescription>
                    Customize your organization's appearance
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center gap-6">
                    <div className="h-20 w-20 rounded-lg bg-muted flex items-center justify-center">
                      <Building2 className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <div>
                      <Button variant="outline" size="sm">
                        Upload Logo
                      </Button>
                      <p className="text-xs text-muted-foreground mt-1">
                        PNG, JPG up to 2MB. Recommended: 200x200px
                      </p>
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Primary Color</Label>
                      <div className="flex items-center gap-2">
                        <div className="h-10 w-10 rounded bg-primary border" />
                        <Input defaultValue="#000000" className="w-32" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Accent Color</Label>
                      <div className="flex items-center gap-2">
                        <div className="h-10 w-10 rounded bg-blue-600 border" />
                        <Input defaultValue="#2563eb" className="w-32" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Team & Users */}
          <TabsContent value="team">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Team Members</CardTitle>
                    <CardDescription>
                      Manage who has access to your organization
                    </CardDescription>
                  </div>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Invite Member
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Member</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Active</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {teamMembers.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarFallback>
                                {member.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{member.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {member.email}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={roleColors[member.role]}
                            variant="secondary"
                          >
                            {member.role.charAt(0).toUpperCase() +
                              member.role.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {member.status === "active" ? (
                            <Badge variant="outline" className="text-green-600">
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-amber-600">
                              Pending
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {member.lastActive}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            {member.role !== "owner" && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Permissions Matrix */}
          <TabsContent value="permissions">
            <Card>
              <CardHeader>
                <CardTitle>Role Permissions</CardTitle>
                <CardDescription>
                  View and understand what each role can access
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Feature</TableHead>
                      <TableHead className="text-center">Owner</TableHead>
                      <TableHead className="text-center">Admin</TableHead>
                      <TableHead className="text-center">Manager</TableHead>
                      <TableHead className="text-center">Viewer</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {permissions.map((perm) => (
                      <TableRow key={perm.feature}>
                        <TableCell className="font-medium">
                          {perm.feature}
                        </TableCell>
                        <TableCell className="text-center">
                          {perm.owner ? (
                            <Check className="h-4 w-4 text-green-600 mx-auto" />
                          ) : (
                            <X className="h-4 w-4 text-muted-foreground mx-auto" />
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {perm.admin ? (
                            <Check className="h-4 w-4 text-green-600 mx-auto" />
                          ) : (
                            <X className="h-4 w-4 text-muted-foreground mx-auto" />
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {perm.manager ? (
                            <Check className="h-4 w-4 text-green-600 mx-auto" />
                          ) : (
                            <X className="h-4 w-4 text-muted-foreground mx-auto" />
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {perm.viewer ? (
                            <Check className="h-4 w-4 text-green-600 mx-auto" />
                          ) : (
                            <X className="h-4 w-4 text-muted-foreground mx-auto" />
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Configure how and when you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Email Notifications</h4>
                  <div className="space-y-3">
                    {[
                      {
                        label: "New trip bookings",
                        description: "Get notified when a new trip is booked",
                      },
                      {
                        label: "Trip updates",
                        description: "Changes to trip status or details",
                      },
                      {
                        label: "Import completions",
                        description: "When data imports finish",
                      },
                      {
                        label: "Payout reminders",
                        description: "Weekly payout batch reminders",
                      },
                      {
                        label: "Driver alerts",
                        description: "Important driver notifications",
                      },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="flex items-center justify-between"
                      >
                        <div>
                          <p className="font-medium">{item.label}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.description}
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    ))}
                  </div>
                </div>
                <Separator />
                <div className="space-y-4">
                  <h4 className="font-medium">Push Notifications</h4>
                  <div className="space-y-3">
                    {[
                      {
                        label: "Critical alerts",
                        description:
                          "Urgent issues requiring immediate attention",
                      },
                      {
                        label: "Real-time trip updates",
                        description: "Live updates for in-progress trips",
                      },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="flex items-center justify-between"
                      >
                        <div>
                          <p className="font-medium">{item.label}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.description}
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    ))}
                  </div>
                </div>
                <Button>
                  <Save className="h-4 w-4 mr-2" />
                  Save Preferences
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Billing */}
          <TabsContent value="billing">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Current Plan</CardTitle>
                  <CardDescription>
                    Manage your subscription and billing
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium text-lg">Professional Plan</p>
                      <p className="text-muted-foreground">
                        $99/month • Billed monthly
                      </p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">
                      Active
                    </Badge>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button variant="outline">Change Plan</Button>
                    <Button variant="outline">View Invoices</Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Payment Method</CardTitle>
                  <CardDescription>
                    Manage your payment information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 p-4 border rounded-lg">
                    <CreditCard className="h-8 w-8 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="font-medium">•••• •••• •••• 4242</p>
                      <p className="text-sm text-muted-foreground">
                        Expires 12/25
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Update
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Integrations */}
          <TabsContent value="integrations">
            <Card>
              <CardHeader>
                <CardTitle>Integrations</CardTitle>
                <CardDescription>
                  Connect third-party services to your organization
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  {
                    name: "Moovs",
                    description: "Booking and dispatch integration",
                    status: "connected",
                  },
                  {
                    name: "Google Analytics",
                    description: "Website and booking analytics",
                    status: "not_connected",
                  },
                  {
                    name: "Stripe",
                    description: "Payment processing",
                    status: "connected",
                  },
                  {
                    name: "QuickBooks",
                    description: "Accounting and invoicing",
                    status: "not_connected",
                  },
                ].map((integration) => (
                  <div
                    key={integration.name}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                        <Link2 className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">{integration.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {integration.description}
                        </p>
                      </div>
                    </div>
                    {integration.status === "connected" ? (
                      <div className="flex items-center gap-2">
                        <Badge className="bg-green-100 text-green-800">
                          Connected
                        </Badge>
                        <Button variant="outline" size="sm">
                          Configure
                        </Button>
                      </div>
                    ) : (
                      <Button size="sm">Connect</Button>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </AdminLayout>
    </>
  );
}
