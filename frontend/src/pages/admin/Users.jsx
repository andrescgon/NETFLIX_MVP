import { useState, useEffect } from 'react';
import { getUsers, updateUser, deleteUser } from '../../services/admin';
import { useToast } from '../../context/ToastContext';
import './Catalog.css'; // Reutilizamos los estilos base
import './Users.css'; // Estilos adicionales para usuarios

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    is_active: true,
    is_staff: false,
    is_superuser: false
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const result = await getUsers();
      if (result.success) {
        setUsers(result.data);
      } else {
        showToast('Error al cargar usuarios', 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      showToast('Error al cargar usuarios', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        is_active: user.is_active,
        is_staff: user.is_staff,
        is_superuser: user.is_superuser
      });
    } else {
      setEditingUser(null);
      setFormData({
        name: '',
        email: '',
        is_active: true,
        is_staff: false,
        is_superuser: false
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      is_active: true,
      is_staff: false,
      is_superuser: false
    });
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim()) {
      showToast('Nombre y email son obligatorios', 'error');
      return;
    }

    try {
      if (editingUser) {
        // Solo actualizar campos editables (no email)
        const updateData = {
          name: formData.name,
          is_active: formData.is_active,
          is_staff: formData.is_staff,
          is_superuser: formData.is_superuser
        };

        const result = await updateUser(editingUser.id_usuario, updateData);

        if (result.success) {
          // Actualización optimista
          setUsers(prev => prev.map(user =>
            user.id_usuario === result.data.id_usuario ? result.data : user
          ));
          handleCloseModal();
          showToast('Usuario actualizado correctamente', 'success');

          // Sincronizar en segundo plano
          loadUsers();
        } else {
          const errorMsg = result.error?.detail || result.error?.error || 'Error al actualizar usuario';
          showToast(errorMsg, 'error');
        }
      }
    } catch (error) {
      console.error('Error:', error);
      showToast('Error al procesar solicitud', 'error');
    }
  };

  const handleDelete = async (userId, userName) => {
    setDeleteConfirm(null);

    try {
      const result = await deleteUser(userId);
      if (result.success) {
        // Actualización optimista
        setUsers(prev => prev.filter(user => user.id_usuario !== userId));
        showToast(`Usuario "${userName}" eliminado correctamente`, 'success');

        // Sincronizar en segundo plano
        loadUsers();
      } else {
        const errorMsg = result.error?.detail || result.error || 'Error al eliminar usuario';
        showToast(errorMsg, 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      showToast('Error al eliminar usuario', 'error');
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="actors-loading">
        <div className="spinner"></div>
        <p>Cargando usuarios...</p>
      </div>
    );
  }

  return (
    <div className="actors-page">
      <div className="actors-header">
        <h1>Gestión de Usuarios</h1>
        <p>Administra los usuarios de la plataforma</p>
      </div>

      <div className="actors-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="Buscar por nombre o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {filteredUsers.length === 0 ? (
        <div className="no-actors">
          <p>{searchTerm ? 'No se encontraron usuarios' : 'No hay usuarios registrados'}</p>
        </div>
      ) : (
        <div className="actors-table-container">
          <table className="actors-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Email</th>
                <th>Estado</th>
                <th>Suscripción</th>
                <th>Roles</th>
                <th>Registro</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id_usuario}>
                  <td>{user.id_usuario}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`status-badge ${user.is_active ? 'active' : 'inactive'}`}>
                      {user.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td>
                    {user.suscripcion_activa ? (
                      <span className="subscription-badge active">
                        {user.suscripcion_activa.plan}
                      </span>
                    ) : (
                      <span className="subscription-badge inactive">Sin suscripción</span>
                    )}
                  </td>
                  <td>
                    <div className="roles-badges">
                      {user.is_superuser && <span className="role-badge superuser">Superusuario</span>}
                      {user.is_staff && <span className="role-badge staff">Staff</span>}
                      {!user.is_staff && !user.is_superuser && <span className="role-badge user">Usuario</span>}
                    </div>
                  </td>
                  <td>{new Date(user.fecha_registro).toLocaleDateString('es-ES')}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-edit"
                        onClick={() => handleOpenModal(user)}
                        title="Editar"
                      >
                        ✏️
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => setDeleteConfirm(user)}
                        title="Eliminar"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de edición */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Nombre *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  required
                  className="form-input"
                  placeholder="Nombre del usuario"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleFormChange}
                  required
                  className="form-input"
                  placeholder="correo@ejemplo.com"
                  disabled={!!editingUser}
                  title={editingUser ? 'No se puede cambiar el email' : ''}
                />
                {editingUser && (
                  <small style={{ color: '#999', fontSize: '0.85rem' }}>
                    El email no se puede modificar
                  </small>
                )}
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleFormChange}
                  />
                  <span>Usuario activo</span>
                </label>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="is_staff"
                    checked={formData.is_staff}
                    onChange={handleFormChange}
                  />
                  <span>Acceso al panel de administración (Staff)</span>
                </label>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="is_superuser"
                    checked={formData.is_superuser}
                    onChange={handleFormChange}
                  />
                  <span>Superusuario (permisos completos)</span>
                </label>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={handleCloseModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn-submit">
                  {editingUser ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>¿Eliminar Usuario?</h2>
            <p>
              ¿Estás seguro de que deseas eliminar al usuario <strong>{deleteConfirm.name}</strong>?
            </p>
            <p className="warning-text">
              Esta acción no se puede deshacer y se eliminarán todos los datos asociados.
            </p>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setDeleteConfirm(null)}>
                Cancelar
              </button>
              <button
                className="btn-confirm-delete"
                onClick={() => handleDelete(deleteConfirm.id_usuario, deleteConfirm.name)}
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
