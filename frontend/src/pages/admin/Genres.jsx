import { useState, useEffect } from 'react';
import { getGenres, createGenre, updateGenre, deleteGenre } from '../../services/admin';
import { useToast } from '../../context/ToastContext';
import './Catalog.css';

const Genres = () => {
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [editingGenre, setEditingGenre] = useState(null);
  const [formData, setFormData] = useState({
    nombre: ''
  });

  useEffect(() => {
    loadGenres();
  }, []);

  const loadGenres = async () => {
    setLoading(true);
    try {
      const result = await getGenres();
      if (result.success) {
        setGenres(result.data);
      } else {
        showToast('Error al cargar géneros', 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      showToast('Error al conectar con el servidor', 'error');
    } finally {
      setLoading(false);
    }
  };

  const { showToast } = useToast();

  const handleOpenModal = (genre = null) => {
    if (genre) {
      setEditingGenre(genre);
      setFormData({
        nombre: genre.nombre || ''
      });
    } else {
      setEditingGenre(null);
      setFormData({
        nombre: ''
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingGenre(null);
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
      if (editingGenre) {
        result = await updateGenre(editingGenre.id_genero, formData);
      } else {
        result = await createGenre(formData);
      }

      if (result.success) {
        // Actualización optimista: agregar/actualizar el género al estado inmediatamente
        if (!editingGenre && result.data) {
          setGenres(prev => [...prev, result.data]);
        } else if (editingGenre && result.data) {
          setGenres(prev => prev.map(genre =>
            genre.id_genero === result.data.id_genero ? result.data : genre
          ));
        }

        // Cerrar el modal inmediatamente
        handleCloseModal();

        // Mostrar toast de éxito
        showToast(
          editingGenre ? 'Género actualizado correctamente' : 'Género creado correctamente',
          'success'
        );

        // Recargar géneros en segundo plano para sincronizar con el servidor
        loadGenres();
      } else {
        const errorMsg = result.error?.detail || result.error || 'Error al guardar género';
        showToast(errorMsg, 'error');
        setSubmitting(false);
      }
    } catch (error) {
      console.error('Error:', error);
      showToast('Error al guardar género', 'error');
      setSubmitting(false);
    }
  };

  const handleDelete = async (genreId) => {
    const genreName = deleteConfirm.nombre;
    setDeleteConfirm(null);

    try {
      const result = await deleteGenre(genreId);
      if (result.success) {
        // Actualización optimista: eliminar el género del estado inmediatamente
        setGenres(prev => prev.filter(genre => genre.id_genero !== genreId));

        // Mostrar toast de éxito
        showToast(`"${genreName}" eliminado correctamente`, 'success');

        // Sincronizar con el servidor en segundo plano
        loadGenres();
      } else {
        const errorMsg = result.error?.detail || result.error || 'Error al eliminar';
        showToast(errorMsg, 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      showToast('Error al eliminar género', 'error');
    }
  };

  const filteredGenres = genres.filter((genre) =>
    genre.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="catalog-loading">
        <div className="spinner"></div>
        <p>Cargando géneros...</p>
      </div>
    );
  }

  return (
    <div className="catalog-page">
      <div className="catalog-header">
        <div className="catalog-header-left">
          <h1>Gestión de Géneros</h1>
          <p>Administra el catálogo de géneros de la plataforma</p>
        </div>
        <button className="btn-add" onClick={() => handleOpenModal()}>
          <span className="btn-icon">➕</span>
          Agregar Género
        </button>
      </div>

      <div className="catalog-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="Buscar género..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>
        <div className="catalog-count">
          Mostrando {filteredGenres.length} de {genres.length} géneros
        </div>
      </div>

      {filteredGenres.length === 0 ? (
        <div className="no-items">
          <p>No se encontraron géneros</p>
          <button className="btn-add-first" onClick={() => handleOpenModal()}>
            Agregar Primer Género
          </button>
        </div>
      ) : (
        <div className="catalog-grid">
          {filteredGenres.map((genre) => (
            <div key={genre.id_genero} className="catalog-card">
              <div className="catalog-card-header">
                <h3>{genre.nombre}</h3>
                <div className="card-actions">
                  <button
                    className="btn-action btn-edit"
                    onClick={() => handleOpenModal(genre)}
                    title="Editar"
                  >
                    ✏️
                  </button>
                  <button
                    className="btn-action btn-delete"
                    onClick={() => setDeleteConfirm(genre)}
                    title="Eliminar"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              <div className="catalog-card-body">
                <p className="card-info">Género registrado en el sistema</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de formulario */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content modal-form" onClick={(e) => e.stopPropagation()}>
            <h2>{editingGenre ? 'Editar Género' : 'Nuevo Género'}</h2>
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
                  placeholder="Ej: Acción, Drama, Comedia..."
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={handleCloseModal} disabled={submitting}>
                  Cancelar
                </button>
                <button type="submit" className="btn-submit" disabled={submitting}>
                  {submitting ? 'Guardando...' : (editingGenre ? 'Actualizar' : 'Crear')} {submitting ? '' : 'Género'}
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
            <h2>¿Eliminar Género?</h2>
            <p>
              ¿Estás seguro de que deseas eliminar "<strong>{deleteConfirm.nombre}</strong>"?
            </p>
            <p className="warning-text">Esta acción no se puede deshacer.</p>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setDeleteConfirm(null)}>
                Cancelar
              </button>
              <button className="btn-confirm-delete" onClick={() => handleDelete(deleteConfirm.id_genero)}>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Genres;
