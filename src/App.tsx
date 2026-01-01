import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Setup from "./pages/Setup";
import NetworkSetup from "./pages/setup/NetworkSetup";
import EndpointsSetup from "./pages/setup/EndpointsSetup";
import ContentSetup from "./pages/setup/ContentSetup";
import ConceptsSetup from "./pages/setup/ConceptsSetup";
import CustomConceptsSetup from "./pages/setup/CustomConceptsSetup";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import { settingsService } from "./services";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    settingsService.getSettings();
  }, []);

  return (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/setup" element={<Setup />} />
          <Route path="/setup/network" element={<NetworkSetup />} />
          <Route path="/setup/endpoints" element={<EndpointsSetup />} />
          <Route path="/setup/content" element={<ContentSetup />} />
          <Route path="/setup/concepts" element={<ConceptsSetup />} />
          <Route path="/setup/custom-concepts" element={<CustomConceptsSetup />} />
          <Route path="/settings" element={<Settings />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  );
};

export default App;
