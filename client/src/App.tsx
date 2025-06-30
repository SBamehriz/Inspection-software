import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "./lib/auth";
import SignIn from "@/pages/SignIn";
import Dashboard from "@/pages/Dashboard";
import StationSelection from "@/pages/StationSelection";
import ScanningStation from "@/pages/ScanningStation";
import PhotographingStation from "@/pages/PhotographingStation";
import Reports from "@/pages/Reports";
import Navigation from "@/components/Navigation";
import NotFound from "@/pages/not-found";

function Router() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-astora-gradient">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <SignIn />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation user={user} />
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/station-selection" component={StationSelection} />
        <Route path="/scanning" component={ScanningStation} />
        <Route path="/photographing" component={PhotographingStation} />
        <Route path="/reports" component={Reports} />
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
