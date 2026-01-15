import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Sparkles,
  Workflow,
  Wand2,
  Image as ImageIcon,
  Rocket,
  TrendingUp,
  CheckCircle2,
  Timer,
  Gauge,
  Braces,
  Rows4,
  ShieldCheck,
  AlarmClock,
} from "lucide-react";

type SiteKey = "airport" | "corporate" | "wedding" | "partybus";

const SITES: Record<
  SiteKey,
  {
    name: string;
    domain: string;
    status: "live" | "building" | "pending";
    text: number;
    seo: number;
    images: number;
    issues?: string[];
  }
> = {
  airport: {
    name: "Airport",
    domain: "chicagoairportblackcar.com",
    status: "live",
    text: 82,
    seo: 76,
    images: 65,
    issues: ["Missing Midway fleet WebP set", "Add CTA ribbon on pricing"],
  },
  corporate: {
    name: "Corporate",
    domain: "chicagoexecutivecarservice.com",
    status: "pending",
    text: 61,
    seo: 54,
    images: 42,
    issues: ["Trust badges not placed above fold", "No sitemap.xml yet"],
  },
  wedding: {
    name: "Wedding",
    domain: "chicagoweddingtransportation.com",
    status: "building",
    text: 55,
    seo: 48,
    images: 38,
    issues: ["Need hero copy + testimonials", "Missing fleet images"],
  },
  partybus: {
    name: "Party Bus",
    domain: "chicago-partybus.com",
    status: "pending",
    text: 58,
    seo: 51,
    images: 30,
    issues: ["Gallery empty", "No robots/sitemap"],
  },
};

const statusStyles = {
  live: "bg-green-100 text-green-800",
  building: "bg-blue-100 text-blue-800",
  pending: "bg-amber-100 text-amber-800",
};

const PAGE_TYPES = [
  "Homepage",
  "Service (Airport)",
  "Service (Corporate)",
  "Service (Wedding)",
  "Fleet",
  "Pricing",
  "City / Suburb",
  "About",
  "Contact",
];

const CTA_OPTIONS = [
  "Call dispatch now",
  "Book online",
  "Request quote",
  "Text your driver",
];

const TRUST_ELEMENTS = [
  "Licensed + insured",
  "Flight tracking",
  "No surge pricing",
  "Professional chauffeurs",
];

