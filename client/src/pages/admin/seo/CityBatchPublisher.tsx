import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  MapPin,
  CheckCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  Play,
  Pause,
} from "lucide-react";

interface City {
  id: string;
  name: string;
  slug: string;
  state: string;
  population: number;
  searchVolume: number;
  priority: "high" | "medium" | "low";
  status: "draft" | "ready" | "published" | "blocked";
  draftId?: string;
  publishedAt?: string;
  lastUpdated: string;
}

interface PublishJob {
  id: string;
  status: "pending" | "running" | "completed" | "failed";
  progress: number;
  totalCities: number;
  publishedCount: number;
  failedCount: number;
  startedAt?: string;
  completedAt?: string;
  errors: string[];
}

// Top 25 Chicago metro cities by search volume (mock data)
const TOP_CITIES: City[] = [
  {
    id: "1",
    name: "Chicago",
    slug: "chicago",
    state: "IL",
    population: 2746388,
    searchVolume: 12400,
    priority: "high",
    status: "published",
    publishedAt: "2024-01-15T10:00:00Z",
    lastUpdated: "2024-01-15T10:00:00Z",
  },
  {
    id: "2",
    name: "Naperville",
    slug: "naperville",
    state: "IL",
    population: 149540,
    searchVolume: 3200,
    priority: "high",
    status: "ready",
    draftId: "draft-nap-001",
    lastUpdated: "2024-01-17T09:00:00Z",
  },
  {
    id: "3",
    name: "Aurora",
    slug: "aurora",
    state: "IL",
    population: 180542,
    searchVolume: 2800,
    priority: "high",
    status: "ready",
    draftId: "draft-aur-001",
    lastUpdated: "2024-01-17T09:00:00Z",
  },
  {
    id: "4",
    name: "Joliet",
    slug: "joliet",
    state: "IL",
    population: 150362,
    searchVolume: 2400,
    priority: "high",
    status: "ready",
    draftId: "draft-jol-001",
    lastUpdated: "2024-01-16T14:00:00Z",
  },
  {
    id: "5",
    name: "Schaumburg",
    slug: "schaumburg",
    state: "IL",
    population: 78723,
    searchVolume: 2100,
    priority: "high",
    status: "draft",
    draftId: "draft-sch-001",
    lastUpdated: "2024-01-14T11:00:00Z",
  },
  {
    id: "6",
    name: "Evanston",
    slug: "evanston",
    state: "IL",
    population: 78110,
    searchVolume: 1900,
    priority: "high",
    status: "ready",
    draftId: "draft-eva-001",
    lastUpdated: "2024-01-17T08:00:00Z",
  },
  {
    id: "7",
    name: "Palatine",
    slug: "palatine",
    state: "IL",
    population: 69350,
    searchVolume: 1600,
    priority: "medium",
    status: "ready",
    draftId: "draft-pal-001",
    lastUpdated: "2024-01-16T13:00:00Z",
  },
  {
    id: "8",
    name: "Oak Lawn",
    slug: "oak-lawn",
    state: "IL",
    population: 58362,
    searchVolume: 1400,
    priority: "medium",
    status: "draft",
    lastUpdated: "2024-01-15T10:00:00Z",
  },
  {
    id: "9",
    name: "Berwyn",
    slug: "berwyn",
    state: "IL",
    population: 54328,
    searchVolume: 1200,
    priority: "medium",
    status: "ready",
    draftId: "draft-ber-001",
    lastUpdated: "2024-01-17T07:00:00Z",
  },
  {
    id: "10",
    name: "Oak Park",
    slug: "oak-park",
    state: "IL",
    population: 54583,
    searchVolume: 1100,
    priority: "medium",
    status: "ready",
    draftId: "draft-oak-001",
    lastUpdated: "2024-01-16T15:00:00Z",
  },
];

