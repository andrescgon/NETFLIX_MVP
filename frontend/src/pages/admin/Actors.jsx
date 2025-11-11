import { useState, useEffect } from 'react';
import { getActors, createActor, updateActor, deleteActor } from '../../services/admin';
import { useToast } from '../../context/ToastContext';
import './Catalog.css';

const Actors = () => {
  const [actors, setActors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [editingActor, setEditingActor] = useState(null);
  const [formData, setFormData] = useState({
    nombre: ''
  });

  useEffect(() => {
    loadActors();
  }, []);

  const loadActors = async () => {
    setLoading(true);
    try {
      const result = await getActors();
      if (result.success) {
        setActors(result.data);
      } else {
        showToast('Error al cargar actores', 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      showToast('Error al conectar con el servidor', 'error');
    } finally {
      setLoading(false);
    }
  };

  const { showToast } = useToast();

  const handleOpenModal = (actor = null) => {
    if (actor) {
      setEditingActor(actor);
      setFormData({
        nombre: actor.nombre || ''
      });
    } else {
      setEditingActor(null);
      setFormData({
        nombre: ''
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingActor(null);
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
      if (editingActor) {
        result = await updateActor(editingActor.id_actor, formData);
      } else {
        result = await createActor(formData);
      }

      if (result.success) {
        // Actualización optimista: agregar el nuevo actor al estado inmediatamente
        if (!editingActor && result.data) {
          setActors(prev => [...prev, result.data]);
        } else if (editingActor && result.data) {
          setActors(prev => prev.map(actor =>
            actor.id_actor === result.data.id_actor ? result.data : actor
          ));
        }

        // Cerrar el modal inmediatamente
        handleCloseModal();

        // Mostrar toast de éxito
        showToast(
          editingActor ? 'Actor actualizado correctamente' : 'Actor creado correctamente',
          'success'
        );

        // Recargar actores en segundo plano para sincronizar con el servidor
        loadActors();
      } else {
        const errorMsg = result.error?.detail || result.error || 'Error al guardar actor';
        showToast(errorMsg, 'error');
        setSubmitting(false);
      }
    } catch (error) {
      console.error('Error:', error);
      showToast('Error al guardar actor', 'error');
      setSubmitting(false);
    }
  };

  const handleDelete = async (actorId) => {
    const actorName = deleteConfirm.nombre;
    setDeleteConfirm(null);

    try {
      const result = await deleteActor(actorId);
      if (result.success) {
        // Actualización optimista: eliminar el actor del estado inmediatamente
        setActors(prev => prev.filter(actor => actor.id_actor !== actorId));

        // Mostrar toast de éxito
        showToast(`"${actorName}" eliminado correctamente`, 'success');

        // Sincronizar con el servidor en segundo plano
        loadActors();
      } else {
        const errorMsg = result.error?.detail || result.error || 'Error al eliminar';
        showToast(errorMsg, 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      showToast('Error al eliminar actor', 'error');
    }
  };

  const filteredActors = actors.filter((actor) =>
    actor.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="catalog-loading">
        <div className="spinner"></div>
        <p>Cargando actores...</p>
      </div>
    );
  }

  return (
    <div className="catalog-page">
      <div className="catalog-header">
        <div className="catalog-header-left">
          <h1>Gestión de Actores</h1>
          <p>Administra el catálogo de actores de la plataforma</p>
        </div>
        <button className="btn-add" onClick={() => handleOpenModal()}>
          <span className="btn-icon">➕</span>
          Agregar Actor
        </button>
      </div>

      <div className="catalog-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="Buscar actor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>
        <div className="catalog-count">
          Mostrando {filteredActors.length} de {actors.length} actores
        </div>
      </div>

      {filteredActors.length === 0 ? (
        <div className="no-items">
          <p>No se encontraron actores</p>
          <button className="btn-add-first" onClick={() => handleOpenModal()}>
            Agregar Primer Actor
          </button>
        </div>
      ) : (
        <div className="catalog-grid">
          {filteredActors.map((actor) => (
            <div key={actor.id_actor} className="catalog-card">
              <div className="catalog-card-header">
                <h3>{actor.nombre}</h3>
                <div className="card-actions">
                  <button
                    className="btn-action btn-edit"
                    onClick={() => handleOpenModal(actor)}
                    title="Editar"
                  >
                    ✏️
                  </button>
                  <button
                    className="btn-action btn-delete"
                    onClick={() => setDeleteConfirm(actor)}
                    title="Eliminar"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              <div className="catalog-card-body">
                <p className="card-info">Actor registrado en el sistema</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de formulario */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content modal-form" onClick={(e) => e.stopPropagation()}>
            <h2>{editingActor ? 'Editar Actor' : 'Nuevo Actor'}</h2>
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
                  placeholder="Ingrese el nombre del actor"
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={handleCloseModal} disabled={submitting}>
                  Cancelar
                </button>
                <button type="submit" className="btn-submit" disabled={submitting}>
                  {submitting ? 'Guardando...' : (editingActor ? 'Actualizar' : 'Crear')} {submitting ? '' : 'Actor'}
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
            <h2>¿Eliminar Actor?</h2>
            <p>
              ¿Estás seguro de que deseas eliminar a "<strong>{deleteConfirm.nombre}</strong>"?
            </p>
            <p className="warning-text">Esta acción no se puede deshacer.</p>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setDeleteConfirm(null)}>
                Cancelar
              </button>
              <button className="btn-confirm-delete" onClick={() => handleDelete(deleteConfirm.id_actor)}>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Actors;
