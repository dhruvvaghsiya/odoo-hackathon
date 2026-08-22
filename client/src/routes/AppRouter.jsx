import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProtectedRoute from './ProtectedRoute';
import AppShell from '../components/AppShell';

// Pages
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import Dashboard from '../pages/Dashboard';
import MyTrips from '../pages/MyTrips';
import CreateTrip from '../pages/CreateTrip';
import ItineraryBuilder from '../pages/ItineraryBuilder';
import Timeline from '../pages/Timeline';
import Budget from '../pages/Budget';
import PublicTrip from '../pages/PublicTrip';
import Profile from '../pages/Profile';
import Discover from '../pages/Discover';
import Admin from '../pages/Admin';

import ForgotPassword from '../pages/ForgotPassword';

export default function AppRouter() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-paper">
        <div className="text-center">
          <p className="text-label mb-2">LOADING</p>
          <div className="skeleton" style={{ width: 120, height: 4 }} />
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public auth routes */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" replace /> : <Login />}
      />
      <Route
        path="/signup"
        element={isAuthenticated ? <Navigate to="/" replace /> : <Signup />}
      />
      <Route
        path="/forgot-password"
        element={<ForgotPassword />}
      />

      {/* Public trip view (no auth required) */}
      <Route path="/trip/:token" element={<PublicTrip />} />

      {/* Protected routes with AppShell layout */}
      <Route element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="trips" element={<MyTrips />} />
        <Route path="trips/new" element={<CreateTrip />} />
        <Route path="trips/:id" element={<ItineraryBuilder />} />
        <Route path="trips/:id/timeline" element={<Timeline />} />
        <Route path="trips/:id/budget" element={<Budget />} />
        <Route path="discover" element={<Discover />} />
        <Route path="profile" element={<Profile />} />
        <Route path="admin" element={<Admin />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
