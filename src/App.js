import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import { Provider } from 'react-redux';
import { store } from './store';
import { SupabaseProvider } from './contexts/SupabaseContext';

// Layout Components
import MainLayout from './components/layout/MainLayout';
import AuthLayout from './components/layout/AuthLayout';

// Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/dashboard/Dashboard';
import Mining from './pages/mining/Mining';
import Campaigns from './pages/campaigns/Campaigns';
import CampaignDetail from './pages/campaigns/CampaignDetail';
import Wallet from './pages/wallet/Wallet';
import Profile from './pages/profile/Profile';
import Referrals from './pages/referrals/Referrals';
import Rewards from './pages/rewards/Rewards';
import Settings from './pages/settings/Settings';
import BusinessDashboard from './pages/business/Dashboard';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const user = store.getState().auth.user;
  return user ? children : <Navigate to="/login" />;
};

const BusinessRoute = ({ children }) => {
  const user = store.getState().auth.user;
  const isBusiness = store.getState().auth.user?.role === 'business';
  return user && isBusiness ? children : <Navigate to="/dashboard" />;
};

const queryClient = new QueryClient();

function App() {
  return (
    <Provider store={store}>
      <SupabaseProvider>
        <QueryClientProvider client={queryClient}>
          <Router>
            <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-950 text-white">
              <Toaster 
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#1e293b',
                    color: '#fff',
                    border: '1px solid #334155',
                  },
                  success: {
                    iconTheme: {
                      primary: '#10b981',
                      secondary: '#fff',
                    },
                  },
                  error: {
                    iconTheme: {
                      primary: '#ef4444',
                      secondary: '#fff',
                    },
                  },
                }}
              />
              <Routes>
                {/* Auth Routes */}
                <Route element={<AuthLayout />}>
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/register/:referralCode" element={<Register />} />
                </Route>

                {/* Main App Routes */}
                <Route element={<MainLayout />}>
                  <Route path="/dashboard" element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/mining" element={
                    <ProtectedRoute>
                      <Mining />
                    </ProtectedRoute>
                  } />
                  <Route path="/campaigns" element={
                    <ProtectedRoute>
                      <Campaigns />
                    </ProtectedRoute>
                  } />
                  <Route path="/campaigns/:id" element={
                    <ProtectedRoute>
                      <CampaignDetail />
                    </ProtectedRoute>
                  } />
                  <Route path="/wallet" element={
                    <ProtectedRoute>
                      <Wallet />
                    </ProtectedRoute>
                  } />
                  <Route path="/profile" element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  } />
                  <Route path="/referrals" element={
                    <ProtectedRoute>
                      <Referrals />
                    </ProtectedRoute>
                  } />
                  <Route path="/rewards" element={
                    <ProtectedRoute>
                      <Rewards />
                    </ProtectedRoute>
                  } />
                  <Route path="/settings" element={
                    <ProtectedRoute>
                      <Settings />
                    </ProtectedRoute>
                  } />
                </Route>

                {/* Business Routes */}
                <Route path="/business">
                  <Route path="dashboard" element={
                    <BusinessRoute>
                      <BusinessDashboard />
                    </BusinessRoute>
                  } />
                </Route>

                {/* Default Redirect */}
                <Route path="/" element={<Navigate to="/dashboard" />} />
                <Route path="*" element={<Navigate to="/dashboard" />} />
              </Routes>
            </div>
          </Router>
        </QueryClientProvider>
      </SupabaseProvider>
    </Provider>
  );
}

export default App;
