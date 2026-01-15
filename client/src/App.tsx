import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { HelmetProvider } from "react-helmet-async";
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
      
      {/* Admin Routes */}
      <Route path="/admin" component={DashboardPage} />
      <Route path="/admin/trips" component={TripsPage} />
      <Route path="/admin/drivers" component={DriversPage} />
      <Route path="/admin/vehicles" component={VehiclesPage} />
      <Route path="/admin/customers" component={CustomersPage} />
      <Route path="/admin/imports" component={ImportsPage} />
      <Route path="/admin/analytics" component={AnalyticsPage} />
      <Route path="/admin/payroll" component={PayrollPage} />
      <Route path="/admin/invoices" component={InvoicesPage} />
      <Route path="/admin/payments" component={PaymentsPage} />
      <Route path="/admin/settings" component={SettingsPage} />
      <Route path="/admin/help" component={HelpPage} />
      <Route path="/admin" component={AdminDashboardV2} />
      <Route path="/admin/v1" component={AdminDashboard} />
      <Route path="/admin/analyze" component={PageAnalyzer} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
