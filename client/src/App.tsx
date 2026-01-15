import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import OHareAirport from "@/pages/OHareAirport";
import MidwayAirport from "@/pages/MidwayAirport";
import DowntownChicago from "@/pages/DowntownChicago";
import SuburbsService from "@/pages/SuburbsService";
import CityPage from "@/pages/CityPage";
import Fleet from "@/pages/Fleet";
import Pricing from "@/pages/Pricing";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import Login from "@/pages/Login";
import Unauthorized from "@/pages/Unauthorized";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import PageAnalyzer from "@/pages/admin/PageAnalyzer";
import Users from "@/pages/admin/Users";
import Analytics from "@/pages/admin/Analytics";
import Settings from "@/pages/admin/Settings";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/ohare-airport-limo" component={OHareAirport} />
      <Route path="/midway-airport-limo" component={MidwayAirport} />
      <Route path="/airport-limo-downtown-chicago" component={DowntownChicago} />
      <Route path="/airport-limo-suburbs" component={SuburbsService} />
      <Route path="/city/:slug" component={CityPage} />
      <Route path="/fleet" component={Fleet} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/about" component={About} />
      <Route path="/contact" component={Contact} />

      {/* Auth Routes */}
      <Route path="/login" component={Login} />
      <Route path="/unauthorized" component={Unauthorized} />

      {/* Admin Routes - Protected */}
      <Route path="/admin">
        {() => (
          <ProtectedRoute requiredRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/admin/analyze">
        {() => (
          <ProtectedRoute requiredRole="admin">
            <PageAnalyzer />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/admin/users">
        {() => (
          <ProtectedRoute requiredRole="admin">
            <Users />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/admin/analytics">
        {() => (
          <ProtectedRoute requiredRole="admin">
            <Analytics />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/admin/settings">
        {() => (
          <ProtectedRoute requiredRole="super_admin">
            <Settings />
          </ProtectedRoute>
        )}
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
