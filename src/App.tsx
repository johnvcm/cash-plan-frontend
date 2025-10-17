import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import Dashboard from "./pages/Dashboard";
import Lancamentos from "./pages/Lancamentos";
import Contas from "./pages/Contas";
import Cartoes from "./pages/Cartoes";
import Investimentos from "./pages/Investimentos";
import Metas from "./pages/Metas";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SidebarProvider>
          <div className="flex min-h-screen w-full">
            <AppSidebar />
            <main className="flex-1 overflow-auto">
              <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6">
                <SidebarTrigger />
                <div className="flex-1" />
              </header>
              <div className="container py-6">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/lancamentos" element={<Lancamentos />} />
                  <Route path="/contas" element={<Contas />} />
                  <Route path="/cartoes" element={<Cartoes />} />
                  <Route path="/investimentos" element={<Investimentos />} />
                  <Route path="/metas" element={<Metas />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
            </main>
          </div>
        </SidebarProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
