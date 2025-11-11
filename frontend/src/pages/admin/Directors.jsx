import { useState, useEffect } from 'react';
import { getDirectors, createDirector, updateDirector, deleteDirector } from '../../services/admin';
import { useToast } from '../../context/ToastContext';
import './Catalog.css';

const Directors = () => {
  const [directors, setDirectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [editingDirector, setEditingDirector] = useState(null);
  const [formData, setFormData] = useState({
    nombre: ''
  });

  useEffect(() => {
    loadDirectors();
  }, []);

  const loadDirectors = async () => {
    setLoading(true);
    try {
      const result = await getDirectors();
      if (result.success) {
        setDirectors(result.data);
      } else {
        showToast('Error al cargar directores', 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      showToast('Error al conectar con el servidor', 'error');
    } finally {
      setLoading(false);
    }
  };

  const { showToast } = useToast();

  const handleOpenModal = (director = null) => {
    if (director) {
      setEditingDirector(director);
      setFormData({
        nombre: director.nombre || ''
      });
    } else {
      setEditingDirector(null);
      setFormData({
        nombre: ''
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingDirector(null);
    setSubmitting(false);
    setFormData({
      nombre: ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      let result;
      if (editingDirector) {
        result = await updateDirector(editingDirector.id_director, formData);
      } else {
        result = await createDirector(formData);
      }

      if (result.success) {
        // Actualización optimista: agregar/actualizar el director al estado inmediatamente
        if (!editingDirector && result.data) {
          setDirectors(prev => [...prev, result.data]);
        } else if (editingDirector && result.data) {
          setDirectors(prev => prev.map(director =>
            director.id_director === result.data.id_director ? result.data : director
          ));
        }

        // Cerrar el modal inmediatamente
        handleCloseModal();

        // Mostrar toast de éxito
        showToast(
          editingDirector ? 'Director actualizado correctamente' : 'Director creado correctamente',
          'success'
        );

        // Recargar directores en segundo plano para sincronizar con el servidor
        loadDirectors();
      } else {
        const errorMsg = result.error?.detail || result.error || 'Error al guardar director';
        showToast(errorMsg, 'error');
        setSubmitting(false);
      }
    } catch (error) {
      console.error('Error:', error);
      showToast('Error al guardar director', 'error');
      setSubmitting(false);
    }
  };

  const handleDelete = async (directorId) => {
    const directorName = deleteConfirm.nombre;
    setDeleteConfirm(null);

    try {
      const result = await deleteDirector(directorId);
      if (result.success) {
        // Actualización optimista: eliminar el director del estado inmediatamente
        setDirectors(prev => prev.filter(director => director.id_director !== directorId));

        // Mostrar toast de éxito
        showToast(`"${directorName}" eliminado correctamente`, 'success');

        // Sincronizar con el servidor en segundo plano
        loadDirectors();
      } else {
        const errorMsg = result.error?.detail || result.error || 'Error al eliminar';
        showToast(errorMsg, 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      showToast('Error al eliminar director', 'error');
    }
  };

  const filteredDirectors = directors.filter((director) =>
    director.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="catalog-loading">
        <div className="spinner"></div>
        <p>Cargando directores...</p>
      </div>
    );
  }

  return (
    <div className="catalog-page">
      <div className="catalog-header">
        <div className="catalog-header-left">
          <h1>Gestión de Directores</h1>
          <p>Administra el catálogo de directores de la plataforma</p>
        </div>
        <button className="btn-add" onClick={() => handleOpenModal()}>
          <span className="btn-icon">➕</span>
          Agregar Director
        </button>
      </div>

      <div className="catalog-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="Buscar director..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>
        <div className="catalog-count">
          Mostrando {filteredDirectors.length} de {directors.length} directores
        </div>
      </div>

      {filteredDirectors.length === 0 ? (
        <div className="no-items">
          <p>No se encontraron directores</p>
          <button className="btn-add-first" onClick={() => handleOpenModal()}>
            Agregar Primer Director
          </button>
        </div>
      ) : (
        <div className="catalog-grid">
          {filteredDirectors.map((director) => (
            <div key={director.id_director} className="catalog-card">
              <div className="catalog-card-header">
                <h3>{director.nombre}</h3>
                <div className="card-actions">
                  <button
                    className="btn-action btn-edit"
                    onClick={() => handleOpenModal(director)}
                    title="Editar"
                  >
                    ✏️
                  </button>
                  <button
                    className="btn-action btn-delete"
                    onClick={() => setDeleteConfirm(director)}
                    title="Eliminar"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              <div className="catalog-card-body">
                <p className="card-info">Director registrado en el sistema</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de formulario */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content modal-form" onClick={(e) => e.stopPropagation()}>
            <h2>{editingDirector ? 'Editar Director' : 'Nuevo Director'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="nombre">Nombre *</label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  required
                  className="form-input"
                  placeholder="Ingrese el nombre del director"
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={handleCloseModal} disabled={submitting}>
                  Cancelar
                </button>
                <button type="submit" className="btn-submit" disabled={submitting}>
                  {submitting ? 'Guardando...' : (editingDirector ? 'Actualizar' : 'Crear')} {submitting ? '' : 'Director'}
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
            <h2>¿Eliminar Director?</h2>
            <p>
              ¿Estás seguro de que deseas eliminar a "<strong>{deleteConfirm.nombre}</strong>"?
            </p>
            <p className="warning-text">Esta acción no se puede deshacer.</p>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setDeleteConfirm(null)}>
                Cancelar
              </button>
              <button className="btn-confirm-delete" onClick={() => handleDelete(deleteConfirm.id_director)}>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Directors;
