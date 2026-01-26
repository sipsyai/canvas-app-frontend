import { Routes, Route, Navigate } from 'react-router-dom';
import { PrivateRoute } from '@/features/auth/components/PrivateRoute';
import { AppLayout } from '@/components/layout/AppLayout';
import HomePage from '@/features/auth/pages/HomePage';
import LoginPage from '@/features/auth/pages/LoginPage';
import { RegisterPage } from '@/features/auth/pages/RegisterPage';
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage';
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
import { ApplicationLayout } from '@/features/applications/components/ApplicationLayout';
import { ApplicationHomePage } from '@/features/applications/pages/ApplicationHomePage';
import { ApplicationObjectPage } from '@/features/applications/pages/ApplicationObjectPage';
import { AppsHomePage } from '@/features/apps/pages/AppsHomePage';

function AppRouter() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected Routes with AppLayout */}
      <Route element={<PrivateRoute />}>
        {/* Development Mode Routes */}
        <Route
          path="/dashboard"
          element={
            <AppLayout>
              <DashboardPage />
            </AppLayout>
          }
        />
        <Route
          path="/fields"
          element={
            <AppLayout>
              <FieldsListPage />
            </AppLayout>
          }
        />
        <Route
          path="/objects"
          element={
            <AppLayout>
              <ObjectsListPage />
            </AppLayout>
          }
        />
        <Route
          path="/objects/create"
          element={
            <AppLayout>
              <CreateObjectPage />
            </AppLayout>
          }
        />
        <Route
          path="/objects/:objectId/edit"
          element={
            <AppLayout>
              <EditObjectPage />
            </AppLayout>
          }
        />
        <Route
          path="/objects/:objectId/fields"
          element={
            <AppLayout>
              <ObjectFieldsManagePage />
            </AppLayout>
          }
        />
        <Route
          path="/objects/:objectId/records"
          element={
            <AppLayout>
              <RecordsTablePage />
            </AppLayout>
          }
        />
        <Route
          path="/objects/:objectId/relationships"
          element={
            <AppLayout>
              <RelationshipsManagePage />
            </AppLayout>
          }
        />
        <Route
          path="/objects/:objectId/records/:recordId"
          element={
            <AppLayout>
              <RecordDetailPage />
            </AppLayout>
          }
        />
        <Route
          path="/applications"
          element={
            <AppLayout>
              <ApplicationsListPage />
            </AppLayout>
          }
        />
        <Route
          path="/applications/create"
          element={
            <AppLayout>
              <CreateApplicationPage />
            </AppLayout>
          }
        />
        <Route
          path="/applications/:appId/edit"
          element={
            <AppLayout>
              <EditApplicationPage />
            </AppLayout>
          }
        />
        <Route
          path="/applications/:appId/details"
          element={
            <AppLayout>
              <ApplicationDetailPage />
            </AppLayout>
          }
        />

        {/* Application Runtime Routes (Development mode - /applications/:appId) */}
        <Route path="/applications/:appId" element={<ApplicationLayout />}>
          <Route index element={<ApplicationHomePage />} />
          <Route path=":objectId" element={<ApplicationObjectPage />} />
        </Route>

        {/* Applications Mode Routes (/apps) */}
        <Route
          path="/apps"
          element={
            <AppLayout>
              <AppsHomePage />
            </AppLayout>
          }
        />

        {/* Applications Mode Runtime Routes (/apps/:appId) */}
        <Route path="/apps/:appId" element={<ApplicationLayout basePath="/apps" />}>
          <Route index element={<ApplicationHomePage />} />
          <Route path=":objectId" element={<ApplicationObjectPage />} />
        </Route>
      </Route>

      {/* 404 - Redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRouter;
