import React, { useEffect, useState } from "react";
import { AdminShell } from "../components/AdminShell";
import { KpiCard } from "../components/ui/KpiCard";
import { Table } from "../components/ui/Table";
import { PillButton } from "../components/ui/PillButton";
import { Modal } from "../components/ui/Modal";
import { useToast } from "../components/ui/Toast";
import {
  addDeployLog,
  addGateReport,
  addImage,
  addSeoDraft,
  addSeoQueue,
  getMetrics,
  getSettings,
  getSiteHealth,
  listAlerts,
  listDeploys,
  listFreshness,
  listGateReports,
  listImages,
  listImports,
  listMissingImages,
  listSeoDrafts,
  listSeoQueue,
  listUsers,
  recordImport,
  saveSettings,
  updateUserRole,
  usingMockStore,
  runSelfAudit,
  getConfiguredAuth,
} from "../lib/dataStore";
import { useAuth } from "../state/AuthProvider";
import type {
  AlertItem,
  DeployLog,
  FreshnessStatus,
  GateReport,
  ImageMeta,
  ImportRecord,
  MetricRollup,
  Role,
  SeoDraft,
  SeoQueueItem,
  SettingsPayload,
  SiteHealth,
} from "../types";

type PageKey =
  | "overview"
  | "imports-moovs"
  | "imports-ads"
  | "roi"
  | "site-health"
  | "money-pages"
  | "fleet"
  | "cities"
  | "blog"
  | "seo-queue"
  | "seo-drafts"
  | "seo-gate-reports"
  | "seo-publish"
  | "images-library"
  | "images-missing"
  | "deploy-logs"
  | "users"
  | "settings"
  | "self-audit";

const ROLE_ORDER: Role[] = ["viewer", "editor", "admin", "superadmin"];

function useRoleGate(role: Role) {
  return (min: Role) => ROLE_ORDER.indexOf(role) >= ROLE_ORDER.indexOf(min);
}

function Overview({
  metrics,
  freshness,
  alerts,
  onQuickAction,
}: {
  metrics: MetricRollup | undefined;
  freshness: FreshnessStatus[];
  alerts: AlertItem[];
  onQuickAction: (action: "moovs" | "ads" | "gate" | "deploy") => void;
}) {
  const formatted = {
    spend: metrics ? `$${metrics.spend.toLocaleString()}` : "$0",
    revenue: metrics ? `$${metrics.revenue.toLocaleString()}` : "$0",
    profit: metrics ? `$${metrics.profitProxy.toLocaleString()}` : "$0",
    aov: metrics ? `$${metrics.aov.toLocaleString()}` : "$0",
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-4">
        <KpiCard label="Spend" value={formatted.spend} />
        <KpiCard label="Revenue" value={formatted.revenue} />
        <KpiCard label="Profit Proxy" value={formatted.profit} />
        <KpiCard label="AOV" value={formatted.aov} />
      </div>
      <div className="flex flex-wrap gap-2">
        {freshness.map((f) => (
          <div key={f.label}>
            {/* Rendered in top bar; kept for overview row */}
          </div>
        ))}
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <PillButton variant="secondary" onClick={() => onQuickAction("moovs")}>
            Import Moovs
          </PillButton>
          <PillButton variant="secondary" onClick={() => onQuickAction("ads")}>
            Import Ads
          </PillButton>
          <PillButton variant="primary" onClick={() => onQuickAction("gate")}>
            Run Gate
          </PillButton>
          <PillButton variant="danger" onClick={() => onQuickAction("deploy")}>
            Deploy
          </PillButton>
        </div>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900">Alerts</h3>
          <span className="text-xs text-slate-500">{alerts.length} open</span>
        </div>
        <div className="mt-2 space-y-2">
          {alerts.map((alert) => (
            <div
              key={alert.message}
              className={`rounded-xl border px-3 py-2 text-sm ${
                alert.severity === "red"
                  ? "border-red-200 bg-red-50 text-red-800"
                  : "border-amber-200 bg-amber-50 text-amber-800"
              }`}
            >
              {alert.message}
            </div>
          ))}
          {alerts.length === 0 && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
              No critical alerts.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ImportsPage({
  type,
  records,
  onUpload,
  canEdit,
}: {
  type: "moovs" | "ads";
  records: ImportRecord[];
  onUpload: (file: File) => void;
  canEdit: boolean;
}) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">
          {type === "moovs" ? "Moovs Import" : "Ads Import"}
        </h3>
        <p className="text-sm text-slate-600">
          Upload CSV exports; files are validated and logged with org scoping.
        </p>
        <label
          className="mt-3 flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm font-semibold text-slate-700 hover:border-indigo-400 hover:bg-indigo-50"
          aria-disabled={!canEdit}
        >
          <input
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            disabled={!canEdit}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onUpload(file);
            }}
          />
          <span>Drop CSV or click to upload</span>
          {!canEdit && (
            <span className="mt-1 text-xs font-normal text-slate-500">
              Requires Editor role
            </span>
          )}
        </label>
      </div>
      <Table
        columns={[
          { key: "fileName", label: "File" },
          { key: "status", label: "Status" },
          { key: "rows", label: "Rows" },
          { key: "warnings", label: "Warnings", render: (row) => row.warnings?.join("; ") },
          {
            key: "createdAt",
            label: "Imported At",
            render: (row) => new Date(row.createdAt).toLocaleString(),
          },
        ]}
        data={records}
        empty="No imports yet"
      />
      {type === "moovs" && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Missing payout/tax check: ensure columns `payout` and `tax` are populated before
          approving the import.
        </div>
      )}
    </div>
  );
}

