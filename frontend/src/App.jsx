import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import Landing from './pages/Landing';

// Employee pages
import EmployeeLayout from './pages/employee/EmployeeLayout';
import EmployeeDashboard from './pages/employee/EmployeeDashboard';
import EmployeeTasks from './pages/employee/EmployeeTasks';
import EmployeeMeetings from './pages/employee/EmployeeMeetings';
import EmployeeNotifications from './pages/employee/EmployeeNotifications';
import EmployeeProfile from './pages/employee/EmployeeProfile';
import EmployeeInventory from './pages/employee/EmployeeInventory';

// HR pages
import HRLayout from './pages/hr/HRLayout';
import HRDashboard from './pages/hr/HRDashboard';
import HREmployees from './pages/hr/HREmployees';
import HRTasks from './pages/hr/HRTasks';
import HRMeetings from './pages/hr/HRMeetings';
import HRAnalytics from './pages/hr/HRAnalytics';
import HRAnnouncements from './pages/hr/HRAnnouncements';
import HRInventory from './pages/hr/HRInventory';

const ProtectedRoute = ({ children, role }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) {
    return <Navigate to={user.role === 'hr' ? '/hr' : '/employee'} replace />;
  }
  return children;
};

const AppRoutes = () => {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={!user ? <Login /> : <Navigate to={user.role === 'hr' ? '/hr' : '/employee'} />} />
      <Route path="/signup" element={!user ? <Signup /> : <Navigate to={user.role === 'hr' ? '/hr' : '/employee'} />} />

      {/* Employee Routes */}
      <Route path="/employee" element={<ProtectedRoute role="employee"><EmployeeLayout /></ProtectedRoute>}>
        <Route index element={<EmployeeDashboard />} />
        <Route path="tasks" element={<EmployeeTasks />} />
        <Route path="meetings" element={<EmployeeMeetings />} />
        <Route path="notifications" element={<EmployeeNotifications />} />
        <Route path="inventory" element={<EmployeeInventory />} />
        <Route path="profile" element={<EmployeeProfile />} />
      </Route>

      {/* HR Routes */}
      <Route path="/hr" element={<ProtectedRoute role="hr"><HRLayout /></ProtectedRoute>}>
        <Route index element={<HRDashboard />} />
        <Route path="employees" element={<HREmployees />} />
        <Route path="tasks" element={<HRTasks />} />
        <Route path="meetings" element={<HRMeetings />} />
        <Route path="analytics" element={<HRAnalytics />} />
        <Route path="announcements" element={<HRAnnouncements />} />
        <Route path="inventory" element={<HRInventory />} />
      </Route>

      <Route path="/" element={<Navigate to={user ? (user.role === 'hr' ? '/hr' : '/employee') : '/login'} />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        <AppRoutes />
      </ThemeProvider>
    </AuthProvider>
  );
}
