import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ShieldAlert } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function Unauthorized() {
  const [, setLocation] = useLocation();
  const { logout } = useAuth();

  const handleGoBack = () => {
    setLocation("/");
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center mb-2">
            <ShieldAlert className="w-6 h-6 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold">Access Denied</CardTitle>
          <CardDescription>
            You don't have permission to access this page
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-sm text-slate-500">
            This area requires elevated permissions. If you believe this is an
            error, please contact your administrator.
          </p>

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={handleGoBack}>
              Go Back
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={handleLogout}
            >
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