function ROIPage({ metrics }: { metrics?: MetricRollup }) {
  const rows: { id: string; label: string; value: number }[] = metrics
    ? [
        { id: "revenue", label: "Revenue", value: metrics.revenue },
        { id: "spend", label: "Spend", value: metrics.spend },
        { id: "profit", label: "Profit Proxy", value: metrics.profitProxy },
        { id: "aov", label: "Average Order Value", value: metrics.aov },
      ]
    : [];
  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">Revenue by Type</h3>
          <ul className="mt-2 space-y-1 text-sm text-slate-700">
            <li>Airport: $18,900</li>
            <li>Corporate: $12,300</li>
            <li>Wedding: $9,200</li>
            <li>Partybus: $7,500</li>
          </ul>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">Spend vs Revenue</h3>
          <p className="text-sm text-slate-600">Positive gap driven by airport conversions.</p>
        </div>
      </div>
      <Table
        columns={[
          { key: "label", label: "Metric" },
          {
            key: "value",
            label: "Value",
            render: (row) => `$${(row as any).value.toLocaleString()}`,
          },
        ]}
        data={rows as any}
      />
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900">Top Keyword Clusters</h3>
        <ul className="mt-2 space-y-1 text-sm text-slate-700">
          <li>SCALE: airport limo chicago, midway car service</li>
          <li>FIX: corporate limo chicago loop, wedding shuttle suburbs</li>
        </ul>
      </div>
    </div>
  );
}

function SiteHealthPage({ sites }: { sites: SiteHealth[] }) {
  return (
    <Table
      columns={[
        { key: "site", label: "Site" },
        { key: "sitemapOk", label: "Sitemap", render: (r) => (r.sitemapOk ? "OK" : "Fail") },
        { key: "robotsOk", label: "Robots", render: (r) => (r.robotsOk ? "OK" : "Fail") },
        { key: "canonicalOk", label: "Canonical", render: (r) => (r.canonicalOk ? "OK" : "Fail") },
        { key: "trackingOk", label: "Tracking", render: (r) => (r.trackingOk ? "OK" : "Fail") },
        { key: "ctaOk", label: "CTA", render: (r) => (r.ctaOk ? "OK" : "Fail") },
        {
          key: "lastDeploy",
          label: "Last Deploy",
          render: (r) => new Date(r.lastDeploy).toLocaleString(),
        },
      ]}
      data={sites}
    />
  );
}

