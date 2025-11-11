import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAdmin } from '../context/AdminContext';
import './AdminLayout.css';
import '../styles/admin-spacing.css';

const AdminLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const { adminData } = useAdmin();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const navigateTo = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const menuItems = [
    { path: '/admin', label: 'Dashboard', icon: '📊' },
    { path: '/admin/movies', label: 'Películas', icon: '🎬' },
    { path: '/admin/actors', label: 'Actores', icon: '🎭' },
    { path: '/admin/directors', label: 'Directores', icon: '🎥' },
    { path: '/admin/genres', label: 'Géneros', icon: '🎪' },
    { path: '/admin/users', label: 'Usuarios', icon: '👥' },
    { path: '/admin/plans', label: 'Planes', icon: '💳' },
    { path: '/admin/subscriptions', label: 'Suscripciones', icon: '📋' },
    { path: '/admin/history', label: 'Historial', icon: '📺' },
    { path: '/admin/payments', label: 'Pagos', icon: '💰' },
  ];

  return (
    <div className="admin-layout">
      {/* Top Navbar */}
      <nav className="admin-navbar">
        <div className="admin-navbar-left">
          <button className="sidebar-toggle" onClick={toggleSidebar}>
            ☰
          </button>
          <button className="mobile-menu-toggle" onClick={toggleMobileMenu}>
            ☰
          </button>
          <div className="admin-brand" onClick={() => navigateTo('/admin')}>
            <span className="brand-logo">N</span>
            <span className="brand-text">Netflix Admin</span>
          </div>
        </div>

        <div className="admin-navbar-right">
          <button className="btn-back-home" onClick={() => navigate('/home')}>
            ← Volver al Inicio
          </button>
          <div className="admin-profile">
            <span className="admin-name">{adminData?.name || 'Admin'}</span>
            <button className="btn-admin-logout" onClick={handleLogout}>
              Cerrar Sesión
            </button>
          </div>
        </div>
      </nav>

      <div className="admin-container">
        {/* Sidebar */}
        <aside className={`admin-sidebar ${sidebarOpen ? 'open' : 'closed'} ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          <div className="sidebar-content">
            <nav className="sidebar-nav">
              {menuItems.map((item) => (
                <button
                  key={item.path}
                  className={`sidebar-item ${isActive(item.path) ? 'active' : ''}`}
                  onClick={() => navigateTo(item.path)}
                >
                  <span className="sidebar-icon">{item.icon}</span>
                  <span className="sidebar-label">{item.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Overlay para móvil */}
        {mobileMenuOpen && <div className="sidebar-overlay" onClick={toggleMobileMenu}></div>}

        {/* Main Content */}
        <main className={`admin-main ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
          <div className="admin-content">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