export function AIOpsDashboard() {
  const [selectedSite, setSelectedSite] = useState<SiteKey>("airport");
  const [pageType, setPageType] = useState("Homepage");
  const [keywords, setKeywords] = useState("airport car service, ORD transfer, Midway limo");
  const [cta, setCta] = useState("Call dispatch now");
  const [trust, setTrust] = useState("Licensed + insured; No surge pricing; Flight tracking");
  const [tone, setTone] = useState("Confident, timely, hospitality-first");

  const selected = useMemo(() => SITES[selectedSite], [selectedSite]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-purple-50 px-3 py-1 text-sm font-semibold text-purple-800">
            <Sparkles className="h-4 w-4" />
            AI Ops Control Room
          </div>
          <h2 className="mt-2 text-2xl font-bold text-gray-900">AI SEO + Creative Pipeline</h2>
          <p className="text-gray-600">
            Four-site command center for text briefs, image prompts, SEO fixes, and deploy readiness.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="bg-emerald-100 text-emerald-800 border-none">Preview smoke: Ready</Badge>
          <Badge className="bg-blue-100 text-blue-800 border-none">Prod guardrails: On</Badge>
        </div>
      </div>

      {/* Pipelines */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(SITES).map(([id, site]) => (
          <Card
            key={id}
            className={`relative overflow-hidden border ${
              selectedSite === id ? "border-blue-500 shadow-md" : "border-gray-200"
            }`}
          >
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-amber-400" />
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <CardTitle className="text-lg">{site.name}</CardTitle>
                  <CardDescription>{site.domain}</CardDescription>
                </div>
                <Badge className={`${statusStyles[site.status]} border-none capitalize`}>{site.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span>Text</span>
                  <span className="font-semibold text-gray-900">{site.text}%</span>
                </div>
                <Progress value={site.text} />
              </div>
              <div>
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span>SEO / Schemas</span>
                  <span className="font-semibold text-gray-900">{site.seo}%</span>
                </div>
                <Progress value={site.seo} />
              </div>
              <div>
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span>Images</span>
                  <span className="font-semibold text-gray-900">{site.images}%</span>
                </div>
                <Progress value={site.images} />
              </div>
              {site.issues && site.issues.length > 0 && (
                <div className="space-y-1">
                  {site.issues.map((issue) => (
                    <div
                      key={issue}
                      className="text-xs text-amber-800 bg-amber-50 border border-amber-100 rounded-md px-2 py-1 flex items-center gap-1.5"
                    >
                      <AlarmClock className="h-3.5 w-3.5" />
                      {issue}
                    </div>
                  ))}
                </div>
              )}
              <Button
                variant={selectedSite === id ? "default" : "outline"}
                size="sm"
                className="w-full"
                onClick={() => setSelectedSite(id as SiteKey)}
              >
                Focus {site.name}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Brief Builder */}
        <Card className="lg:col-span-2 border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Workflow className="h-5 w-5 text-blue-600" />
              AI Brief + Copy Blueprint
            </CardTitle>
            <CardDescription>
              Generate on-brand briefs with CTA/trust anchors for the selected site. Wire into quality gates before publish.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label className="text-sm text-gray-700">Page type</Label>
                <select
                  className="mt-1 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  value={pageType}
                  onChange={(e) => setPageType(e.target.value)}
                >
                  {PAGE_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label className="text-sm text-gray-700">Primary CTA</Label>
                <select
                  className="mt-1 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  value={cta}
                  onChange={(e) => setCta(e.target.value)}
                >
                  {CTA_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label className="text-sm text-gray-700">Keywords / intent</Label>
                <Input value={keywords} onChange={(e) => setKeywords(e.target.value)} />
              </div>
              <div>
                <Label className="text-sm text-gray-700">Trust anchors</Label>
                <Input value={trust} onChange={(e) => setTrust(e.target.value)} />
              </div>
            </div>

            <div>
              <Label className="text-sm text-gray-700">Voice & style</Label>
              <Textarea
                rows={3}
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                placeholder="Voice, tone, and design intent"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3 rounded-lg border border-dashed border-blue-200 bg-blue-50">
                <div className="text-xs uppercase tracking-wide text-blue-800 font-semibold">SEO</div>
                <p className="text-sm text-blue-900 mt-1">Add schema, internal links, robots/sitemap hooks.</p>
              </div>
              <div className="p-3 rounded-lg border border-dashed border-purple-200 bg-purple-50">
                <div className="text-xs uppercase tracking-wide text-purple-800 font-semibold">Conversion</div>
                <p className="text-sm text-purple-900 mt-1">CTA ribbons + sticky mobile bar; pricing anchors.</p>
              </div>
              <div className="p-3 rounded-lg border border-dashed border-emerald-200 bg-emerald-50">
                <div className="text-xs uppercase tracking-wide text-emerald-800 font-semibold">Content Depth</div>
                <p className="text-sm text-emerald-900 mt-1">400–800 words, localized proof, FAQ blocks.</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button className="gap-2">
                <Wand2 className="h-4 w-4" />
                Generate AI Brief
              </Button>
              <Button variant="outline" className="gap-2">
                <Braces className="h-4 w-4" />
                Export to JSON
              </Button>
              <Button variant="ghost" className="gap-2">
                <TrendingUp className="h-4 w-4" />
                Send to Quality Gate
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quality & Deploy */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
              Quality Gates & Deploy Prep
            </CardTitle>
            <CardDescription>Keep preview/prod safe while auto-deploying fixes.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-gray-900">Preview smoke</div>
                <p className="text-xs text-gray-600">Home, admin, auth flows</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-gray-900">Prod canary</div>
                <p className="text-xs text-gray-600">Promote after green gates</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-gray-900">Rate limiter + deployImages</div>
                <p className="text-xs text-gray-600">Enforce bucket + per-day caps</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="rounded-lg border border-dashed border-gray-200 p-3 space-y-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                <Gauge className="h-4 w-4 text-blue-600" />
                Pipeline health
              </div>
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>Lint / Typecheck</span>
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-none">
                  Passing
                </Badge>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>Build</span>
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-none">
                  Passing
                </Badge>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>Image inventory</span>
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-none">
                  Fleet gaps
                </Badge>
              </div>
            </div>

            <Button className="w-full gap-2">
              <Rocket className="h-4 w-4" />
              Deploy after gates
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Image prompt matrix */}
        <Card className="lg:col-span-2 border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-indigo-600" />
              Image Prompt Kit
            </CardTitle>
            <CardDescription>Ready-to-ship prompts with aspect ratios per placement.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { label: "Hero", aspect: "16:9", spec: "1920x1080", note: "airport + skyline" },
                { label: "Fleet", aspect: "4:3", spec: "800x600", note: "side/profile" },
                { label: "Testimonial", aspect: "1:1", spec: "400x400", note: "guest + chauffeur" },
              ].map((item) => (
                <div key={item.label} className="p-3 rounded-lg border border-gray-200">
                  <div className="text-sm font-semibold text-gray-900">{item.label}</div>
                  <div className="text-xs text-gray-600">Aspect {item.aspect}</div>
                  <div className="text-xs text-gray-500">Spec {item.spec}</div>
                  <div className="text-xs text-gray-500 mt-1">{item.note}</div>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              {[
                { site: "Airport", prompt: "luxury black sedan at O'Hare terminal, cinematic lighting, professional chauffeur, nighttime rain reflections" },
                { site: "Corporate", prompt: "executive black SUV curbside at downtown Chicago office tower, golden hour, subtle lens flare, suited chauffeur" },
                { site: "Wedding", prompt: "white stretch limo outside historic Chicago church, bride and groom, sunset glow, elegant composition" },
                { site: "Party Bus", prompt: "party bus interior with LED lighting, small group celebrating, motion blur city lights through windows" },
              ].map((row) => (
                <div key={row.site} className="rounded-lg border border-gray-200 p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Rows4 className="h-4 w-4 text-gray-500" />
                    <div className="font-semibold text-gray-900">{row.site}</div>
                  </div>
                  <p className="text-sm text-gray-700">{row.prompt}</p>
                </div>
              ))}
            </div>

            <div className="rounded-lg border border-dashed border-blue-200 bg-blue-50 p-3 text-sm text-blue-900">
              Upload target: <strong>DEPLOY_IMAGES_BUCKET</strong> + prefix <strong>DEPLOY_IMAGES_PREFIX</strong>; falls back to data URLs when unset.
            </div>
          </CardContent>
        </Card>

        {/* Queues */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Timer className="h-5 w-5 text-orange-600" />
              Queues & Backlog
            </CardTitle>
            <CardDescription>Text, image, and schema work in flight.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              {
                label: "Text generation",
                count: 6,
                detail: "City pages + pricing anchors",
                tone: "bg-blue-50 text-blue-900",
              },
              {
                label: "Images",
                count: 4,
                detail: "Fleet shots missing for wedding/partybus",
                tone: "bg-indigo-50 text-indigo-900",
              },
              {
                label: "Schemas / SEO",
                count: 3,
                detail: "Breadcrumb + FAQ JSON-LD, robots/sitemap per site",
                tone: "bg-emerald-50 text-emerald-900",
              },
            ].map((item) => (
              <div key={item.label} className={`rounded-lg border border-gray-200 p-3 ${item.tone}`}>
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-sm">{item.label}</div>
                  <Badge variant="outline" className="border-none bg-white text-gray-800">
                    {item.count} in progress
                  </Badge>
                </div>
                <p className="text-xs mt-1">{item.detail}</p>
              </div>
            ))}

            <div className="flex items-center gap-2 rounded-lg border border-gray-200 p-3">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <div className="text-sm text-gray-700">
                Preview smoke to prod canary: <span className="font-semibold text-gray-900">Enabled</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="w-1/2 gap-2">
                <Sparkles className="h-4 w-4" />
                Auto-fill prompts
              </Button>
              <Button className="w-1/2 gap-2">
                <Rocket className="h-4 w-4" />
                Send to deploy
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