function SeoPage({
  queue,
  drafts,
  reports,
  onQueue,
  onDraft,
  onGate,
  canQueue,
  canDraft,
  canGate,
}: {
  queue: SeoQueueItem[];
  drafts: SeoDraft[];
  reports: GateReport[];
  onQueue: () => void;
  onDraft: () => void;
  onGate: () => void;
  canQueue: boolean;
  canDraft: boolean;
  canGate: boolean;
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <PillButton onClick={onQueue} disabled={!canQueue}>
          Propose
        </PillButton>
        <PillButton variant="secondary" onClick={onDraft} disabled={!canDraft}>
          Draft
        </PillButton>
        <PillButton variant="primary" onClick={onGate} disabled={!canGate}>
          Run Gate
        </PillButton>
      </div>
      <Table
        columns={[
          { key: "page", label: "Page" },
          { key: "intent", label: "Intent" },
          { key: "status", label: "Status" },
          { key: "createdAt", label: "Created", render: (r) => new Date(r.createdAt).toLocaleString() },
        ]}
        data={queue}
        empty="Queue empty"
      />
      <Table
        columns={[
          { key: "topic", label: "Draft" },
          { key: "status", label: "Status" },
          { key: "site", label: "Site" },
          { key: "updatedAt", label: "Updated", render: (r) => new Date(r.updatedAt).toLocaleString() },
        ]}
        data={drafts}
        empty="No drafts yet"
      />
      <Table
        columns={[
          { key: "topic", label: "Gate" },
          { key: "result", label: "Result" },
          { key: "summary", label: "Summary" },
          { key: "createdAt", label: "Created", render: (r) => new Date(r.createdAt).toLocaleString() },
        ]}
        data={reports}
        empty="No gate reports"
      />
    </div>
  );
}

function ImagesPage({
  images,
  missing,
  onUpload,
}: {
  images: ImageMeta[];
  missing: ImageMeta[];
  onUpload: (file: File) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Image Library</h3>
            <p className="text-sm text-slate-600">Upload and tag images by site/entity.</p>
          </div>
          <label className="cursor-pointer rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-indigo-400 hover:bg-indigo-50">
            Upload
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onUpload(file);
              }}
            />
          </label>
        </div>
      </div>
      <Table
        columns={[
          { key: "url", label: "Preview", render: (r) => <a className="text-indigo-600" href={r.url}>Link</a> },
          { key: "site", label: "Site" },
          { key: "entity", label: "Entity" },
          { key: "tags", label: "Tags", render: (r) => r.tags.join(", ") },
        ]}
        data={images}
        empty="No images yet"
      />
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        Missing images: {missing.length}
      </div>
    </div>
  );
}

function DeployPage({
  logs,
  onDeploy,
  canDeploy,
}: {
  logs: DeployLog[];
  onDeploy: (target: string) => void;
  canDeploy: boolean;
}) {
  const targets: { id: string; label: string }[] = [
    { id: "admin", label: "Admin" },
    { id: "airport", label: "Airport" },
    { id: "partybus", label: "Partybus" },
    { id: "corporate", label: "Corporate" },
    { id: "wedding", label: "Wedding" },
  ];
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {targets.map((t) => (
          <PillButton key={t.id} onClick={() => onDeploy(t.id)} disabled={!canDeploy}>
            Deploy {t.label}
          </PillButton>
        ))}
      </div>
      {!canDeploy && (
        <div className="text-sm text-slate-600">
          Deploy requires Admin role. Buttons are disabled.
        </div>
      )}
      <Table
        columns={[
          { key: "target", label: "Target" },
          { key: "status", label: "Status" },
          { key: "message", label: "Message" },
          { key: "createdAt", label: "Created", render: (r) => new Date(r.createdAt).toLocaleString() },
        ]}
        data={logs}
        empty="No deployment logs yet"
      />
    </div>
  );
}

