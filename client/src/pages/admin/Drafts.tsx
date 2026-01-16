import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export default function DraftsPage() {
  const [drafts, setDrafts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchDrafts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/drafts");
      const data = await res.json();
      if (data && data.drafts) setDrafts(data.drafts);
    } catch (e) {
      console.error("Failed to load drafts", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrafts();
  }, []);

  const handleAction = async (id: string, action: "approve" | "reject") => {
    try {
      const res = await fetch(`/api/ai/drafts/${id}/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewer: "admin" }),
      });
      const data = await res.json();
      if (data && data.draft) {
        fetchDrafts();
      }
    } catch (e) {
      console.error("Action failed", e);
    }
  };

  return (
    <Layout>
      <SEO title="AI Drafts" description="Review AI generated drafts" noindex />
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">AI Generated Drafts</h1>
        <div className="space-y-4">
          {loading && <div>Loading...</div>}
          {!loading && drafts.length === 0 && <div>No drafts available</div>}
          {drafts.map((d) => (
            <div key={d.id} className="p-4 border rounded">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="font-semibold">{d.result?.title || d.id}</h2>
                  <div className="text-sm text-gray-600">
                    Status: {d.status}
                  </div>
                  <div className="text-sm text-gray-600">
                    Created: {new Date(d.createdAt).toLocaleString()}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleAction(d.id, "approve")}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAction(d.id, "reject")}
                  >
                    Reject
                  </Button>
                </div>
              </div>

              <div className="mt-3">
                <h3 className="font-medium">Meta</h3>
                <p className="text-sm text-gray-700">
                  {d.result?.metaDescription}
                </p>
                <h3 className="font-medium mt-2">Content</h3>
                <div
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: d.result?.content?.replace(/\n/g, "<br/>") || "",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
