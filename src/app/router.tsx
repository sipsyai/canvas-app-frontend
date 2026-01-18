import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from '@/features/auth/pages/HomePage';

function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRouter;
