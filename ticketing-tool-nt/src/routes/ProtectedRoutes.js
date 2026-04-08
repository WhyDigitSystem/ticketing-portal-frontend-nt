// src/routes/ProtectedRoutes.js
import { useSelector } from 'react-redux';
import { Navigate, useParams } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles = [], menuAccess = {} }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { menuName } = useParams();

  const role = user?.type?.trim().toLowerCase();

  // not logged in
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // role check
  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // menu-level check (IMPORTANT)
  if (menuName && menuAccess[role]) {
    if (!menuAccess[role].includes(menuName.toLowerCase())) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;