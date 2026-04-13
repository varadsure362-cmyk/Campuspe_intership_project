import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function PublicRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (user) {
    return <Navigate to="/dashboard" />;
  }

  return children;
}

export default PublicRoute;
