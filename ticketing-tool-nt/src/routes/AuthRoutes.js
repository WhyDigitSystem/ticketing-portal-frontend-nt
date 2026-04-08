// src/routes/AuthRoutes.js
import { lazy } from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import Loadable from '../components/UI/Loadable';

const LoginForm = Loadable(lazy(() => import('../components/Auth/LoginForm')));

const AuthWrapper = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);

  return isAuthenticated 
    ? <Navigate to="/dashboard" replace />
    : <LoginForm />;
};

const AuthRoutes = {
  path: '/',
  children: [
    {
      path: 'login',
      element: <AuthWrapper />
    }
  ]
};

export default AuthRoutes;