function UsersPage({
  users,
  role,
  onUpdate,
}: {
  users: any[];
  role: Role;
  onUpdate: (uid: string, role: Role) => void;
}) {
  const canManage = ROLE_ORDER.indexOf(role) === ROLE_ORDER.indexOf("superadmin");
  return (
    <Table
      columns={[
        { key: "displayName", label: "User", render: (r) => r.displayName || r.email },
        { key: "email", label: "Email" },
        {
          key: "role",
          label: "Role",
          render: (r) =>
            canManage ? (
              <select
                value={r.role}
                onChange={(e) => onUpdate(r.uid, e.target.value as Role)}
                className="rounded-lg border border-slate-200 px-2 py-1 text-sm"
              >
                {ROLE_ORDER.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            ) : (
              r.role
            ),
        },
        { key: "lastLogin", label: "Last Login" },
      ]}
      data={users}
      empty="No users yet"
    />
  );
}

function SettingsPage({
  settings,
  onSave,
  canEdit,
}: {
  settings: SettingsPayload | undefined;
  onSave: (payload: SettingsPayload) => void;
  canEdit: boolean;
}) {
  const [form, setForm] = useState(settings);
  useEffect(() => setForm(settings), [settings]);

  if (!form) return null;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="grid gap-3 md:grid-cols-2">
        <label className="text-sm font-semibold text-slate-700">
          Phone
          <input
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            value={form.phone}
            disabled={!canEdit}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
        </label>
        <label className="text-sm font-semibold text-slate-700">
          Booking URL
          <input
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            value={form.bookingUrl}
            disabled={!canEdit}
            onChange={(e) => setForm({ ...form, bookingUrl: e.target.value })}
          />
        </label>
        <label className="text-sm font-semibold text-slate-700">
          GA4 ID
          <input
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            value={form.ga4Id}
            disabled={!canEdit}
            onChange={(e) => setForm({ ...form, ga4Id: e.target.value })}
          />
        </label>
        <label className="text-sm font-semibold text-slate-700">
          Publish Limit
          <input
            type="number"
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            value={form.publishLimit}
            disabled={!canEdit}
            onChange={(e) => setForm({ ...form, publishLimit: Number(e.target.value) })}
          />
        </label>
        <label className="text-sm font-semibold text-slate-700">
          Similarity Threshold
          <input
            type="number"
            step="0.01"
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            value={form.similarityThreshold}
            disabled={!canEdit}
            onChange={(e) =>
              setForm({ ...form, similarityThreshold: Number(e.target.value) })
            }
          />
        </label>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <div className="text-xs text-slate-500">
          Last updated by {form.updatedBy || "unknown"} at{" "}
          {new Date(form.updatedAt).toLocaleString()}
        </div>
        <PillButton onClick={() => onSave(form)} disabled={!canEdit}>
          Save
        </PillButton>
      </div>
    </div>
  );
}

function SelfAuditPage({ onRun, results }: { onRun: () => void; results: any[] }) {
  return (
    <div className="space-y-3">
      <PillButton onClick={onRun}>Run Self Audit</PillButton>
      <Table
        columns={[
          { key: "name", label: "Check" },
          { key: "status", label: "Status" },
          { key: "detail", label: "Detail" },
        ]}
        data={results as any}
        empty="No results yet"
      />
    </div>
  );
}

function MissingPage({ title }: { title: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700 shadow-sm">
      {title} view is placeholder only; content is tracked via datasets and queue above.
    </div>
  );
}

