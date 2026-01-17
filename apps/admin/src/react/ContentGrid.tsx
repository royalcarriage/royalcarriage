import React from "react";
import { Table } from "../components/ui/Table";
import { PillButton } from "../components/ui/PillButton";
import type { SeoQueueItem, SeoDraft } from "../types";

function normalizeKey(key: string) {
  return key.replace(/[-_\s]+/g, "").toLowerCase();
}

export default function ContentGrid({
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
  const norm = normalizeKey(pageKey);

  const matches = (text?: string) => {
    if (!text) return false;
    const n = normalizeKey(text);
    return n.includes(norm) || norm.includes(n);
  };

  const filteredQueue = queue.filter((q) => {
    if (!q.page && !q.intent) return false;
    return (
      q.page === "all" ||
      q.site === "all" ||
      matches(q.page) ||
      matches(q.intent)
    );
  });

  const filteredDrafts = drafts.filter((d) => {
    if (!d.topic) return false;
    return d.site === "all" || matches(d.topic) || matches(d.status);
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">
            Content — {pageKey}
          </h3>
          <p className="text-sm text-slate-600">
            Content items are sourced from the queue and drafts datasets.
          </p>
        </div>
        <div className="flex gap-2">
          <PillButton onClick={onQueue} disabled={!canQueue}>
            Propose to Queue
          </PillButton>
          <PillButton
            variant="secondary"
            onClick={onDraft}
            disabled={!canDraft}
          >
            Create Draft
          </PillButton>
        </div>
      </div>

      <Table
        columns={[
          { key: "page", label: "Page" },
          { key: "intent", label: "Intent" },
          { key: "status", label: "Status" },
          {
            key: "createdAt",
            label: "Created",
            render: (r: any) => new Date(r.createdAt).toLocaleString(),
          },
        ]}
        data={filteredQueue}
        empty="No queued content"
      />

      <Table
        columns={[
          { key: "topic", label: "Draft" },
          { key: "status", label: "Status" },
          { key: "site", label: "Site" },
          {
            key: "updatedAt",
            label: "Updated",
            render: (r: any) => new Date(r.updatedAt).toLocaleString(),
          },
        ]}
        data={filteredDrafts}
        empty="No drafts yet"
      />
    </div>
  );
}
