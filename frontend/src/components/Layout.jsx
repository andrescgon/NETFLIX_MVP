import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../context/ProfileContext';
import { useAdmin } from '../context/AdminContext';
import './Layout.css';

const Layout = ({ children }) => {
  const { logout } = useAuth();
  const { activeProfile, switchProfile } = useProfile();
  const { isAdmin } = useAdmin();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSwitchProfile = async () => {
    await switchProfile();
    navigate('/profiles');
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleNavigation = (path) => {
    navigate(path);
    setMenuOpen(false);
  };

  return (
    <div className="layout">
      <nav className="navbar">
        <div className="navbar-content">
          <div className="navbar-brand" onClick={() => navigate('/home')}>
            Netflix MVP
          </div>

          {/* Hamburger button */}
          <button className={`hamburger ${menuOpen ? 'open' : ''}`} onClick={toggleMenu}>
            <span></span>
            <span></span>
            <span></span>
          </button>

          <div className={`navbar-menu ${menuOpen ? 'open' : ''}`}>
            <button onClick={() => handleNavigation('/home')} className="nav-link">
              Inicio
            </button>
            <button onClick={() => handleNavigation('/history')} className="nav-link">
              Mi Historial
            </button>
            <button onClick={() => handleNavigation('/subscription')} className="nav-link">
              Mi Suscripción
            </button>
            {isAdmin && (
              <button onClick={() => handleNavigation('/admin')} className="nav-link nav-link-admin">
                Panel Admin
              </button>
            )}
          </div>

          <div className={`navbar-actions ${menuOpen ? 'open' : ''}`}>
            {activeProfile && (
              <div className="navbar-profile">
                <span className="profile-indicator">{activeProfile.nombre}</span>
                <button onClick={handleSwitchProfile} className="btn-switch-profile">
                  Cambiar Perfil
                </button>
              </div>
            )}
            <button onClick={handleLogout} className="btn-logout">
              Cerrar Sesión
            </button>
          </div>
        </div>
      </nav>

      {/* Overlay para cerrar menú en móvil */}
      {menuOpen && <div className="menu-overlay" onClick={toggleMenu}></div>}

      <main className="main-content">{children}</main>
    </div>
  );
};

export default Layout;