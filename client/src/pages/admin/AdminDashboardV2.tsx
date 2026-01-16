import { useState } from "react";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AdminSidebar, type AdminSection } from "@/components/admin/AdminSidebar";
import { SiteSelector } from "@/components/admin/SiteSelector";
import { OverviewDashboard } from "@/components/admin/OverviewDashboard";
import { AnalyticsDashboard } from "@/components/admin/AnalyticsDashboard";
import { SEOBotDashboard } from "@/components/admin/SEOBotDashboard";
import ContentManagementDashboard from "@/components/admin/ContentManagementDashboard";
import ImagesDashboard from "@/components/admin/ImagesDashboard";
import DeployDashboard from "@/components/admin/DeployDashboard";
import SettingsDashboard from "@/components/admin/SettingsDashboard";
import { Bell, User, Rocket } from "lucide-react";

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
        noindex
      />

      <div className="flex min-h-screen bg-gray-50">
        <AdminSidebar 
          activeSection={activeSection} 
          onSectionChange={setActiveSection} 
        />

        <div className="flex-1 flex flex-col">
          <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
            <div className="px-6 py-4 flex items-center justify-between">
              <SiteSelector 
                selectedSite={selectedSite}
                onSiteChange={setSelectedSite}
              />

              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  <Badge 
                    className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-red-500"
                  >
                    3
                  </Badge>
                </Button>

                <Button className="gap-2">
                  <Rocket className="h-4 w-4" />
                  Deploy
                </Button>

                <Button variant="outline" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <div className="px-6 pb-3 text-sm text-gray-600 flex items-center gap-4">
              <span className="font-semibold text-gray-900 capitalize">
                {selectedSite} environment
              </span>
              <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-green-50 text-green-700 border border-green-100">
                <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                All systems operational
              </span>
              <span className="inline-flex items-center gap-1 text-gray-500">
                <Rocket className="h-4 w-4 text-gray-400" />
                Next deploy available after checks pass
              </span>
            </div>
          </header>

          <main className="flex-1 p-6 space-y-6">
            {renderContent()}
          </main>
        </div>
      </div>
    </>
  );
}
