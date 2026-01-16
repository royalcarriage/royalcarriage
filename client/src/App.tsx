import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/contexts/AuthContext";
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

// Admin Pages
import LoginPage from "@/pages/admin/LoginPage";
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
import ROIDashboard from "@/pages/admin/ROIDashboard";
import SEOWorkflow from "@/pages/admin/SEOWorkflow";

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
      
      {/* Admin Login (Public) */}
      <Route path="/admin/login" component={LoginPage} />
      
      {/* Protected Admin Routes */}
      <Route path="/admin">
        <ProtectedRoute>
          <DashboardPage />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/trips">
        <ProtectedRoute>
          <TripsPage />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/drivers">
        <ProtectedRoute>
          <DriversPage />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/vehicles">
        <ProtectedRoute>
          <VehiclesPage />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/customers">
        <ProtectedRoute>
          <CustomersPage />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/imports">
        <ProtectedRoute>
          <ImportsPage />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/analytics">
        <ProtectedRoute>
          <AnalyticsPage />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/payroll">
        <ProtectedRoute>
          <PayrollPage />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/invoices">
        <ProtectedRoute>
          <InvoicesPage />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/payments">
        <ProtectedRoute>
          <PaymentsPage />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/settings">
        <ProtectedRoute>
          <SettingsPage />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/help">
        <ProtectedRoute>
          <HelpPage />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/v2">
        <ProtectedRoute>
          <AdminDashboardV2 />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/v1">
        <ProtectedRoute>
          <AdminDashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/analyze">
        <ProtectedRoute>
          <PageAnalyzer />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/roi">
        <ProtectedRoute>
          <ROIDashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/seo-workflow">
        <ProtectedRoute>
          <SEOWorkflow />
        </ProtectedRoute>
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
