import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PrimaryButton, DangerButton } from "@/components/admin/buttons";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/lib/firebase";
import { Copy, Edit, Save, X, CheckCircle2, Settings } from "lucide-react";

interface EnvConfig {
  bookingUrlBase: string;
  phoneNumber: string;
  ga4Id: string;
  utmRules: {
    source: string;
    medium: string;
    campaign: string;
  };
}

export default function EnvConfigViewer() {
  const { userData } = useAuth();
  const [isEditMode, setIsEditMode] = useState(false);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  // Mock data - replace with actual API call
  const [config, setConfig] = useState<EnvConfig>({
    bookingUrlBase: "https://royalcarriagelimo.com/book",
    phoneNumber: "+1 (555) 123-4567",
    ga4Id: "G-XXXXXXXXXX",
    utmRules: {
      source: "direct",
      medium: "organic",
      campaign: "default",
    },
  });

  const [editedConfig, setEditedConfig] = useState<EnvConfig>(config);

  const isAdminPlus =
    userData?.role === UserRole.SUPER_ADMIN ||
    userData?.role === UserRole.ADMIN;

  const handleCopy = (value: string, label: string) => {
    navigator.clipboard.writeText(value);
    setCopySuccess(label);
    setTimeout(() => setCopySuccess(null), 2000);
  };

  const handleSave = async () => {
    // TODO: Implement save logic with API call
    setConfig(editedConfig);
    setIsEditMode(false);
  };

  const handleCancel = () => {
    setEditedConfig(config);
    setIsEditMode(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Settings className="h-8 w-8" />
            Environment Configuration
          </h1>
          <p className="text-muted-foreground mt-2">
            View and manage environment configuration settings
          </p>
        </div>
        {isAdminPlus && !isEditMode && (
          <PrimaryButton onClick={() => setIsEditMode(true)}>
            <Edit className="h-4 w-4" />
            Edit Configuration
          </PrimaryButton>
        )}
        {isEditMode && (
          <div className="flex gap-2">
            <PrimaryButton onClick={handleSave}>
              <Save className="h-4 w-4" />
              Save Changes
            </PrimaryButton>
            <Button variant="outline" onClick={handleCancel}>
              <X className="h-4 w-4" />
              Cancel
            </Button>
          </div>
        )}
      </div>

      {!isAdminPlus && (
        <Alert>
          <AlertDescription>
            You have read-only access. Admin+ roles required to edit
            configuration.
          </AlertDescription>
        </Alert>
      )}

      {copySuccess && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            {copySuccess} copied to clipboard!
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6">
        {/* Booking URL Base */}
        <Card>
          <CardHeader>
            <CardTitle>Booking URL Base</CardTitle>
            <CardDescription>
              Base URL used for generating booking links
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isEditMode ? (
              <div className="space-y-2">
                <Label htmlFor="bookingUrl">Booking URL</Label>
                <Input
                  id="bookingUrl"
                  value={editedConfig.bookingUrlBase}
                  onChange={(e) =>
                    setEditedConfig({
                      ...editedConfig,
                      bookingUrlBase: e.target.value,
                    })
                  }
                />
              </div>
            ) : (
              <div className="flex items-center justify-between gap-4">
                <code className="flex-1 px-4 py-2 bg-muted rounded-md text-sm">
                  {config.bookingUrlBase}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handleCopy(config.bookingUrlBase, "Booking URL")
                  }
                >
                  <Copy className="h-4 w-4" />
                  Copy
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Phone Number */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Phone Number</CardTitle>
            <CardDescription>
              Primary contact number for customer support
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isEditMode ? (
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  value={editedConfig.phoneNumber}
                  onChange={(e) =>
                    setEditedConfig({
                      ...editedConfig,
                      phoneNumber: e.target.value,
                    })
                  }
                />
              </div>
            ) : (
              <div className="flex items-center justify-between gap-4">
                <code className="flex-1 px-4 py-2 bg-muted rounded-md text-sm">
                  {config.phoneNumber}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy(config.phoneNumber, "Phone Number")}
                >
                  <Copy className="h-4 w-4" />
                  Copy
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* GA4 ID */}
        <Card>
          <CardHeader>
            <CardTitle>Google Analytics 4 ID</CardTitle>
            <CardDescription>
              Tracking ID for Google Analytics 4 property
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isEditMode ? (
              <div className="space-y-2">
                <Label htmlFor="ga4Id">GA4 Measurement ID</Label>
                <Input
                  id="ga4Id"
                  value={editedConfig.ga4Id}
                  onChange={(e) =>
                    setEditedConfig({
                      ...editedConfig,
                      ga4Id: e.target.value,
                    })
                  }
                />
              </div>
            ) : (
              <div className="flex items-center justify-between gap-4">
                <code className="flex-1 px-4 py-2 bg-muted rounded-md text-sm">
                  {config.ga4Id}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy(config.ga4Id, "GA4 ID")}
                >
                  <Copy className="h-4 w-4" />
                  Copy
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* UTM Rules */}
        <Card>
          <CardHeader>
            <CardTitle>Default UTM Parameters</CardTitle>
            <CardDescription>
              Default UTM tracking parameters for campaign tracking
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditMode ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="utmSource">UTM Source</Label>
                  <Input
                    id="utmSource"
                    value={editedConfig.utmRules.source}
                    onChange={(e) =>
                      setEditedConfig({
                        ...editedConfig,
                        utmRules: {
                          ...editedConfig.utmRules,
                          source: e.target.value,
                        },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="utmMedium">UTM Medium</Label>
                  <Input
                    id="utmMedium"
                    value={editedConfig.utmRules.medium}
                    onChange={(e) =>
                      setEditedConfig({
                        ...editedConfig,
                        utmRules: {
                          ...editedConfig.utmRules,
                          medium: e.target.value,
                        },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="utmCampaign">UTM Campaign</Label>
                  <Input
                    id="utmCampaign"
                    value={editedConfig.utmRules.campaign}
                    onChange={(e) =>
                      setEditedConfig({
                        ...editedConfig,
                        utmRules: {
                          ...editedConfig.utmRules,
                          campaign: e.target.value,
                        },
                      })
                    }
                  />
                </div>
              </>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <span className="text-sm font-medium">Source:</span>
                    <code className="ml-2 px-2 py-1 bg-muted rounded text-sm">
                      {config.utmRules.source}
                    </code>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleCopy(config.utmRules.source, "UTM Source")
                    }
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <span className="text-sm font-medium">Medium:</span>
                    <code className="ml-2 px-2 py-1 bg-muted rounded text-sm">
                      {config.utmRules.medium}
                    </code>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleCopy(config.utmRules.medium, "UTM Medium")
                    }
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <span className="text-sm font-medium">Campaign:</span>
                    <code className="ml-2 px-2 py-1 bg-muted rounded text-sm">
                      {config.utmRules.campaign}
                    </code>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleCopy(config.utmRules.campaign, "UTM Campaign")
                    }
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