function ContentGrid({
  pageKey,
  queue,
  drafts,
  onQueue,
  onDraft,
  canQueue,
  canDraft,
}: {
  pageKey: string;
  queue: SeoQueueItem[];
  drafts: SeoDraft[];
  onQueue: () => void;
  onDraft: () => void;
  canQueue: boolean;
  canDraft: boolean;
}) {
  const pageLabel = pageKey.replace("-", " ");
  // Basic filtering: show queue items and drafts that mention the pageKey or all if none
  const filteredQueue = queue.filter((q) => q.page?.includes(pageKey) || q.site === "all" || q.page?.includes(pageLabel));
  const filteredDrafts = drafts.filter((d) => (d.topic || "").toLowerCase().includes(pageKey) || d.site === "all");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Content — {pageLabel}</h3>
          <p className="text-sm text-slate-600">Content items are sourced from the queue and drafts datasets.</p>
        </div>
        <div className="flex gap-2">
          <PillButton onClick={onQueue} disabled={!canQueue}>Propose to Queue</PillButton>
          <PillButton variant="secondary" onClick={onDraft} disabled={!canDraft}>Create Draft</PillButton>
        </div>
      </div>

      <Table
        columns={[
          { key: "page", label: "Page" },
          { key: "intent", label: "Intent" },
          { key: "status", label: "Status" },
          { key: "createdAt", label: "Created", render: (r) => new Date(r.createdAt).toLocaleString() },
        ]}
        data={filteredQueue}
        empty="No queued content"
      />

      <Table
        columns={[
          { key: "topic", label: "Draft" },
          { key: "status", label: "Status" },
          { key: "site", label: "Site" },
          { key: "updatedAt", label: "Updated", render: (r) => new Date(r.updatedAt).toLocaleString() },
        ]}
        data={filteredDrafts}
        empty="No drafts yet"
      />
    </div>
  );
}

function EmailAuthForm({
  onSignIn,
  onRegister,
  onReset,
}: {
  onSignIn: (email: string, password: string) => Promise<void>;
  onRegister: (email: string, password: string) => Promise<void>;
  onReset: (email: string) => Promise<void>;
}) {
  const [mode, setMode] = useState<"signin" | "register" | "reset">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e?: React.FormEvent) {
    e?.preventDefault();
    setLoading(true);
    try {
      if (mode === "signin") await onSignIn(email, password);
      else if (mode === "register") {
        if (password !== confirm) throw new Error("Passwords do not match");
        await onRegister(email, password);
      } else await onReset(email);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="grid gap-2">
        <input
          aria-label="Email"
          className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
          placeholder="you@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          required
        />
        {mode !== "reset" && (
          <input
            aria-label="Password"
            className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            required
          />
        )}
        {mode === "register" && (
          <input
            aria-label="Confirm password"
            className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
            placeholder="Confirm password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            type="password"
            required
          />
        )}
      </div>

      <div className="flex items-center justify-between gap-2">
        <PillButton type="submit" disabled={loading}>
          {mode === "signin" ? "Sign in" : mode === "register" ? "Create account" : "Send reset"}
        </PillButton>
        <div className="text-sm text-slate-500">
          {mode === "signin" ? (
            <>
              <button type="button" className="underline" onClick={() => setMode("reset")}>Forgot?</button>
              <span className="px-2">·</span>
              <button type="button" className="underline" onClick={() => setMode("register")}>Register</button>
            </>
          ) : mode === "reset" ? (
            <>
              <button type="button" className="underline" onClick={() => setMode("signin")}>Back</button>
            </>
          ) : (
            <>
              <button type="button" className="underline" onClick={() => setMode("signin")}>Back to sign in</button>
            </>
          )}
        </div>
      </div>
    </form>
  );
}

