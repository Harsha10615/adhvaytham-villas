import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import Home from './pages/Home';
import About from './pages/About';
import MasterLayout from './pages/MasterLayout';
import Availability from './pages/Availability';
import Amenities from './pages/Amenities';
import Gallery from './pages/Gallery';
import Location from './pages/Location';
import Contact from './pages/Contact';
import VillaDetails from './pages/VillaDetails';
import AdminDashboard from './pages/AdminDashboard';
import AdminPreview from './pages/AdminPreview';
import Auth from './pages/Auth';
import BookSiteVisit from './pages/BookSiteVisit';
import VillaBooking from './pages/VillaBooking';

// Protected Admin Route
const AdminRoute = ({ children }) => {
  const { admin, loading } = useAuth();
  
  if (loading) return null; // Or a loading spinner

  if (!admin) {
    return <Navigate to="/" replace />;
  }
  return children;
};

// Protected User Route
const ProtectedRoute = ({ children }) => {
  const { user, admin, loading } = useAuth();
  
  if (loading) return null; // Or a loading spinner

  if (!user && !admin) {
    return <Navigate to="/" replace />;
  }
  return children;
};

// Layout wrapper to easily toggle and hide layout elements if needed
const AppLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Hide header and footer for admin pages and auth page (landing)
  const isAdminPage = location.pathname.startsWith('/admin');
  const isAuthPage = location.pathname === '/';
  const hideLayout = isAdminPage || isAuthPage;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: isAdminPage ? '#0d1216' : 'transparent' }}>
      {!hideLayout && (
        <Navbar onToggleSidebar={() => setSidebarOpen(true)} />
      )}
      
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <main style={{ flex: 1, minHeight: '70vh' }}>
        {children}
      </main>
      
      {!hideLayout && <Footer />}
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppLayout>
          <Routes>
            <Route path="/" element={<Auth />} />
            <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/about" element={<ProtectedRoute><About /></ProtectedRoute>} />
            <Route path="/master-layout" element={<ProtectedRoute><MasterLayout /></ProtectedRoute>} />
            <Route path="/availability" element={<ProtectedRoute><Availability /></ProtectedRoute>} />
            <Route path="/amenities" element={<ProtectedRoute><Amenities /></ProtectedRoute>} />
            <Route path="/gallery" element={<ProtectedRoute><Gallery /></ProtectedRoute>} />
            <Route path="/location" element={<ProtectedRoute><Location /></ProtectedRoute>} />
            <Route path="/contact" element={<ProtectedRoute><Contact /></ProtectedRoute>} />
            <Route path="/book-site-visit" element={<ProtectedRoute><BookSiteVisit /></ProtectedRoute>} />
            <Route path="/villa-booking" element={<ProtectedRoute><VillaBooking /></ProtectedRoute>} />
            <Route path="/villas/:id" element={<ProtectedRoute><VillaDetails /></ProtectedRoute>} />
            <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/admin/website-preview" element={<AdminRoute><AdminPreview /></AdminRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppLayout>
      </AuthProvider>
    </Router>
  );
}

export default App;
