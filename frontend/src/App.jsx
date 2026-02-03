import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';
import { useAuth } from './AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import CatalogPage from './pages/CatalogPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import CreateProjectPage from './pages/CreateProjectPage';
import MyApplicationsPage from './pages/MyApplicationsPage';
import MentorDashboard from './pages/MentorDashboard';
import MentorProjectApplications from './pages/MentorProjectApplications';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminProjectsPage from './pages/AdminProjectsPage';
import AdminAllowListPage from './pages/AdminAllowListPage';

export default function App() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<CatalogPage />} />
        <Route path="projects/:id" element={<ProjectDetailPage />} />
        <Route path="my-applications" element={<ProtectedRoute roles={['STUDENT']}><MyApplicationsPage /></ProtectedRoute>} />
        <Route path="mentor" element={<ProtectedRoute roles={['MENTOR', 'ADMIN']}><MentorDashboard /></ProtectedRoute>} />
        <Route path="mentor/new" element={<ProtectedRoute roles={['MENTOR', 'ADMIN']}><CreateProjectPage /></ProtectedRoute>} />
        <Route path="mentor/edit/:id" element={<ProtectedRoute roles={['MENTOR', 'ADMIN']}><CreateProjectPage /></ProtectedRoute>} />
        <Route path="mentor/projects/:id/applications" element={<ProtectedRoute roles={['MENTOR', 'ADMIN']}><MentorProjectApplications /></ProtectedRoute>} />
        <Route path="admin/users" element={<ProtectedRoute roles={['ADMIN']}><AdminUsersPage /></ProtectedRoute>} />
        <Route path="admin/projects" element={<ProtectedRoute roles={['ADMIN']}><AdminProjectsPage /></ProtectedRoute>} />
        <Route path="admin/allow-list" element={<ProtectedRoute roles={['ADMIN']}><AdminAllowListPage /></ProtectedRoute>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
