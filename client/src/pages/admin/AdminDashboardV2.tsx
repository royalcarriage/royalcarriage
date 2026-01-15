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
                  <Badge 
                    className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-red-500"
                  >
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
          return (
            <Layout>
              <SEO title="Admin" description="Admin dashboard" noindex />

              <div className="min-h-screen bg-gray-50 py-8">
                <div className="container mx-auto px-4 max-w-7xl">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <aside className="md:col-span-1">
                      <div className="space-y-4">
                        <nav className="space-y-1">
                          <button onClick={() => setActiveSection('overview')} className={`w-full text-left px-3 py-2 rounded ${activeSection === 'overview' ? 'bg-white shadow' : 'bg-transparent'}`}>Overview</button>
                          <button onClick={() => setActiveSection('analyze')} className={`w-full text-left px-3 py-2 rounded ${activeSection === 'analyze' ? 'bg-white shadow' : 'bg-transparent'}`}>Page Analyzer</button>
                          <button onClick={() => setActiveSection('drafts')} className={`w-full text-left px-3 py-2 rounded ${activeSection === 'drafts' ? 'bg-white shadow' : 'bg-transparent'}`}>AI Drafts</button>
                        </nav>
                      </div>
                    </aside>

                    <main className="md:col-span-3">
                      {activeSection === 'overview' && <DashboardPage />}
                      {activeSection === 'analyze' && <PageAnalyzer />}
                      {activeSection === 'drafts' && <DraftsPage />}
                    </main>
                  </div>
                </div>
              </div>
            </Layout>
          );
