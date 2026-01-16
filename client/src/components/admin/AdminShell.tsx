import { ReactNode } from "react";
import { TopBar } from "./TopBar";
import { SidebarAccordion } from "./SidebarAccordion";

interface AdminShellProps {
  children: ReactNode;
  currentSite?: string;
  onSiteChange?: (site: string) => void;
}

export function AdminShell({ children, currentSite, onSiteChange }: AdminShellProps) {
  return (
    <div className="flex h-screen flex-col">
      <TopBar currentSite={currentSite} onSiteChange={onSiteChange} />
      
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-64 overflow-y-auto border-r bg-white">
          <SidebarAccordion />
        </aside>
        
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
