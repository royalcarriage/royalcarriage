import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PrimaryButton, SecondaryButton } from "@/components/admin/buttons";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/lib/firebase";
import {
  Leaf,
  Snowflake,
  Sun,
  CloudRain,
  Image as ImageIcon,
  Save,
  Eye,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

type Season = "winter" | "spring" | "summer" | "fall";

interface SeasonConfig {
  activeSeason: Season;
  lastUpdated: string;
  updatedBy: string;
  previewImages: {
    airport: string;
    corporate: string;
    wedding: string;
    partybus: string;
  };
}

const SEASON_INFO = {
  winter: {
    name: "Winter",
    icon: Snowflake,
    color: "bg-blue-100 text-blue-800 border-blue-300",
    description: "Snowy and festive imagery",
    months: "Dec - Feb",
  },
  spring: {
    name: "Spring",
    icon: Leaf,
    color: "bg-green-100 text-green-800 border-green-300",
    description: "Fresh and blooming imagery",
    months: "Mar - May",
  },
  summer: {
    name: "Summer",
    icon: Sun,
    color: "bg-yellow-100 text-yellow-800 border-yellow-300",
    description: "Bright and sunny imagery",
    months: "Jun - Aug",
  },
  fall: {
    name: "Fall",
    icon: CloudRain,
    color: "bg-orange-100 text-orange-800 border-orange-300",
    description: "Warm autumn colors",
    months: "Sep - Nov",
  },
};

const PREVIEW_IMAGES = {
  winter: {
    airport: "/images/hero/airport-winter.jpg",
    corporate: "/images/hero/corporate-winter.jpg",
    wedding: "/images/hero/wedding-winter.jpg",
    partybus: "/images/hero/partybus-winter.jpg",
  },
  spring: {
    airport: "/images/hero/airport-spring.jpg",
    corporate: "/images/hero/corporate-spring.jpg",
    wedding: "/images/hero/wedding-spring.jpg",
    partybus: "/images/hero/partybus-spring.jpg",
  },
  summer: {
    airport: "/images/hero/airport-summer.jpg",
    corporate: "/images/hero/corporate-summer.jpg",
    wedding: "/images/hero/wedding-summer.jpg",
    partybus: "/images/hero/partybus-summer.jpg",
  },
  fall: {
    airport: "/images/hero/airport-fall.jpg",
    corporate: "/images/hero/corporate-fall.jpg",
    wedding: "/images/hero/wedding-fall.jpg",
    partybus: "/images/hero/partybus-fall.jpg",
  },
};

export default function SeasonalSwitch() {
  const { userData } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<SeasonConfig | null>(null);
  const [selectedSeason, setSelectedSeason] = useState<Season>("summer");
  const [previewMode, setPreviewMode] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const isAdminPlus =
    userData?.role === UserRole.SUPER_ADMIN ||
    userData?.role === UserRole.ADMIN;

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setLoading(true);

      // TODO: Replace with actual Firestore query
      // const docRef = doc(db, 'settings', 'seasonal');
      // const docSnap = await getDoc(docRef);

      // if (docSnap.exists()) {
      //   const data = docSnap.data() as SeasonConfig;
      //   setConfig(data);
      //   setSelectedSeason(data.activeSeason);
      // }

      // Mock data for skeleton implementation
      const mockConfig: SeasonConfig = {
        activeSeason: "summer",
        lastUpdated: new Date().toISOString(),
        updatedBy: "admin@example.com",
        previewImages: PREVIEW_IMAGES.summer,
      };

      setConfig(mockConfig);
      setSelectedSeason(mockConfig.activeSeason);
    } catch (error) {
      console.error("Error loading seasonal config:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!isAdminPlus || !userData) return;

    try {
      setSaving(true);

      const newConfig: SeasonConfig = {
        activeSeason: selectedSeason,
        lastUpdated: new Date().toISOString(),
        updatedBy: userData.email || "unknown",
        previewImages: PREVIEW_IMAGES[selectedSeason],
      };

      // TODO: Replace with actual Firestore save
      // const docRef = doc(db, 'settings', 'seasonal');
      // await setDoc(docRef, newConfig);

      console.log("Saving seasonal config:", newConfig);

      setConfig(newConfig);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Error saving seasonal config:", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Snowflake className="h-8 w-8" />
            Seasonal Imagery Switch
          </h1>
          <p className="text-muted-foreground mt-2">
            Control seasonal hero images across all marketing sites
          </p>
        </div>
        {saveSuccess && (
          <Alert className="w-auto border-green-300 bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Season updated successfully!
            </AlertDescription>
          </Alert>
        )}
      </div>

      {!isAdminPlus && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You need Admin or Super Admin role to change seasonal settings.
          </AlertDescription>
        </Alert>
      )}

      {/* Current Active Season */}
      {config && (
        <Card>
          <CardHeader>
            <CardTitle>Current Active Season</CardTitle>
            <CardDescription>
              Last updated: {new Date(config.lastUpdated).toLocaleString()} by{" "}
              {config.updatedBy}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              {(() => {
                const SeasonIcon = SEASON_INFO[config.activeSeason].icon;
                return (
                  <>
                    <SeasonIcon className="h-12 w-12 text-primary" />
                    <div>
                      <h3 className="text-2xl font-bold">
                        {SEASON_INFO[config.activeSeason].name}
                      </h3>
                      <p className="text-muted-foreground">
                        {SEASON_INFO[config.activeSeason].description}
                      </p>
                    </div>
                  </>
                );
              })()}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Season Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Season</CardTitle>
          <CardDescription>
            Choose the season to activate across all sites
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {(Object.keys(SEASON_INFO) as Season[]).map((season) => {
              const info = SEASON_INFO[season];
              const Icon = info.icon;
              const isActive = selectedSeason === season;
              const isCurrent = config?.activeSeason === season;

              return (
                <button
                  key={season}
                  onClick={() => isAdminPlus && setSelectedSeason(season)}
                  disabled={!isAdminPlus}
                  className={`
                    relative p-4 border-2 rounded-lg text-left transition-all
                    ${isActive ? "border-primary shadow-lg scale-105" : "border-gray-200 hover:border-gray-300"}
                    ${!isAdminPlus ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                  `}
                >
                  {isCurrent && (
                    <Badge className="absolute top-2 right-2 bg-green-100 text-green-800">
                      Current
                    </Badge>
                  )}
                  <div className="flex items-center gap-3 mb-2">
                    <Icon className="h-8 w-8 text-primary" />
                    <div>
                      <h3 className="font-bold">{info.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {info.months}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {info.description}
                  </p>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Preview Images */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Preview Images</CardTitle>
              <CardDescription>
                Hero images for {SEASON_INFO[selectedSeason].name} season
              </CardDescription>
            </div>
            <Button
              variant="outline"
              onClick={() => setPreviewMode(!previewMode)}
            >
              <Eye className="h-4 w-4 mr-2" />
              {previewMode ? "Hide" : "Show"} Preview
            </Button>
          </div>
        </CardHeader>
        {previewMode && (
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(["airport", "corporate", "wedding", "partybus"] as const).map(
                (site) => (
                  <div key={site} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold capitalize">{site}</h4>
                      <Badge variant="outline">
                        {PREVIEW_IMAGES[selectedSeason][site]}
                      </Badge>
                    </div>
                    <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center border">
                      <div className="text-center text-muted-foreground">
                        <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">
                          {PREVIEW_IMAGES[selectedSeason][site]}
                        </p>
                      </div>
                    </div>
                  </div>
                ),
              )}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Save Button */}
      {isAdminPlus && (
        <div className="flex justify-end gap-3">
          <SecondaryButton onClick={loadConfig}>Cancel</SecondaryButton>
          <PrimaryButton
            onClick={handleSave}
            disabled={saving || selectedSeason === config?.activeSeason}
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Saving..." : "Save Season Configuration"}
          </PrimaryButton>
        </div>
      )}
    </div>
  );
}
