import { useNavigate } from 'react-router-dom';
import { useProfile } from '../context/ProfileContext';
import { useToast } from '../context/ToastContext';
import ProfilesSkeleton from '../components/ProfilesSkeleton';
import './ProfileSelection.css';

const ProfileSelection = () => {
  const { profiles, selectProfile, loading } = useProfile();
  const navigate = useNavigate();
  const toast = useToast();

  const handleSelectProfile = async (profileId) => {
    console.log('Seleccionando perfil:', profileId);
    try {
      const result = await selectProfile(profileId);
      console.log('Resultado:', result);
      if (result.success) {
        console.log('Navegando a /home');
        navigate('/home');
      } else {
        console.error('Error al seleccionar perfil:', result.error);
        toast.error('Error al seleccionar perfil');
      }
    } catch (error) {
      console.error('Error inesperado:', error);
      toast.error('Error inesperado: ' + error.message);
    }
  };

  const handleManageProfiles = () => {
    navigate('/profiles/manage');
  };

  if (loading) {
    return <ProfilesSkeleton />;
  }

  return (
    <div className="profile-selection-container">
      <div className="profile-selection-content">
        <h1>¿Quién está viendo?</h1>

        <div className="profiles-grid" style={{ display: 'flex', justifyContent: 'center' }}>
          {profiles.map((profile) => (
            <div
              key={profile.id_perfil}
              className="profile-card"
              onClick={() => handleSelectProfile(profile.id_perfil)}
            >
              <div className="profile-avatar">
                <div className="profile-icon">{profile.nombre.charAt(0).toUpperCase()}</div>
              </div>
              <div className="profile-name">{profile.nombre}</div>
            </div>
          ))}
        </div>

        <button className="btn-manage-profiles" onClick={handleManageProfiles}>
          Administrar perfiles
        </button>
      </div>
    </div>
  );
};

export default ProfileSelection;