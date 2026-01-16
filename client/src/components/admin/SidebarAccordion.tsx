import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Link } from "wouter";
import { 
  Home, 
  Upload, 
  DollarSign, 
  Globe, 
  Bot, 
  Image, 
  Rocket, 
  Users, 
  Settings, 
  FileText 
} from "lucide-react";

export function SidebarAccordion() {
  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="overview">
        <AccordionTrigger className="px-4 py-2 hover:bg-gray-100">
          <div className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            <span>Overview</span>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <Link href="/admin/overview">
            <a className="block px-8 py-2 text-sm hover:bg-gray-100">
              KPI Dashboard
            </a>
          </Link>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="imports">
        <AccordionTrigger className="px-4 py-2 hover:bg-gray-100">
          <div className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            <span>Imports</span>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <Link href="/admin/imports/moovs">
            <a className="block px-8 py-2 text-sm hover:bg-gray-100">
              Moovs CSV
            </a>
          </Link>
          <Link href="/admin/imports/ads">
            <a className="block px-8 py-2 text-sm hover:bg-gray-100">
              Google Ads
            </a>
          </Link>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="roi">
        <AccordionTrigger className="px-4 py-2 hover:bg-gray-100">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            <span>ROI</span>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <Link href="/admin/roi">
            <a className="block px-8 py-2 text-sm hover:bg-gray-100">
              ROI Dashboard
            </a>
          </Link>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="sites">
        <AccordionTrigger className="px-4 py-2 hover:bg-gray-100">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            <span>Sites</span>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <Link href="/admin/sites/airport">
            <a className="block px-8 py-2 text-sm hover:bg-gray-100">
              Airport
            </a>
          </Link>
          <Link href="/admin/sites/partybus">
            <a className="block px-8 py-2 text-sm hover:bg-gray-100">
              Party Bus
            </a>
          </Link>
          <Link href="/admin/sites/corporate">
            <a className="block px-8 py-2 text-sm hover:bg-gray-100">
              Corporate
            </a>
          </Link>
          <Link href="/admin/sites/wedding">
            <a className="block px-8 py-2 text-sm hover:bg-gray-100">
              Wedding
            </a>
          </Link>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="seo-bot">
        <AccordionTrigger className="px-4 py-2 hover:bg-gray-100">
          <div className="flex items-center gap-2">
            <Bot className="h-4 w-4" />
            <span>SEO Bot</span>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <Link href="/admin/seo-bot/queue">
            <a className="block px-8 py-2 text-sm hover:bg-gray-100">
              Topic Queue
            </a>
          </Link>
          <Link href="/admin/seo-bot/drafts">
            <a className="block px-8 py-2 text-sm hover:bg-gray-100">
              Drafts
            </a>
          </Link>
          <Link href="/admin/seo-bot/runs">
            <a className="block px-8 py-2 text-sm hover:bg-gray-100">
              Run History
            </a>
          </Link>
          <Link href="/admin/seo-bot/publish">
            <a className="block px-8 py-2 text-sm hover:bg-gray-100">
              Publish
            </a>
          </Link>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="images">
        <AccordionTrigger className="px-4 py-2 hover:bg-gray-100">
          <div className="flex items-center gap-2">
            <Image className="h-4 w-4" />
            <span>Images</span>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <Link href="/admin/images/library">
            <a className="block px-8 py-2 text-sm hover:bg-gray-100">
              Library
            </a>
          </Link>
          <Link href="/admin/images/missing">
            <a className="block px-8 py-2 text-sm hover:bg-gray-100">
              Missing Images
            </a>
          </Link>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="deploy">
        <AccordionTrigger className="px-4 py-2 hover:bg-gray-100">
          <div className="flex items-center gap-2">
            <Rocket className="h-4 w-4" />
            <span>Deploy</span>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <Link href="/admin/deploy">
            <a className="block px-8 py-2 text-sm hover:bg-gray-100">
              Deploy Controls
            </a>
          </Link>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="users">
        <AccordionTrigger className="px-4 py-2 hover:bg-gray-100">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>Users</span>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <Link href="/admin/users">
            <a className="block px-8 py-2 text-sm hover:bg-gray-100">
              User Management
            </a>
          </Link>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="settings">
        <AccordionTrigger className="px-4 py-2 hover:bg-gray-100">
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <Link href="/admin/settings">
            <a className="block px-8 py-2 text-sm hover:bg-gray-100">
              Global Settings
            </a>
          </Link>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="logs">
        <AccordionTrigger className="px-4 py-2 hover:bg-gray-100">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span>Logs</span>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <Link href="/admin/logs">
            <a className="block px-8 py-2 text-sm hover:bg-gray-100">
              Activity Logs
            </a>
          </Link>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
