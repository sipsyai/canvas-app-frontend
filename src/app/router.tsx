import { Routes, Route, Navigate } from 'react-router-dom';
import { PrivateRoute } from '@/features/auth/components/PrivateRoute';
import HomePage from '@/features/auth/pages/HomePage';
import LoginPage from '@/features/auth/pages/LoginPage';
import { RegisterPage } from '@/features/auth/pages/RegisterPage';
import DashboardPage from '@/features/auth/pages/DashboardPage';
import { FieldsListPage } from '@/features/fields/pages/FieldsListPage';
import { ObjectsListPage } from '@/features/objects/pages/ObjectsListPage';
import { CreateObjectPage } from '@/features/objects/pages/CreateObjectPage';
import { EditObjectPage } from '@/features/objects/pages/EditObjectPage';
import { ObjectFieldsManagePage } from '@/features/object-fields/pages/ObjectFieldsManagePage';

function AppRouter() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected Routes */}
      <Route element={<PrivateRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/fields" element={<FieldsListPage />} />
        <Route path="/objects" element={<ObjectsListPage />} />
        <Route path="/objects/create" element={<CreateObjectPage />} />
        <Route path="/objects/:objectId/edit" element={<EditObjectPage />} />
        <Route path="/objects/:objectId/fields" element={<ObjectFieldsManagePage />} />
      </Route>

      {/* 404 - Redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRouter;
