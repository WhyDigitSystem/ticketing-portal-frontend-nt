// src/routes/index.js
import { useRoutes, Navigate } from 'react-router-dom';
import AuthRoutes from './AuthRoutes';
import MainRoutes from './MainRoutes';

export default function AppRoutes() {
  return useRoutes([
    {
      path: '/',
      element: <Navigate to="/login" replace />
    },
    AuthRoutes,
    MainRoutes,
  ]);
}