import { useState } from "react";
import { 
  LayoutDashboard, 
  FileText, 
  Bot, 
  Image, 
  BarChart3, 
  Rocket, 
  Settings,
  ChevronDown,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

export type AdminSection = 
  | "overview"
  | "content"
  | "seo-bot"
  | "images"
  | "analytics"
  | "deploy"
  | "settings";

interface AdminSidebarProps {
  activeSection: AdminSection;
  onSectionChange: (section: AdminSection) => void;
}

interface SidebarSection {
  id: AdminSection;
  label: string;
  icon: React.ElementType;
  subsections?: { id: string; label: string }[];
}

const SECTIONS: SidebarSection[] = [
  {
    id: "overview",
    label: "Overview",
    icon: LayoutDashboard,
  },
  {
    id: "content",
    label: "Content",
    icon: FileText,
    subsections: [
      { id: "pages", label: "Pages" },
      { id: "drafts", label: "Drafts" },
      { id: "city-manager", label: "City Manager" },
    ],
  },
  {
    id: "seo-bot",
    label: "SEO Autobot",
    icon: Bot,
    subsections: [
      { id: "propose", label: "Propose Topics" },
      { id: "drafts", label: "Manage Drafts" },
      { id: "quality", label: "Quality Gates" },
      { id: "publish", label: "Publish" },
    ],
  },
  {
    id: "images",
    label: "Images",
    icon: Image,
    subsections: [
      { id: "inventory", label: "Inventory" },
      { id: "upload", label: "Upload" },
      { id: "generate", label: "AI Generate" },
      { id: "missing", label: "Missing Images" },
    ],
  },
  {
    id: "analytics",
    label: "Analytics & ROI",
    icon: BarChart3,
    subsections: [
      { id: "dashboard", label: "Dashboard" },
      { id: "upload", label: "Upload CSVs" },
      { id: "reports", label: "Reports" },
      { id: "keywords", label: "Keyword Clusters" },
    ],
  },
  {
    id: "deploy",
    label: "Deploy",
    icon: Rocket,
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
  },
];

export function AdminSidebar({ activeSection, onSectionChange }: AdminSidebarProps) {
  const [expandedSection, setExpandedSection] = useState<AdminSection | null>(
    SECTIONS.find(s => s.id === activeSection && s.subsections)?.id || null
  );

  const handleSectionClick = (section: SidebarSection) => {
    if (section.subsections) {
      // Toggle accordion
      setExpandedSection(prev => prev === section.id ? null : section.id);
      // If expanding, set as active
      if (expandedSection !== section.id) {
        onSectionChange(section.id);
      }
    } else {
      // Close any expanded sections and set as active
      setExpandedSection(null);
      onSectionChange(section.id);
    }
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h2 className="font-bold text-lg text-gray-900">Admin Control</h2>
        <p className="text-xs text-gray-500 mt-1">Royal Carriage SEO System</p>
      </div>

      <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
        {SECTIONS.map((section) => {
          const Icon = section.icon;
          const isActive = activeSection === section.id;
          const isExpanded = expandedSection === section.id;
          const hasSubsections = section.subsections && section.subsections.length > 0;

          return (
            <div key={section.id}>
              {/* Main Section Button */}
              <button
                onClick={() => handleSectionClick(section)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                  isActive
                    ? "bg-blue-50 text-blue-700 shadow-sm"
                    : "text-gray-700 hover:bg-gray-50"
                )}
              >
                <Icon className={cn(
                  "h-5 w-5",
                  isActive ? "text-blue-600" : "text-gray-500"
                )} />
                <span className="flex-1 text-left">{section.label}</span>
                {hasSubsections && (
                  isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  )
                )}
              </button>

              {/* Subsections (Accordion Content) */}
              {hasSubsections && isExpanded && (
                <div className="ml-11 mt-1 space-y-1">
                  {section.subsections!.map((subsection) => (
                    <button
                      key={subsection.id}
                      className="w-full text-left px-3 py-1.5 rounded-md text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                    >
                      {subsection.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-4 mt-auto border-t border-gray-200">
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="text-xs text-gray-500">
            <div className="font-medium text-gray-700 mb-1">System Status</div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></span>
              <span>All systems operational</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