export default function CityBatchPublisher() {
  const [cities, setCities] = useState<City[]>(TOP_CITIES);
  const [selectedCities, setSelectedCities] = useState<Set<string>>(new Set());
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("ready");
  const [publishJob, setPublishJob] = useState<PublishJob | null>(null);

  const filteredCities = cities.filter((city) => {
    const matchesPriority =
      priorityFilter === "all" || city.priority === priorityFilter;
    const matchesStatus = statusFilter === "all" || city.status === statusFilter;
    return matchesPriority && matchesStatus;
  });

  const handleSelectCity = (cityId: string) => {
    const newSelected = new Set(selectedCities);
    if (newSelected.has(cityId)) {
      newSelected.delete(cityId);
    } else {
      newSelected.add(cityId);
    }
    setSelectedCities(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedCities.size === filteredCities.length) {
      setSelectedCities(new Set());
    } else {
      setSelectedCities(new Set(filteredCities.map((c) => c.id)));
    }
  };

  const handlePublish = () => {
    if (selectedCities.size === 0) return;

    const job: PublishJob = {
      id: Date.now().toString(),
      status: "running",
      progress: 0,
      totalCities: selectedCities.size,
      publishedCount: 0,
      failedCount: 0,
      startedAt: new Date().toISOString(),
      errors: [],
    };

    setPublishJob(job);

    // Simulate publish progress
    // TODO: Replace with actual Firebase publish logic
    let published = 0;
    const interval = setInterval(() => {
      published++;
      const progress = (published / selectedCities.size) * 100;

      if (published >= selectedCities.size) {
        clearInterval(interval);
        setPublishJob({
          ...job,
          status: "completed",
          progress: 100,
          publishedCount: selectedCities.size,
          completedAt: new Date().toISOString(),
        });

        // Update city statuses
        setCities((prev) =>
          prev.map((city) =>
            selectedCities.has(city.id)
              ? {
                  ...city,
                  status: "published" as const,
                  publishedAt: new Date().toISOString(),
                }
              : city,
          ),
        );

        setSelectedCities(new Set());
      } else {
        setPublishJob((prev) =>
          prev
            ? {
                ...prev,
                progress,
                publishedCount: published,
              }
            : null,
        );
      }
    }, 500);
  };

  const readyCities = cities.filter((c) => c.status === "ready");
  const publishedCities = cities.filter((c) => c.status === "published");
  const totalSearchVolume = filteredCities.reduce(
    (sum, city) => sum + city.searchVolume,
    0,
  );

  const getPriorityColor = (priority: City["priority"]) => {
    switch (priority) {
      case "high":
        return "bg-red-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-blue-500";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">City Batch Publisher</h1>
          <p className="text-gray-600 mt-1">
            Batch publish city pages with priority queue for top 25 Chicago metro
            cities
          </p>
        </div>
        <Button
          onClick={handlePublish}
          disabled={selectedCities.size === 0 || publishJob?.status === "running"}
          size="lg"
        >
          {publishJob?.status === "running" ? (
            <>
              <Pause className="w-4 h-4 mr-2" />
              Publishing...
            </>
          ) : (
            <>
              <Play className="w-4 h-4 mr-2" />
              Publish {selectedCities.size > 0 ? `(${selectedCities.size})` : ""}
            </>
          )}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Total Cities</p>
                <p className="text-2xl font-bold">{cities.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-yellow-500" />
              <div>
                <p className="text-sm text-gray-600">Ready to Publish</p>
                <p className="text-2xl font-bold">{readyCities.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Published</p>
                <p className="text-2xl font-bold">{publishedCities.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">Total Search Vol.</p>
                <p className="text-2xl font-bold">
                  {totalSearchVolume.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Publish Job Progress */}
      {publishJob && publishJob.status === "running" && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 animate-spin" />
              Publishing in Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Progress value={publishJob.progress} className="h-3" />
              <div className="flex justify-between text-sm">
                <span>
                  Published: {publishJob.publishedCount} / {publishJob.totalCities}
                </span>
                <span>{publishJob.progress.toFixed(0)}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Publish Job Complete */}
      {publishJob && publishJob.status === "completed" && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Successfully published {publishJob.publishedCount} city pages!
            {publishJob.failedCount > 0 &&
              ` ${publishJob.failedCount} failed.`}
          </AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Priority</label>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="high">High Priority</SelectItem>
                  <SelectItem value="medium">Medium Priority</SelectItem>
                  <SelectItem value="low">Low Priority</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="ready">Ready</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="blocked">Blocked</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button variant="outline" onClick={handleSelectAll}>
                {selectedCities.size === filteredCities.length
                  ? "Deselect All"
                  : "Select All"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* City Table */}
      <Card>
        <CardHeader>
          <CardTitle>Top 25 Chicago Metro Cities</CardTitle>
          <CardDescription>
            Prioritized by search volume and market opportunity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={
                      selectedCities.size === filteredCities.length &&
                      filteredCities.length > 0
                    }
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>City</TableHead>
                <TableHead>Population</TableHead>
                <TableHead className="text-right">Search Volume</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCities.map((city) => (
                <TableRow key={city.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedCities.has(city.id)}
                      onCheckedChange={() => handleSelectCity(city.id)}
                      disabled={
                        city.status !== "ready" ||
                        publishJob?.status === "running"
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{city.name}</div>
                      <div className="text-sm text-gray-500">
                        {city.slug}, {city.state}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{city.population.toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    <span className="font-semibold">
                      {city.searchVolume.toLocaleString()}
                    </span>
                    <span className="text-xs text-gray-500">/mo</span>
                  </TableCell>
                  <TableCell>
                    <Badge className={getPriorityColor(city.priority)}>
                      {city.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        city.status === "published"
                          ? "default"
                          : city.status === "ready"
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {city.status === "published" && (
                        <CheckCircle className="w-3 h-3 mr-1" />
                      )}
                      {city.status === "ready" && (
                        <Clock className="w-3 h-3 mr-1" />
                      )}
                      {city.status === "blocked" && (
                        <AlertTriangle className="w-3 h-3 mr-1" />
                      )}
                      {city.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {new Date(city.lastUpdated).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* TODO: Firebase Integration */}
      <div className="p-4 bg-gray-50 rounded border border-gray-200 text-sm text-gray-600">
        <strong>TODO:</strong> Firebase integration:
        <ul className="list-disc list-inside mt-2 ml-4">
          <li>Load cities from Firestore collection: seo_topics (pageType: city)</li>
          <li>
            Filter to top 25 by search volume from GSC data or keyword research
          </li>
          <li>Batch publish by creating pages in Firestore with publishedAt timestamp</li>
          <li>
            Trigger deploy webhook or Cloud Build after batch publish completes
          </li>
          <li>Track publish queue and rate limiting (max pages per day)</li>
          <li>Send notification on batch publish completion</li>
        </ul>
      </div>
    </div>
  );
}
