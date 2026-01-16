import { useState } from "react";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { AdminSidebar, AdminSection } from "@/components/admin/AdminSidebar";
import { SiteSelector } from "@/components/admin/SiteSelector";
import { OverviewDashboard } from "@/components/admin/OverviewDashboard";
import { AnalyticsDashboard } from "@/components/admin/AnalyticsDashboard";
import { SEOBotDashboard } from "@/components/admin/SEOBotDashboard";
import ContentManagementDashboard from "@/components/admin/ContentManagementDashboard";
import ImagesDashboard from "@/components/admin/ImagesDashboard";
import DeployDashboard from "@/components/admin/DeployDashboard";
import SettingsDashboard from "@/components/admin/SettingsDashboard";
import { Bell, User, Rocket } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import DraftsPage from './Drafts';

export default function AdminDashboardV2() {
  const [activeSection, setActiveSection] = useState<AdminSection>("overview");
  const [selectedSite, setSelectedSite] = useState("airport");

  const renderContent = () => {
    switch (activeSection) {
      case "overview":
        return <OverviewDashboard selectedSite={selectedSite} />;
      case "content":
        return <ContentManagementDashboard />;
      case "seo-bot":
        return <SEOBotDashboard />;
      case "images":
        return <ImagesDashboard />;
      case "analytics":
        return <AnalyticsDashboard />;
      case "deploy":
        return <DeployDashboard />;
      case "settings":
        return <SettingsDashboard />;
      default:
        return <OverviewDashboard selectedSite={selectedSite} />;
    }
  };

  return (
    <>
      <SEO
        title="Admin Dashboard v2 | Royal Carriage SEO System"
        description="AI-powered website management system for SEO optimization, content generation, and ROI tracking"
        noindex={true}
      />

      <div className="flex min-h-screen bg-gray-50">
        {/* Sidebar */}
        <AdminSidebar
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
            <div className="px-6 py-4 flex items-center justify-between">
              {/* Left: Site Selector */}
              <SiteSelector
                selectedSite={selectedSite}
                onSiteChange={setSelectedSite}
              />

              {/* Right: Actions + User */}
              <div className="flex items-center gap-3">
                {/* Notifications */}
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-red-500">
                    3
                  </Badge>
                </Button>

                {/* Deploy Button */}
                <Button className="gap-2">
                  <Rocket className="h-4 w-4" />
                  Deploy
                </Button>

                {/* User Menu */}
                <Button variant="outline" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </div>
              </div>

          {/* Content Area */}
          <main className="flex-1 p-6">{renderContent()}</main>
        </div>
      </div>
    </>
  );
}
                    <aside className="md:col-span-1">
