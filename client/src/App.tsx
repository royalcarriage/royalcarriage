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
import AdminDashboard from "@/pages/admin/AdminDashboard";
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
      <Route path="/admin" component={AdminDashboard} />
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
