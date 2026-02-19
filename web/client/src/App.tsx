import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Dashboard from "./pages/Dashboard";
import Anomalies from "./pages/Anomalies";
import AnomalyDetail from "./pages/AnomalyDetail";
import Search from "./pages/Search";
import Blockchain from "./pages/Blockchain";
import Mission from "./pages/Mission";
import Metrics from "./pages/Metrics";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Dashboard} />
      <Route path={"/anomalies"} component={Anomalies} />
      <Route path={"/anomalies/:id"} component={AnomalyDetail} />
      <Route path={"/search"} component={Search} />
      <Route path={"/blockchain"} component={Blockchain} />
      <Route path={"/mission"} component={Mission} />
      <Route path={"/metrics"} component={Metrics} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="dark"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
