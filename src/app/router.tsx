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
import { RecordsTablePage } from '@/features/records/pages/RecordsTablePage';
import { RelationshipsManagePage } from '@/features/relationships/pages/RelationshipsManagePage';
import { RecordDetailPage } from '@/features/relationships/pages/RecordDetailPage';
import { ApplicationsListPage } from '@/features/applications/pages/ApplicationsListPage';
import { CreateApplicationPage } from '@/features/applications/pages/CreateApplicationPage';
import { ApplicationDetailPage } from '@/features/applications/pages/ApplicationDetailPage';
import { EditApplicationPage } from '@/features/applications/pages/EditApplicationPage';

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
        <Route path="/objects/:objectId/records" element={<RecordsTablePage />} />
        <Route path="/objects/:objectId/relationships" element={<RelationshipsManagePage />} />
        <Route path="/objects/:objectId/records/:recordId" element={<RecordDetailPage />} />
        <Route path="/applications" element={<ApplicationsListPage />} />
        <Route path="/applications/create" element={<CreateApplicationPage />} />
        <Route path="/applications/:appId" element={<ApplicationDetailPage />} />
        <Route path="/applications/:appId/edit" element={<EditApplicationPage />} />
      </Route>

      {/* 404 - Redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRouter;
