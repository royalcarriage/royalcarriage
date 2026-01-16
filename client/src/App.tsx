import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { UserRole } from "@/lib/firebase";
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

// Admin Pages
import DashboardPage from "@/pages/admin/DashboardPage";
import TripsPage from "@/pages/admin/TripsPage";
import DriversPage from "@/pages/admin/DriversPage";
import VehiclesPage from "@/pages/admin/VehiclesPage";
import CustomersPage from "@/pages/admin/CustomersPage";
import ImportsPage from "@/pages/admin/ImportsPage";
import AnalyticsPage from "@/pages/admin/AnalyticsPage";
import PayrollPage from "@/pages/admin/PayrollPage";
import InvoicesPage from "@/pages/admin/InvoicesPage";
import PaymentsPage from "@/pages/admin/PaymentsPage";
import SettingsPage from "@/pages/admin/SettingsPage";
import HelpPage from "@/pages/admin/HelpPage";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminDashboardV2 from "@/pages/admin/AdminDashboardV2";
import PageAnalyzer from "@/pages/admin/PageAnalyzer";
import UsersPage from "@/pages/admin/UsersPage";
import KPIDashboard from "@/pages/admin/KPIDashboard";

function Router() {
  return (
    <Switch>
      {/* Public Routes */}
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
      <Route path="/login" component={Login} />
      
      {/* Protected Admin Routes */}
      <Route path="/admin">
        {() => (
          <ProtectedRoute requiredRole={UserRole.VIEWER}>
            <DashboardPage />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/admin/trips">
        {() => (
          <ProtectedRoute requiredRole={UserRole.VIEWER}>
            <TripsPage />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/admin/drivers">
        {() => (
          <ProtectedRoute requiredRole={UserRole.VIEWER}>
            <DriversPage />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/admin/vehicles">
        {() => (
          <ProtectedRoute requiredRole={UserRole.VIEWER}>
            <VehiclesPage />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/admin/customers">
        {() => (
          <ProtectedRoute requiredRole={UserRole.VIEWER}>
            <CustomersPage />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/admin/imports">
        {() => (
          <ProtectedRoute requiredRole={UserRole.ADMIN}>
            <ImportsPage />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/admin/analytics">
        {() => (
          <ProtectedRoute requiredRole={UserRole.VIEWER}>
            <AnalyticsPage />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/admin/payroll">
        {() => (
          <ProtectedRoute requiredRole={UserRole.ADMIN}>
            <PayrollPage />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/admin/invoices">
        {() => (
          <ProtectedRoute requiredRole={UserRole.EDITOR}>
            <InvoicesPage />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/admin/payments">
        {() => (
          <ProtectedRoute requiredRole={UserRole.EDITOR}>
            <PaymentsPage />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/admin/settings">
        {() => (
          <ProtectedRoute requiredRole={UserRole.ADMIN}>
            <SettingsPage />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/admin/users">
        {() => (
          <ProtectedRoute requiredRole={UserRole.ADMIN}>
            <UsersPage />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/admin/help">
        {() => (
          <ProtectedRoute requiredRole={UserRole.VIEWER}>
            <HelpPage />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/admin/v1">
        {() => (
          <ProtectedRoute requiredRole={UserRole.VIEWER}>
            <AdminDashboard />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/admin/v2">
        {() => (
          <ProtectedRoute requiredRole={UserRole.VIEWER}>
            <AdminDashboardV2 />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/admin/analyze">
        {() => (
          <ProtectedRoute requiredRole={UserRole.EDITOR}>
            <PageAnalyzer />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/admin/kpi">
        {() => (
          <ProtectedRoute requiredRole={UserRole.VIEWER}>
            <KPIDashboard />
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
