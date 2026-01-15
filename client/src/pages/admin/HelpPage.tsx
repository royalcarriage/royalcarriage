import { AdminLayout } from "@/components/admin/AdminLayout";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  HelpCircle,
  MessageCircle,
  Phone,
  Mail,
  FileText,
  ExternalLink,
  Book,
  Video,
  Headphones,
  Clock,
  Search,
  ChevronRight,
} from "lucide-react";

const faqs = [
  {
    question: "How do I add a new driver to the system?",
    answer: "Navigate to Operations > Drivers and click 'Add Driver'. Fill in the required information including name, contact details, and upload any required documents. The driver will be marked as pending until their documents are verified.",
  },
  {
    question: "How do I import trip data from a CSV file?",
    answer: "Go to Data Management > Import Center and click 'New Import'. Select 'Trips' as the data type, upload your CSV file, map the columns to the appropriate fields, review the preview, and click 'Start Import'. You can track the progress and see any errors in the Import History.",
  },
  {
    question: "How do I process weekly payouts for drivers?",
    answer: "Navigate to Finance > Payroll. The system automatically calculates weekly payouts based on completed trips. Review the payout amounts, apply any necessary deductions, select the drivers to include, and click 'Approve Selected' to process the batch.",
  },
  {
    question: "How can I generate an invoice for a corporate customer?",
    answer: "Go to Finance > Invoices and click 'Create Invoice'. Select the customer, choose the date range for trips to include, review the line items, and click 'Create'. You can then send the invoice directly to the customer via email or download it as a PDF.",
  },
  {
    question: "How do I set up user permissions and roles?",
    answer: "Navigate to Settings > Team & Users to manage your team members. You can invite new users, assign roles (Owner, Admin, Manager, Viewer), and view the permissions matrix to understand what each role can access.",
  },
  {
    question: "How do I track vehicle maintenance schedules?",
    answer: "Go to Operations > Vehicles to view your fleet. Each vehicle card shows the last service date and mileage. You can set up maintenance reminders and mark vehicles as 'Maintenance' status when they're being serviced.",
  },
];

const resources = [
  {
    title: "Getting Started Guide",
    description: "Learn the basics of using Royal Carriage Admin",
    icon: Book,
    href: "#",
  },
  {
    title: "Video Tutorials",
    description: "Watch step-by-step video guides",
    icon: Video,
    href: "#",
  },
  {
    title: "API Documentation",
    description: "Technical documentation for integrations",
    icon: FileText,
    href: "#",
  },
  {
    title: "Best Practices",
    description: "Tips for optimizing your operations",
    icon: HelpCircle,
    href: "#",
  },
];

export default function HelpPage() {
  return (
    <>
      <SEO
        title="Help & Support | Royal Carriage Admin"
        description="Get help and support"
        noindex={true}
      />
      <AdminLayout
        title="Help & Support"
        subtitle="Get answers to your questions and contact our support team"
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Help & Support" },
        ]}
      >
        {/* Search */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-2xl font-bold mb-2">How can we help you?</h2>
              <p className="text-muted-foreground mb-4">
                Search our knowledge base or browse frequently asked questions
              </p>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search for help articles..."
                  className="pl-10 h-12"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* FAQs */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
                <CardDescription>
                  Quick answers to common questions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {faqs.map((faq, index) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                      <AccordionTrigger className="text-left">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </div>

          {/* Support & Resources */}
          <div className="space-y-6">
            {/* Contact Support */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Headphones className="h-5 w-5" />
                  Contact Support
                </CardTitle>
                <CardDescription>
                  Get in touch with our support team
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-lg border">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <MessageCircle className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Live Chat</p>
                    <p className="text-xs text-muted-foreground">
                      Available 24/7
                    </p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Online</Badge>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg border">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">(224) 801-3090</p>
                    <p className="text-xs text-muted-foreground">
                      Mon-Fri 9AM-6PM CST
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg border">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">support@royalcarriage.com</p>
                    <p className="text-xs text-muted-foreground">
                      Response within 24 hours
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Resources */}
            <Card>
              <CardHeader>
                <CardTitle>Resources</CardTitle>
                <CardDescription>
                  Helpful guides and documentation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {resources.map((resource) => {
                  const Icon = resource.icon;
                  return (
                    <a
                      key={resource.title}
                      href={resource.href}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
                    >
                      <Icon className="h-5 w-5 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{resource.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {resource.description}
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </a>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Submit a Request */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Submit a Support Request</CardTitle>
            <CardDescription>
              Can't find what you're looking for? Send us a message and we'll get back to you.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4 max-w-2xl">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Your Name</Label>
                  <Input id="name" placeholder="John Smith" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" placeholder="john@example.com" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" placeholder="What do you need help with?" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Describe your issue in detail..."
                  rows={5}
                />
              </div>
              <Button type="submit">
                Submit Request
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* System Status */}
        <Card className="mt-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>System Status</CardTitle>
                <CardDescription>Current status of all services</CardDescription>
              </div>
              <Badge className="bg-green-100 text-green-800">All Systems Operational</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: "Web Application", status: "operational" },
                { name: "API Services", status: "operational" },
                { name: "Payment Processing", status: "operational" },
                { name: "Email Notifications", status: "operational" },
                { name: "Data Import/Export", status: "operational" },
              ].map((service) => (
                <div
                  key={service.name}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <span className="text-sm">{service.name}</span>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    <span className="text-sm text-green-600">Operational</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>Last updated: Just now</span>
            </div>
          </CardContent>
        </Card>
      </AdminLayout>
    </>
  );
}
