import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import LoginPage from '../pages/LoginPage';
import DashboardPage from '../pages/DashboardPage';
import WorkOrdersPage from '../pages/WorkOrdersPage';
import CreateOrderPage from '../pages/CreateOrderPage';
import WorkOrderDetailPage from '../pages/WorkOrderDetailPage';
import ClientsPage from '../pages/ClientsPage';
import BikesPage from '../pages/BikesPage';
import ProfilePage from '../pages/ProfilePage';
import { useAuth } from '../context/AuthContext';
import AdminRoute from '../components/AdminRoute';
import UsersPage from '../pages/UsersPage';

export default function AppRouter() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />}
      />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/work-orders"
        element={
          <ProtectedRoute>
            <WorkOrdersPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/work-orders/new"
        element={
          <ProtectedRoute>
            <CreateOrderPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/work-orders/:id"
        element={
          <ProtectedRoute>
            <WorkOrderDetailPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/clients"
        element={
          <ProtectedRoute>
            <ClientsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/bikes"
        element={
          <ProtectedRoute>
            <BikesPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/users"
        element={
          <AdminRoute>
            <UsersPage />
          </AdminRoute>
        }
      />

      <Route path="/" element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />} />
      <Route path="*" element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />} />
    </Routes>
  );
}
