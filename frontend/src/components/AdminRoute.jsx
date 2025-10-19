import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAdmin } from '../context/AdminContext';

const AdminRoute = ({ children }) => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();

  if (authLoading || adminLoading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          background: '#000',
          color: '#fff',
          fontSize: '1.5rem',
        }}
      >
        Cargando...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          background: '#000',
          color: '#fff',
          textAlign: 'center',
          padding: '20px',
        }}
      >
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem', color: '#e50914' }}>
          Acceso Denegado
        </h1>
        <p style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>
          No tienes permisos de administrador para acceder a esta sección.
        </p>
        <button
          onClick={() => (window.location.href = '/home')}
          style={{
            background: '#e50914',
            color: '#fff',
            border: 'none',
            padding: '12px 30px',
            fontSize: '1rem',
            borderRadius: '4px',
            cursor: 'pointer',
            transition: 'background 0.3s',
          }}
          onMouseOver={(e) => (e.target.style.background = '#f40612')}
          onMouseOut={(e) => (e.target.style.background = '#e50914')}
        >
          Volver al Inicio
        </button>
      </div>
    );
  }

  return children;
};

export default AdminRoute;
