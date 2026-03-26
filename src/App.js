import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Auth pages
import Login from './pages/api/auth/Login';
import Register from './pages/api/auth/Register';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageServices from './pages/admin/ManageServices';
import ManageBarbers from './pages/admin/ManageBarbers';
import ManageAppointments from './pages/admin/ManageAppointments';
import ManageCustomers from './pages/admin/ManageCustomers';
import RevenueReports from './pages/admin/RevenueReports';

// Customer pages
import CustomerDashboard from './pages/customer/CustomerDashboard';
import BookAppointment from './pages/customer/BookAppointment';
import MyAppointments from './pages/customer/MyAppointments';

// Barber pages
import BarberDashboard from './pages/barber/BarberDashboard';

const PrivateRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/unauthorized" />;
  return children;
};

const RoleRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (user.role === 'ADMIN') return <Navigate to="/admin/dashboard" />;
  if (user.role === 'BARBER') return <Navigate to="/barber/dashboard" />;
  return <Navigate to="/customer/dashboard" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<RoleRedirect />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={
            <PrivateRoute allowedRoles={['ADMIN']}>
              <AdminDashboard />
            </PrivateRoute>
          } />
          <Route path="/admin/services" element={
            <PrivateRoute allowedRoles={['ADMIN']}>
              <ManageServices />
            </PrivateRoute>
          } />
          <Route path="/admin/barbers" element={
            <PrivateRoute allowedRoles={['ADMIN']}>
              <ManageBarbers />
            </PrivateRoute>
          } />
          <Route path="/admin/appointments" element={
            <PrivateRoute allowedRoles={['ADMIN']}>
              <ManageAppointments />
            </PrivateRoute>
          } />
          <Route path="/admin/customers" element={
            <PrivateRoute allowedRoles={['ADMIN']}>
              <ManageCustomers />
            </PrivateRoute>
          } />
          <Route path="/admin/reports" element={
            <PrivateRoute allowedRoles={['ADMIN']}>
              <RevenueReports />
            </PrivateRoute>
          } />

          {/* Customer Routes */}
          <Route path="/customer/dashboard" element={
            <PrivateRoute allowedRoles={['CUSTOMER']}>
              <CustomerDashboard />
            </PrivateRoute>
          } />
          <Route path="/customer/book" element={
            <PrivateRoute allowedRoles={['CUSTOMER']}>
              <BookAppointment />
            </PrivateRoute>
          } />
          <Route path="/customer/appointments" element={
            <PrivateRoute allowedRoles={['CUSTOMER']}>
              <MyAppointments />
            </PrivateRoute>
          } />

          {/* Barber Routes */}
          <Route path="/barber/dashboard" element={
            <PrivateRoute allowedRoles={['BARBER']}>
              <BarberDashboard />
            </PrivateRoute>
          } />

          <Route path="/unauthorized" element={<div style={{textAlign:'center',padding:'50px'}}>Unauthorized Access</div>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
