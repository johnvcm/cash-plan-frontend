import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppHeader } from "@/components/AppHeader";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { SwipeMenuProvider, useSwipeMenuContext } from "@/contexts/SwipeMenuContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useCapacitorPlugins } from "@/hooks/use-capacitor-plugins";
import Dashboard from "./pages/Dashboard";
import Lancamentos from "./pages/Lancamentos";
import Contas from "./pages/Contas";
import Cartoes from "./pages/Cartoes";
import Investimentos from "./pages/Investimentos";
import Metas from "./pages/Metas";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedLayout() {
  const { swipeHandlers } = useSwipeMenuContext();
  
  return (
    <div className="min-h-screen w-full flex flex-col">
      <AppHeader />
      <main className="flex-1 w-full" {...swipeHandlers}>
        <div className="container mx-auto px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
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
  );
}

function AppContent() {
  const { isAuthenticated } = useAuth();
  
  // Inicializar plugins do Capacitor (StatusBar, Keyboard, etc)
  useCapacitorPlugins();

  return (
    <Routes>
      {/* Rotas Públicas */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" replace /> : <Login />}
      />
      <Route
        path="/register"
        element={isAuthenticated ? <Navigate to="/" replace /> : <Register />}
      />

      {/* Rotas Protegidas */}
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <ProtectedLayout />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <AuthProvider>
          <SwipeMenuProvider>
            <AppContent />
          </SwipeMenuProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
