import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertTriangle,
  TrendingDown,
  DollarSign,
  Bell,
  CheckCircle,
  XCircle,
} from "lucide-react";

interface BudgetAlert {
  id: string;
  condition:
    | "spend_up_revenue_down"
    | "cpa_increase_20pct_wow"
    | "roas_below_2";
  severity: "critical" | "warning" | "info";
  triggeredAt: string;
  metric: string;
  current: number;
  previous?: number;
  threshold?: number;
  change?: number;
  campaign?: string;
  description: string;
  acknowledged: boolean;
}

interface GuardrailConfig {
  condition:
    | "spend_up_revenue_down"
    | "cpa_increase_20pct_wow"
    | "roas_below_2";
  enabled: boolean;
  name: string;
  description: string;
  threshold?: number;
}

// Mock data
const generateMockAlerts = (): BudgetAlert[] => {
  return [
    {
      id: "1",
      condition: "spend_up_revenue_down",
      severity: "critical",
      triggeredAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      metric: "Spend vs Revenue",
      current: 4580,
      previous: 5200,
      change: -11.9,
      campaign: "Airport - Chicago O'Hare",
      description:
        "Spend increased by $580 (14.5%) while revenue decreased by $620 (-11.9%) compared to last week.",
      acknowledged: false,
    },
    {
      id: "2",
      condition: "cpa_increase_20pct_wow",
      severity: "warning",
      triggeredAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      metric: "CPA Week-over-Week",
      current: 187.5,
      previous: 152.3,
      change: 23.1,
      campaign: "Wedding Services",
      description:
        "Cost per acquisition increased by 23.1% compared to last week (from $152.30 to $187.50).",
      acknowledged: false,
    },
    {
      id: "3",
      condition: "roas_below_2",
      severity: "critical",
      triggeredAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      metric: "ROAS",
      current: 1.85,
      threshold: 2.0,
      campaign: "Corporate Events",
      description:
        "Return on ad spend dropped below 2x threshold. Current ROAS is 1.85x.",
      acknowledged: true,
    },
    {
      id: "4",
      condition: "cpa_increase_20pct_wow",
      severity: "warning",
      triggeredAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      metric: "CPA Week-over-Week",
      current: 215.8,
      previous: 178.2,
      change: 21.1,
      campaign: "Prom Season",
      description:
        "Cost per acquisition increased by 21.1% compared to last week (from $178.20 to $215.80).",
      acknowledged: false,
    },
    {
      id: "5",
      condition: "spend_up_revenue_down",
      severity: "warning",
      triggeredAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      metric: "Spend vs Revenue",
      current: 2850,
      previous: 3100,
      change: -8.1,
      campaign: "Midway Airport",
      description:
        "Spend increased by $320 (12.7%) while revenue decreased by $250 (-8.1%) compared to last week.",
      acknowledged: true,
    },
  ];
};

