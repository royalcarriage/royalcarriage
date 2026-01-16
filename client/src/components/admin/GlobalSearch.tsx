import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useHotkeys } from "react-hotkeys-hook";

interface SearchResult {
  type: "city" | "service" | "vehicle" | "blog" | "import";
  title: string;
  href: string;
  description?: string;
}

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);

  // Keyboard shortcut: '/' to focus search
  useHotkeys(
    "/",
    (e) => {
      e.preventDefault();
      setOpen(true);
    },
    { enableOnFormTags: false },
  );

  useHotkeys("escape", () => {
    setOpen(false);
  });

  const handleSearch = async (searchQuery: string) => {
    setQuery(searchQuery);

    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    // TODO: Implement actual search across Firestore collections
    // For now, mock results
    const mockResults: SearchResult[] = [
      {
        type: "city",
        title: "Chicago Airport Transportation",
        href: "/admin/seo/city/chicago",
        description: "City page for Chicago airport services",
      },
      {
        type: "service",
        title: "Corporate Transportation",
        href: "/admin/seo/service/corporate",
        description: "Service page for corporate travel",
      },
    ].filter((r) => r.title.toLowerCase().includes(searchQuery.toLowerCase()));

    setResults(mockResults);
  };

  const groupedResults = results.reduce(
    (acc, result) => {
      if (!acc[result.type]) {
        acc[result.type] = [];
      }
      acc[result.type].push(result);
      return acc;
    },
    {} as Record<string, SearchResult[]>,
  );

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors w-64"
      >
        <Search className="h-4 w-4" />
        <span>Search... </span>
        <kbd className="ml-auto px-2 py-0.5 text-xs bg-white rounded border">
          /
        </kbd>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Search</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Search pages, drafts, imports..."
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            autoFocus
            className="text-base"
          />

          <div className="mt-4 max-h-96 overflow-y-auto">
            {Object.keys(groupedResults).length === 0 && query && (
              <div className="text-center text-sm text-gray-500 py-8">
                No results found
              </div>
            )}

            {Object.entries(groupedResults).map(([type, items]) => (
              <div key={type} className="mb-4">
                <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                  {type} Pages
                </h3>
                <div className="space-y-1">
                  {items.map((item, idx) => (
                    <a
                      key={idx}
                      href={item.href}
                      className="block p-3 rounded-lg hover:bg-gray-50 transition-colors"
                      onClick={() => setOpen(false)}
                    >
                      <div className="font-medium text-sm">{item.title}</div>
                      {item.description && (
                        <div className="text-xs text-gray-500 mt-1">
                          {item.description}
                        </div>
                      )}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
