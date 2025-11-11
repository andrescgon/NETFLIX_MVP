import { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';

const AdminContext = createContext(null);

export const AdminProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [adminData, setAdminData] = useState(null);

  useEffect(() => {
    const checkAdminStatus = () => {
      if (!isAuthenticated) {
        setIsAdmin(false);
        setAdminData(null);
        setLoading(false);
        return;
      }

      // Obtener datos del usuario desde localStorage o API
      // Por ahora usaremos localStorage para verificar is_staff
      const userData = localStorage.getItem('user_data');

      if (userData) {
        try {
          const user = JSON.parse(userData);
          setIsAdmin(user.is_staff === true);
          setAdminData(user);
        } catch (error) {
          console.error('Error al parsear datos de usuario:', error);
          setIsAdmin(false);
          setAdminData(null);
        }
      } else {
        setIsAdmin(false);
        setAdminData(null);
      }

      setLoading(false);
    };

    checkAdminStatus();
  }, [isAuthenticated]);

  const updateAdminData = (data) => {
    setAdminData(data);
    setIsAdmin(data?.is_staff === true);
    localStorage.setItem('user_data', JSON.stringify(data));
  };

  const clearAdminData = () => {
    setIsAdmin(false);
    setAdminData(null);
    localStorage.removeItem('user_data');
  };

  const value = {
    isAdmin,
    loading,
    adminData,
    updateAdminData,
    clearAdminData,
  };

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin debe ser usado dentro de un AdminProvider');
  }
  return context;
};
