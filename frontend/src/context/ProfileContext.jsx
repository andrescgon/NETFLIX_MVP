import { createContext, useState, useContext, useEffect } from 'react';
import { profileService } from '../services/profiles';
import { useAuth } from './AuthContext';

const ProfileContext = createContext(null);

export const ProfileProvider = ({ children }) => {
  const [profiles, setProfiles] = useState([]);
  const [activeProfile, setActiveProfile] = useState(() => {
    // Recuperar perfil activo del localStorage al iniciar
    const savedProfile = localStorage.getItem('activeProfile');
    return savedProfile ? JSON.parse(savedProfile) : null;
  });
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  // Cargar perfiles cuando el usuario esté autenticado
  useEffect(() => {
    if (isAuthenticated) {
      loadProfiles();
    } else {
      setProfiles([]);
      setActiveProfile(null);
      localStorage.removeItem('activeProfile');
      setLoading(false);
    }
  }, [isAuthenticated]);

  const loadProfiles = async () => {
    try {
      setLoading(true);
      const data = await profileService.getProfiles();
      setProfiles(data);

      // Si hay perfiles, verificar si hay uno activo
      if (data.length > 0) {
        try {
          const activeData = await profileService.getActiveProfile();
          if (activeData.perfil_activo) {
            const active = data.find(p => p.id_perfil === activeData.perfil_activo);
            setActiveProfile(active || null);
            if (active) {
              localStorage.setItem('activeProfile', JSON.stringify(active));
            }
          }
        } catch (error) {
          console.log('No hay perfil activo');
        }
      }
    } catch (error) {
      console.error('Error cargando perfiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectProfile = async (profileId) => {
    try {
      console.log('ProfileContext: Activando perfil', profileId);
      const response = await profileService.activateProfile(profileId);
      console.log('ProfileContext: Respuesta de activación', response);
      const profile = profiles.find(p => p.id_perfil === profileId);
      console.log('ProfileContext: Perfil encontrado', profile);
      setActiveProfile(profile);
      // Guardar en localStorage para persistencia
      localStorage.setItem('activeProfile', JSON.stringify(profile));
      return { success: true };
    } catch (error) {
      console.error('ProfileContext: Error al activar perfil', error);
      console.error('ProfileContext: Error response', error.response);
      return {
        success: false,
        error: error.response?.data || error.message || 'Error al seleccionar perfil',
      };
    }
  };

  const createProfile = async (profileData) => {
    try {
      const newProfile = await profileService.createProfile(profileData);
      setProfiles([...profiles, newProfile]);
      return { success: true, profile: newProfile };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || 'Error al crear perfil',
      };
    }
  };

  const updateProfile = async (profileId, profileData) => {
    try {
      const updatedProfile = await profileService.updateProfile(profileId, profileData);
      setProfiles(profiles.map(p => p.id_perfil === profileId ? updatedProfile : p));
      if (activeProfile?.id_perfil === profileId) {
        setActiveProfile(updatedProfile);
      }
      return { success: true, profile: updatedProfile };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || 'Error al actualizar perfil',
      };
    }
  };

  const deleteProfile = async (profileId) => {
    try {
      await profileService.deleteProfile(profileId);
      setProfiles(profiles.filter(p => p.id_perfil !== profileId));
      if (activeProfile?.id_perfil === profileId) {
        setActiveProfile(null);
        localStorage.removeItem('activeProfile');
      }
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || 'Error al eliminar perfil',
      };
    }
  };

  const switchProfile = async () => {
    try {
      await profileService.deactivateProfile();
      setActiveProfile(null);
      localStorage.removeItem('activeProfile');
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: 'Error al cambiar perfil',
      };
    }
  };

  const value = {
    profiles,
    activeProfile,
    loading,
    loadProfiles,
    selectProfile,
    createProfile,
    updateProfile,
    deleteProfile,
    switchProfile,
  };

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile debe ser usado dentro de un ProfileProvider');
  }
  return context;
};