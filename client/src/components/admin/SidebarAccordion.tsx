import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FileText,
  Bot,
  Image,
  BarChart3,
  Rocket,
  Settings,
  ChevronDown,
  ChevronRight,
  FileUp,
  Users,
} from "lucide-react";

export type AdminSection =
  | "overview"
  | "imports"
  | "roi"
  | "seo_queue"
  | "seo_publish"
  | "images"
  | "deploy"
  | "users"
  | "settings";

interface SidebarAccordionProps {
  activeSection: AdminSection;
  onSectionChange: (section: AdminSection) => void;
}

interface SidebarSection {
  id: AdminSection;
  label: string;
  icon: React.ElementType;
  permissions: string[]; // Roles that can access
  subsections?: { id: string; label: string; permissions: string[] }[];
}

const SECTIONS: SidebarSection[] = [
  {
    id: "overview",
    label: "Overview",
    icon: LayoutDashboard,
    permissions: ["Viewer", "Editor", "Admin", "SuperAdmin"],
  },
  {
    id: "imports",
    label: "Data Imports",
    icon: FileUp,
    permissions: ["Editor", "Admin", "SuperAdmin"],
    subsections: [
      {
        id: "moovs",
        label: "Moovs Import",
        permissions: ["Editor", "Admin", "SuperAdmin"],
      },
      {
        id: "ads",
        label: "Ads Import",
        permissions: ["Editor", "Admin", "SuperAdmin"],
      },
      {
        id: "history",
        label: "Import History",
        permissions: ["Editor", "Admin", "SuperAdmin"],
      },
    ],
  },
  {
    id: "roi",
    label: "ROI Analytics",
    icon: BarChart3,
    permissions: ["Viewer", "Editor", "Admin", "SuperAdmin"],
    subsections: [
      {
        id: "dashboard",
        label: "Dashboard",
        permissions: ["Viewer", "Editor", "Admin", "SuperAdmin"],
      },
      {
        id: "service-mix",
        label: "Service Mix",
        permissions: ["Viewer", "Editor", "Admin", "SuperAdmin"],
      },
      {
        id: "keywords",
        label: "Keyword Analysis",
        permissions: ["Viewer", "Editor", "Admin", "SuperAdmin"],
      },
      {
        id: "landing-pages",
        label: "Landing Pages",
        permissions: ["Viewer", "Editor", "Admin", "SuperAdmin"],
      },
    ],
  },
  {
    id: "seo_queue",
    label: "SEO Queue",
    icon: Bot,
    permissions: ["Editor", "Admin", "SuperAdmin"],
    subsections: [
      {
        id: "queue",
        label: "Topic Queue",
        permissions: ["Editor", "Admin", "SuperAdmin"],
      },
      {
        id: "drafts",
        label: "Drafts",
        permissions: ["Editor", "Admin", "SuperAdmin"],
      },
      {
        id: "gates",
        label: "Quality Gates",
        permissions: ["Editor", "Admin", "SuperAdmin"],
      },
    ],
  },
  {
    id: "seo_publish",
    label: "SEO Publish",
    icon: Rocket,
    permissions: ["SuperAdmin"], // Only SuperAdmin can publish
  },
  {
    id: "images",
    label: "Images",
    icon: Image,
    permissions: ["Editor", "Admin", "SuperAdmin"],
    subsections: [
      {
        id: "library",
        label: "Library",
        permissions: ["Editor", "Admin", "SuperAdmin"],
      },
      {
        id: "missing",
        label: "Missing Images",
        permissions: ["Editor", "Admin", "SuperAdmin"],
      },
      {
        id: "upload",
        label: "Upload",
        permissions: ["Editor", "Admin", "SuperAdmin"],
      },
    ],
  },
  {
    id: "deploy",
    label: "Deploy",
    icon: Rocket,
    permissions: ["Admin", "SuperAdmin"],
  },
  {
    id: "users",
    label: "Users",
    icon: Users,
    permissions: ["SuperAdmin"],
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
    permissions: ["Admin", "SuperAdmin"],
  },
];

export function SidebarAccordion({
  activeSection,
  onSectionChange,
}: SidebarAccordionProps) {
  const { user } = useAuth();
  const userRole = user?.role || "Viewer";

  // Load persisted state from localStorage
  const [expandedSection, setExpandedSection] = useState<AdminSection | null>(
    () => {
      const stored = localStorage.getItem(`admin_sidebar_state_${user?.uid}`);
      return stored as AdminSection | null;
    },
  );

  // Persist expanded section to localStorage
  useEffect(() => {
    if (user?.uid) {
      if (expandedSection) {
        localStorage.setItem(
          `admin_sidebar_state_${user.uid}`,
          expandedSection,
        );
      } else {
        localStorage.removeItem(`admin_sidebar_state_${user.uid}`);
      }
    }
  }, [expandedSection, user?.uid]);

  const handleSectionClick = (section: SidebarSection) => {
    if (section.subsections) {
      // Toggle accordion - only one primary section open at a time
      setExpandedSection((prev) => (prev === section.id ? null : section.id));
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

  // Filter sections based on user permissions
  const visibleSections = SECTIONS.filter((section) =>
    section.permissions.includes(userRole),
  );

  return (
    <div className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h2 className="font-bold text-lg text-gray-900">Admin Dashboard</h2>
        <p className="text-xs text-gray-500 mt-1">Royal Carriage System</p>
      </div>

      <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
        {visibleSections.map((section) => {
          const Icon = section.icon;
          const isActive = activeSection === section.id;
          const isExpanded = expandedSection === section.id;
          const hasSubsections =
            section.subsections && section.subsections.length > 0;

          return (
            <div key={section.id}>
              {/* Main Section Button */}
              <button
                onClick={() => handleSectionClick(section)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                  isActive
                    ? "bg-amber-50 text-amber-700 shadow-sm"
                    : "text-gray-700 hover:bg-gray-50",
                )}
              >
                <Icon
                  className={cn(
                    "h-5 w-5",
                    isActive ? "text-amber-600" : "text-gray-500",
                  )}
                />
                <span className="flex-1 text-left">{section.label}</span>
                {hasSubsections &&
                  (isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  ))}
              </button>

              {/* Subsections (Accordion Content) */}
              {hasSubsections && isExpanded && (
                <div className="ml-11 mt-1 space-y-1">
                  {section
                    .subsections!.filter((sub) =>
                      sub.permissions.includes(userRole),
                    )
                    .map((subsection) => (
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
            <div className="mt-2 text-xs text-gray-400">
              Role:{" "}
              <span className="font-medium text-gray-600">{userRole}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
