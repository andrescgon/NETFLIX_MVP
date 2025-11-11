import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '../context/ProfileContext';
import './ManageProfiles.css';

const ManageProfiles = () => {
  const { profiles, createProfile, updateProfile, deleteProfile } = useProfile();
  const [editingProfile, setEditingProfile] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({ nombre: '', edad: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/profiles');
  };

  const handleEdit = (profile) => {
    setEditingProfile(profile.id_perfil);
    setFormData({ nombre: profile.nombre, edad: profile.edad || '' });
    setError('');
  };

  const handleCancelEdit = () => {
    setEditingProfile(null);
    setFormData({ nombre: '', edad: '' });
    setError('');
  };

  const handleSaveEdit = async () => {
    if (!formData.nombre.trim()) {
      setError('El nombre es requerido');
      return;
    }

    const result = await updateProfile(editingProfile, {
      nombre: formData.nombre.trim(),
      edad: formData.edad ? parseInt(formData.edad) : null,
    });

    if (result.success) {
      setEditingProfile(null);
      setFormData({ nombre: '', edad: '' });
      setError('');
    } else {
      setError(typeof result.error === 'object' ? JSON.stringify(result.error) : result.error);
    }
  };

  const handleDelete = async (profileId) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este perfil?')) {
      const result = await deleteProfile(profileId);
      if (!result.success) {
        alert(typeof result.error === 'object' ? JSON.stringify(result.error) : result.error);
      }
    }
  };

  const handleCreateProfile = () => {
    if (profiles.length >= 3) {
      alert('Solo puedes tener hasta 3 perfiles');
      return;
    }
    setShowCreateForm(true);
    setFormData({ nombre: '', edad: '' });
    setError('');
  };

  const handleCancelCreate = () => {
    setShowCreateForm(false);
    setFormData({ nombre: '', edad: '' });
    setError('');
  };

  const handleSaveCreate = async () => {
    if (!formData.nombre.trim()) {
      setError('El nombre es requerido');
      return;
    }

    const result = await createProfile({
      nombre: formData.nombre.trim(),
      edad: formData.edad ? parseInt(formData.edad) : null,
    });

    if (result.success) {
      setShowCreateForm(false);
      setFormData({ nombre: '', edad: '' });
      setError('');
    } else {
      setError(typeof result.error === 'object' ? JSON.stringify(result.error) : result.error);
    }
  };

  return (
    <div className="manage-profiles-container">
      <div className="manage-profiles-content">
        <h1>Administrar perfiles</h1>

        {error && <div className="error-message">{error}</div>}

        <div className="profiles-grid" style={{ display: 'flex', justifyContent: 'center' }}>
          {profiles.map((profile) => (
            <div key={profile.id_perfil} className="manage-profile-card">
              {editingProfile === profile.id_perfil ? (
                <div className="edit-form">
                  <input
                    type="text"
                    placeholder="Nombre"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className="profile-input"
                  />
                  <input
                    type="number"
                    placeholder="Edad (opcional)"
                    value={formData.edad}
                    onChange={(e) => setFormData({ ...formData, edad: e.target.value })}
                    className="profile-input"
                  />
                  <div className="edit-actions">
                    <button onClick={handleSaveEdit} className="btn-save">
                      Guardar
                    </button>
                    <button onClick={handleCancelEdit} className="btn-cancel">
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="profile-avatar">
                    <div className="profile-icon">{profile.nombre.charAt(0).toUpperCase()}</div>
                  </div>
                  <div className="profile-info">
                    <div className="profile-name">{profile.nombre}</div>
                    {profile.edad && <div className="profile-age">Edad: {profile.edad}</div>}
                  </div>
                  <div className="profile-actions">
                    <button onClick={() => handleEdit(profile)} className="btn-edit">
                      Editar
                    </button>
                    <button onClick={() => handleDelete(profile.id_perfil)} className="btn-delete">
                      Eliminar
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}

          {showCreateForm ? (
            <div className="manage-profile-card create-card">
              <div className="edit-form">
                <h3>Nuevo Perfil</h3>
                <input
                  type="text"
                  placeholder="Nombre"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="profile-input"
                />
                <input
                  type="number"
                  placeholder="Edad (opcional)"
                  value={formData.edad}
                  onChange={(e) => setFormData({ ...formData, edad: e.target.value })}
                  className="profile-input"
                />
                <div className="edit-actions">
                  <button onClick={handleSaveCreate} className="btn-save">
                    Crear
                  </button>
                  <button onClick={handleCancelCreate} className="btn-cancel">
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          ) : (
            profiles.length < 3 && (
              <div className="manage-profile-card add-card" onClick={handleCreateProfile}>
                <div className="profile-avatar">
                  <div className="profile-icon add-icon">+</div>
                </div>
                <div className="profile-name">Agregar Perfil</div>
              </div>
            )
          )}
        </div>

        <button className="btn-done" onClick={handleBack}>
          Listo
        </button>
      </div>
    </div>
  );
};

export default ManageProfiles;