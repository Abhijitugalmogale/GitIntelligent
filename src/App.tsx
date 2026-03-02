import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import PullRequests from "./pages/PullRequests";
import Issues from "./pages/Issues";
import Analytics from "./pages/Analytics";
import Repositories from "./pages/Repositories";
import SettingsPage from "./pages/Settings";
import RepoExplorer from "./pages/RepoExplorer";
import OpenSourcePrograms from "./pages/OpenSourcePrograms";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/" replace />;
  return <>{children}</>;
};

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/pull-requests" element={<PullRequests />} />
        <Route path="/issues" element={<Issues />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/repositories" element={<Repositories />} />
        <Route path="/repo-explorer" element={<RepoExplorer />} />
        <Route path="/programs" element={<OpenSourcePrograms />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="dark" storageKey="contrib-intel-theme">
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