export function BudgetGuardrails() {
  const [alerts, setAlerts] = useState<BudgetAlert[]>(generateMockAlerts());
  const [guardrails, setGuardrails] = useState<GuardrailConfig[]>([
    {
      condition: "spend_up_revenue_down",
      enabled: true,
      name: "Spend Up, Revenue Down",
      description:
        "Triggers when ad spend increases but revenue decreases week-over-week",
    },
    {
      condition: "cpa_increase_20pct_wow",
      enabled: true,
      name: "CPA Increase >20% WoW",
      description:
        "Triggers when cost per acquisition increases by more than 20% week-over-week",
      threshold: 20,
    },
    {
      condition: "roas_below_2",
      enabled: true,
      name: "ROAS Below 2x",
      description: "Triggers when return on ad spend drops below 2.0x",
      threshold: 2.0,
    },
  ]);

  const activeAlerts = alerts.filter((a) => !a.acknowledged);
  const acknowledgedAlerts = alerts.filter((a) => a.acknowledged);

  const handleAcknowledge = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((alert) =>
        alert.id === alertId ? { ...alert, acknowledged: true } : alert,
      ),
    );
    // TODO: Firebase update
    console.log("Acknowledged alert:", alertId);
  };

  const handleToggleGuardrail = (condition: string) => {
    setGuardrails((prev) =>
      prev.map((g) =>
        g.condition === condition ? { ...g, enabled: !g.enabled } : g,
      ),
    );
    // TODO: Firebase update
    console.log("Toggled guardrail:", condition);
  };

  const getSeverityIcon = (severity: BudgetAlert["severity"]) => {
    switch (severity) {
      case "critical":
        return <XCircle className="w-5 h-5 text-red-500" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case "info":
        return <Bell className="w-5 h-5 text-blue-500" />;
    }
  };

  const getSeverityColor = (severity: BudgetAlert["severity"]) => {
    switch (severity) {
      case "critical":
        return "border-red-500 bg-red-50";
      case "warning":
        return "border-yellow-500 bg-yellow-50";
      case "info":
        return "border-blue-500 bg-blue-50";
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 24) {
      return `${hours}h ago`;
    }
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <div>
                <p className="text-sm text-gray-600">Active Alerts</p>
                <p className="text-2xl font-bold">{activeAlerts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Acknowledged</p>
                <p className="text-2xl font-bold">
                  {acknowledgedAlerts.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Enabled Guardrails</p>
                <p className="text-2xl font-bold">
                  {guardrails.filter((g) => g.enabled).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-sm text-gray-600">Critical Issues</p>
                <p className="text-2xl font-bold">
                  {
                    alerts.filter(
                      (a) => a.severity === "critical" && !a.acknowledged,
                    ).length
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Active Budget Alerts
          </CardTitle>
          <CardDescription>
            Budget guardrails that have been triggered and need attention
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activeAlerts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500" />
              <p>No active alerts. All guardrails are within thresholds.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-4 border-l-4 rounded-lg ${getSeverityColor(alert.severity)}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getSeverityIcon(alert.severity)}
                        <h4 className="font-semibold">{alert.metric}</h4>
                        <Badge variant="outline">{alert.campaign}</Badge>
                        <span className="text-xs text-gray-500">
                          {formatTimestamp(alert.triggeredAt)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mb-3">
                        {alert.description}
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        {alert.current && (
                          <div>
                            <span className="text-gray-600">Current:</span>{" "}
                            <span className="font-semibold">
                              {alert.metric.includes("ROAS")
                                ? `${alert.current.toFixed(2)}x`
                                : alert.metric.includes("CPA")
                                  ? `$${alert.current.toFixed(2)}`
                                  : `$${alert.current.toLocaleString()}`}
                            </span>
                          </div>
                        )}
                        {alert.previous && (
                          <div>
                            <span className="text-gray-600">Previous:</span>{" "}
                            <span className="font-semibold">
                              {alert.metric.includes("CPA")
                                ? `$${alert.previous.toFixed(2)}`
                                : `$${alert.previous.toLocaleString()}`}
                            </span>
                          </div>
                        )}
                        {alert.change !== undefined && (
                          <div>
                            <span className="text-gray-600">Change:</span>{" "}
                            <span
                              className={`font-semibold ${
                                alert.change < 0
                                  ? "text-red-600"
                                  : "text-orange-600"
                              }`}
                            >
                              {alert.change > 0 ? "+" : ""}
                              {alert.change.toFixed(1)}%
                            </span>
                          </div>
                        )}
                        {alert.threshold && (
                          <div>
                            <span className="text-gray-600">Threshold:</span>{" "}
                            <span className="font-semibold">
                              {alert.metric.includes("ROAS")
                                ? `${alert.threshold}x`
                                : `${alert.threshold}%`}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAcknowledge(alert.id)}
                      className="ml-4"
                    >
                      Acknowledge
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Guardrail Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Guardrail Configuration</CardTitle>
          <CardDescription>
            Enable or disable specific budget monitoring conditions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {guardrails.map((guardrail) => (
              <div
                key={guardrail.condition}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold">{guardrail.name}</h4>
                    {guardrail.threshold && (
                      <Badge variant="secondary">
                        Threshold:{" "}
                        {guardrail.condition === "roas_below_2"
                          ? `${guardrail.threshold}x`
                          : `${guardrail.threshold}%`}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">
                    {guardrail.description}
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <Label
                    htmlFor={`toggle-${guardrail.condition}`}
                    className="text-sm"
                  >
                    {guardrail.enabled ? "Enabled" : "Disabled"}
                  </Label>
                  <Switch
                    id={`toggle-${guardrail.condition}`}
                    checked={guardrail.enabled}
                    onCheckedChange={() =>
                      handleToggleGuardrail(guardrail.condition)
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Acknowledged Alerts History */}
      <Card>
        <CardHeader>
          <CardTitle>Acknowledged Alerts</CardTitle>
          <CardDescription>
            Recent alerts that have been reviewed
          </CardDescription>
        </CardHeader>
        <CardContent>
          {acknowledgedAlerts.length === 0 ? (
            <p className="text-center py-4 text-gray-500">
              No acknowledged alerts
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Triggered</TableHead>
                  <TableHead>Condition</TableHead>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {acknowledgedAlerts.map((alert) => (
                  <TableRow key={alert.id}>
                    <TableCell>{formatTimestamp(alert.triggeredAt)}</TableCell>
                    <TableCell className="font-medium">
                      {alert.metric}
                    </TableCell>
                    <TableCell>{alert.campaign}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          alert.severity === "critical"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {alert.severity}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {alert.description}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* TODO: Firebase Integration */}
      <div className="p-4 bg-gray-50 rounded border border-gray-200 text-sm text-gray-600">
        <strong>TODO:</strong> Connect to Firebase for:
        <ul className="list-disc list-inside mt-2 ml-4">
          <li>Real-time alert monitoring from ads imports and bookings</li>
          <li>Store guardrail configurations in Firestore</li>
          <li>Track alert acknowledgements with timestamp and user</li>
          <li>Set up Cloud Functions to check conditions daily</li>
          <li>Send email/Slack notifications for critical alerts</li>
        </ul>
      </div>
    </div>
  );
}
