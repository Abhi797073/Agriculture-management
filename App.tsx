
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ThemeProvider } from "@/hooks/use-theme";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import Fields from "./pages/Fields";
import Crops from "./pages/Crops";
import Weather from "./pages/Weather";
import Analytics from "./pages/Analytics";
import Farmer from "./pages/Farmer";
import Supplier from "./pages/Supplier";
import Specialist from "./pages/Specialist";

const queryClient = new QueryClient();

// Protected route component with role-based access control
const ProtectedRoute = ({ 
  children, 
  allowedRoles = [] 
}: { 
  children: React.ReactNode; 
  allowedRoles?: string[]; 
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();
  
  useEffect(() => {
    // Prevent users from seeing data from other sessions by refreshing the page on role change
    const currentUserJSON = localStorage.getItem('farmlytic_user');
    if (currentUserJSON && user) {
      const storedUser = JSON.parse(currentUserJSON);
      if (storedUser.id !== user.id) {
        window.location.reload();
      }
    }
  }, [user]);
  
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // If there are allowed roles specified and the user's role is not in the list
  if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
    // Redirect to their role-specific page
    if (user.role === 'farmer') {
      return <Navigate to="/farmer" replace />;
    } else if (user.role === 'supplier') {
      return <Navigate to="/supplier" replace />;
    } else if (user.role === 'specialist') {
      return <Navigate to="/specialist" replace />;
    }
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

// Home page redirection based on user role
const HomeRedirect = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Index />;
  }
  
  // Redirect based on role
  if (user?.role === 'farmer') {
    return <Navigate to="/farmer" replace />;
  } else if (user?.role === 'supplier') {
    return <Navigate to="/supplier" replace />;
  } else if (user?.role === 'specialist') {
    return <Navigate to="/specialist" replace />;
  }
  
  return <Index />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<HomeRedirect />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/fields" element={
                <ProtectedRoute allowedRoles={['farmer']}>
                  <Fields />
                </ProtectedRoute>
              } />
              <Route path="/crops" element={
                <ProtectedRoute allowedRoles={['farmer']}>
                  <Crops />
                </ProtectedRoute>
              } />
              <Route path="/weather" element={
                <ProtectedRoute>
                  <Weather />
                </ProtectedRoute>
              } />
              <Route path="/analytics" element={
                <ProtectedRoute>
                  <Analytics />
                </ProtectedRoute>
              } />
              <Route path="/farmer" element={
                <ProtectedRoute allowedRoles={['farmer']}>
                  <Farmer />
                </ProtectedRoute>
              } />
              <Route path="/supplier" element={
                <ProtectedRoute allowedRoles={['supplier']}>
                  <Supplier />
                </ProtectedRoute>
              } />
              <Route path="/specialist" element={
                <ProtectedRoute allowedRoles={['specialist']}>
                  <Specialist />
                </ProtectedRoute>
              } />
              {/* Make sure the catch-all route is the last one */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