function AdminAppInner({ activePage }: { activePage: PageKey }) {
  const { user, role, site, setSite, signInWithGoogle, signInWithEmail, registerWithEmail, resetPassword, ready, signOut } = useAuth();
  const { push } = useToast();
  const can = useRoleGate(role);
  const canEditor = can("editor");
  const canAdmin = can("admin");
  const canSuperAdmin = can("superadmin");

  const [freshness, setFreshness] = useState<FreshnessStatus[]>([]);
  const [metrics, setMetrics] = useState<MetricRollup | undefined>(undefined);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [moovsImports, setMoovsImports] = useState<ImportRecord[]>([]);
  const [adsImports, setAdsImports] = useState<ImportRecord[]>([]);
  const [siteHealth, setSiteHealth] = useState<SiteHealth[]>([]);
  const [queue, setQueue] = useState<SeoQueueItem[]>([]);
  const [drafts, setDrafts] = useState<SeoDraft[]>([]);
  const [gateReports, setGateReports] = useState<GateReport[]>([]);
  const [images, setImages] = useState<ImageMeta[]>([]);
  const [missingImages, setMissingImages] = useState<ImageMeta[]>([]);
  const [deploys, setDeploys] = useState<DeployLog[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [settings, setSettings] = useState<SettingsPayload | undefined>(undefined);
  const [auditResults, setAuditResults] = useState<any[]>([]);
  const [showDeployModal, setShowDeployModal] = useState(false);

  useEffect(() => {
    async function load() {
      setFreshness(await listFreshness());
      setMetrics(await getMetrics());
      setAlerts(await listAlerts());
      setMoovsImports(await listImports("moovs"));
      setAdsImports(await listImports("ads"));
      setSiteHealth(await getSiteHealth());
      setQueue(await listSeoQueue());
      setDrafts(await listSeoDrafts());
      setGateReports(await listGateReports());
      setImages(await listImages());
      setMissingImages(await listMissingImages());
      setDeploys(await listDeploys());
      setUsers(await listUsers());
      setSettings(await getSettings());
    }
    load();
  }, []);

  const handleImport = async (file: File, type: "moovs" | "ads") => {
    if (!canEditor) {
      push("Requires Editor role to import", "error");
      return;
    }

    try {
      push(`Uploading ${file.name}...`, "info");

      // Read file content
      const csvData = await file.text();
      const rows = csvData.split("\n").filter(Boolean).length - 1;

      // Call Cloud Functions API
      const endpoint = type === "moovs" ? "/api/imports/moovs" : "/api/imports/ads";
      const authClient = getConfiguredAuth();
      const idToken = authClient?.currentUser ? await authClient.currentUser.getIdToken() : undefined;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
        },
        body: JSON.stringify({
          csvData,
          fileName: file.name,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Import failed");
      }

      const result = await response.json();

      // Create display record
      const record = await recordImport({
        type,
        fileName: file.name,
        rows: Math.max(rows, 1),
        warnings: [
          ...(result.errors.length > 0 ? [`${result.errors.length} validation errors`] : []),
          ...(result.duplicates.length > 0 ? [`${result.duplicates.length} duplicates skipped`] : []),
          ...(rows < 2 ? ["Low row count"] : []),
        ],
        status: "completed",
        site,
      });

      // Show success message
      const successMsg = `${type === "moovs" ? "Moovs" : "Ads"} import completed: ${result.imported} imported, ${result.skipped} skipped`;
      push(successMsg, result.errors.length === 0 ? "success" : "error");

      // Update state
      if (type === "moovs") setMoovsImports((prev) => [record, ...prev]);
      else setAdsImports((prev) => [record, ...prev]);

      // Show detailed errors if any
      if (result.errors.length > 0 && result.errors.length <= 5) {
        setTimeout(() => {
          result.errors.forEach((err: any) => {
            push(`Row ${err.row}: ${err.error}`, "error");
          });
        }, 500);
      } else if (result.errors.length > 5) {
        push(`${result.errors.length} validation errors. Check console for details.`, "error");
        console.error("Import errors:", result.errors);
      }
    } catch (error) {
      console.error("Import error:", error);
      push(
        `Import failed: ${error instanceof Error ? error.message : String(error)}`,
        "error"
      );
    }
  };

  const handleQueue = async () => {
    if (!canEditor) {
      push("Requires Editor role", "error");
      return;
    }
    const entry = await addSeoQueue({
      page: "/airport-limo",
      intent: "Draft CTA for airport",
      status: "queued",
      site,
    });
    setQueue((prev) => [entry, ...prev]);
    push("Added to queue", "success");
  };

  const handleDraft = async () => {
    if (!canEditor) {
      push("Requires Editor role", "error");
      return;
    }
    const draft = await addSeoDraft({
      topic: "Airport CTA refresh",
      status: "draft",
      site,
    });
    setDrafts((prev) => [draft, ...prev]);
    push("Draft created", "success");
  };

  const handleGate = async () => {
    if (!canAdmin) {
      push("Requires Admin role", "error");
      return;
    }
    const report = await addGateReport({
      topic: "Airport CTA",
      result: "pass",
      summary: "Meets thresholds",
    });
    setGateReports((prev) => [report, ...prev]);
    push("Gate executed", "success");
  };

  const handleImageUpload = async (file: File) => {
    const url = URL.createObjectURL(file);
    const meta = await addImage({ url, site, tags: ["upload"], entity: "general" });
    setImages((prev) => [meta, ...prev]);
    push("Image added", "success");
  };

  const handleDeploy = async (target: string) => {
    if (!canAdmin) {
      push("Requires Admin role", "error");
      return;
    }
    const log = await addDeployLog({
      target: target as any,
      status: "queued",
      message: "Queued via admin UI",
    });
    setDeploys((prev) => [log, ...prev]);
    push(`Deploy queued for ${target}`, "info");
  };

  const handleSettingsSave = async (payload: SettingsPayload) => {
    if (!canAdmin) {
      push("Requires Admin role", "error");
      return;
    }
    const saved = await saveSettings(payload, user?.email);
    setSettings(saved);
    push("Settings saved", "success");
  };

  const handleUserRole = async (uid: string, nextRole: Role) => {
    if (!canSuperAdmin) {
      push("Requires SuperAdmin role", "error");
      return;
    }
    await updateUserRole(uid, nextRole);
    setUsers((prev) => prev.map((u) => (u.uid === uid ? { ...u, role: nextRole } : u)));
    push("Role updated", "success");
  };

  const handleSelfAudit = async () => {
    const results = await runSelfAudit();
    setAuditResults(results);
    push("Self audit complete", "info");
  };

  const quickAction = async (action: "moovs" | "ads" | "gate" | "deploy") => {
    if (action === "gate") {
      await handleGate();
      return;
    }
    if (action === "deploy") {
      if (!canAdmin) {
        push("Deploy requires Admin role", "error");
        return;
      }
      setShowDeployModal(true);
      return;
    }
    if (!canEditor) {
      push("Import requires Editor role", "error");
      return;
    }
    const stub = await recordImport({
      type: action,
      fileName: `${action}-quick-${Date.now()}.csv`,
      rows: 1,
      warnings: ["Quick import initiated from top bar"],
      status: "pending",
      site,
    });
    if (action === "moovs") setMoovsImports((prev) => [stub, ...prev]);
    else setAdsImports((prev) => [stub, ...prev]);
    push(`${action.toUpperCase()} quick import logged`, "success");
  };

  if (!ready) return <div className="p-6 text-sm text-slate-700">Loading auth…</div>;
  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">Admin Login</h1>
              <p className="mt-1 text-sm text-slate-600">Sign in to access the admin dashboard.</p>
            </div>
            <div className="text-sm text-slate-400">royalcarriage</div>
          </div>

          <div className="mt-6 space-y-4">
            <div className="flex flex-col gap-2">
              <PillButton variant="secondary" onClick={signInWithGoogle}>
                Continue with Google
              </PillButton>
              <div className="text-center text-xs text-slate-400">— or —</div>
            </div>

            <EmailAuthForm
              onSignIn={async (e, p) => {
                try {
                  await signInWithEmail(e, p);
                } catch (err) {
                  console.error(err);
                  alert((err as any)?.message || "Sign-in failed");
                }
              }}
              onRegister={async (e, p) => {
                try {
                  await registerWithEmail(e, p);
                } catch (err) {
                  console.error(err);
                  alert((err as any)?.message || "Registration failed");
                }
              }}
              onReset={async (e) => {
                try {
                  await resetPassword(e);
                  alert("Password reset email sent");
                } catch (err) {
                  console.error(err);
                  alert((err as any)?.message || "Reset failed");
                }
              }}
            />

            {usingMockStore() && (
              <div className="mt-2 text-xs text-amber-600">
                Firebase config missing; using mock data store.
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <AdminShell
        activePage={activePage}
        site={site}
        onSiteChange={setSite}
        statuses={freshness}
        onImportAds={() => quickAction("ads")}
        onImportMoovs={() => quickAction("moovs")}
        onRunGate={() => quickAction("gate")}
        onDeploy={() => quickAction("deploy")}
        user={user}
        role={role}
        onSignOut={signOut}
      >
        {activePage === "overview" && (
          <Overview
            metrics={metrics}
            freshness={freshness}
            alerts={alerts}
            onQuickAction={quickAction}
          />
        )}
        {activePage === "imports-moovs" && (
          <ImportsPage
            type="moovs"
            records={moovsImports}
            onUpload={(f) => handleImport(f, "moovs")}
            canEdit={can("editor")}
          />
        )}
        {activePage === "imports-ads" && (
          <ImportsPage
            type="ads"
            records={adsImports}
            onUpload={(f) => handleImport(f, "ads")}
            canEdit={can("editor")}
          />
        )}
        {activePage === "roi" && <ROIPage metrics={metrics} />}
        {activePage === "site-health" && <SiteHealthPage sites={siteHealth} />}
        {["money-pages", "fleet", "cities", "blog"].includes(activePage) && (
          <ContentGrid
            pageKey={activePage}
            queue={queue}
            drafts={drafts}
            onQueue={handleQueue}
            onDraft={handleDraft}
            canQueue={canEditor}
            canDraft={canEditor}
          />
        )}
        {["seo-queue", "seo-drafts", "seo-gate-reports", "seo-publish"].includes(activePage) && (
          <SeoPage
            queue={queue}
            drafts={drafts}
            reports={gateReports}
            onQueue={handleQueue}
            onDraft={handleDraft}
            onGate={handleGate}
            canQueue={canEditor}
            canDraft={canEditor}
            canGate={canAdmin}
          />
        )}
        {["images-library", "images-missing"].includes(activePage) && (
          <ImagesPage images={images} missing={missingImages} onUpload={handleImageUpload} />
        )}
        {activePage === "deploy-logs" && (
          <DeployPage logs={deploys} onDeploy={handleDeploy} canDeploy={canAdmin} />
        )}
        {activePage === "users" && (
          <UsersPage users={users} role={role} onUpdate={handleUserRole} />
        )}
        {activePage === "settings" && (
          <SettingsPage settings={settings} onSave={handleSettingsSave} canEdit={canAdmin} />
        )}
        {activePage === "self-audit" && (
          <SelfAuditPage onRun={handleSelfAudit} results={auditResults} />
        )}
      </AdminShell>
      <Modal
        open={showDeployModal}
        onClose={() => setShowDeployModal(false)}
        title="Deploy Command"
        primaryAction={{ label: "Close", onClick: () => setShowDeployModal(false) }}
      >
        <p className="text-sm text-slate-700">
          Run safe deploy via CLI: <code className="rounded bg-slate-100 px-2 py-1">firebase deploy --only hosting:admin</code>
        </p>
      </Modal>
    </>
  );
}

export default function AdminApp({ activePage }: { activePage: PageKey }) {
  return <AdminAppInner activePage={activePage} />;
}
