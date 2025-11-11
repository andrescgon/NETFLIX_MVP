import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getMoviesAdmin, deleteMovie } from '../../services/admin';
import { useToast } from '../../context/ToastContext';
import './Movies.css';

const Movies = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

  useEffect(() => {
    loadMovies();
  }, [location.key]); // Recargar cuando cambia la navegación

  const loadMovies = async () => {
    setLoading(true);
    try {
      const result = await getMoviesAdmin();
      if (result.success) {
        setMovies(result.data);
      } else {
        showToast('Error al cargar películas', 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      showToast('Error al conectar con el servidor', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (movieId) => {
    // Cerrar el modal inmediatamente para evitar doble click
    const movieTitle = deleteConfirm.titulo;
    setDeleteConfirm(null);

    try {
      const result = await deleteMovie(movieId);
      if (result.success) {
        // Actualización optimista: eliminar la película del estado inmediatamente
        setMovies(prev => prev.filter(movie => movie.id_pelicula !== movieId));

        // Mostrar toast de éxito
        showToast(`"${movieTitle}" eliminada correctamente`, 'success');

        // Sincronizar con el servidor en segundo plano
        loadMovies();
      } else {
        const errorMsg = result.error?.detail || result.error || 'Error al eliminar película';
        showToast(errorMsg, 'error');
        console.error('Error al eliminar:', result.error);
      }
    } catch (error) {
      console.error('Error:', error);
      showToast('Error al eliminar película', 'error');
    }
  };

  const filteredMovies = movies.filter((movie) =>
    movie.titulo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="movies-loading">
        <div className="spinner"></div>
        <p>Cargando películas...</p>
      </div>
    );
  }

  return (
    <div className="movies-page">
      <div className="movies-header">
        <div className="movies-header-left">
          <h1>Gestión de Películas</h1>
          <p>Administra el catálogo de películas de la plataforma</p>
        </div>
        <button className="btn-add-movie" onClick={() => navigate('/admin/movies/new')}>
          <span className="btn-icon">➕</span>
          Agregar Película
        </button>
      </div>

      <div className="movies-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="Buscar por título..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>
        <div className="movies-count">
          Mostrando {filteredMovies.length} de {movies.length} películas
        </div>
      </div>

      {filteredMovies.length === 0 ? (
        <div className="no-movies">
          <p>No se encontraron películas</p>
          <button className="btn-add-first" onClick={() => navigate('/admin/movies/new')}>
            Agregar Primera Película
          </button>
        </div>
      ) : (
        <div className="movies-table-container">
          <table className="movies-table">
            <thead>
              <tr>
                <th>Miniatura</th>
                <th>Título</th>
                <th>Clasificación</th>
                <th>Duración</th>
                <th>Fecha Estreno</th>
                <th>Géneros</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredMovies.map((movie) => (
                <tr key={movie.id_pelicula}>
                  <td data-label="Miniatura">
                    <div className="movie-thumbnail">
                      {movie.miniatura ? (
                        <img src={movie.miniatura} alt={movie.titulo} />
                      ) : (
                        <div className="no-thumbnail">🎬</div>
                      )}
                    </div>
                  </td>
                  <td data-label="Título">
                    <div className="movie-title-cell">
                      <span className="movie-title">{movie.titulo}</span>
                      {movie.descripcion && (
                        <span className="movie-description">{movie.descripcion.substring(0, 60)}...</span>
                      )}
                    </div>
                  </td>
                  <td data-label="Clasificación">
                    <span className="badge badge-classification">{movie.clasificacion}</span>
                  </td>
                  <td data-label="Duración">{movie.duracion} min</td>
                  <td data-label="Fecha de Estreno">{new Date(movie.fecha_estreno).toLocaleDateString('es-ES')}</td>
                  <td data-label="Géneros">
                    <div className="genres-list">
                      {movie.generos?.map((genero, index) => (
                        <span key={index} className="badge badge-genre">
                          {genero.nombre}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td data-label="Acciones">
                    <div className="action-buttons">
                      <button
                        className="btn-action btn-edit"
                        onClick={() => navigate(`/admin/movies/${movie.id_pelicula}/edit`)}
                        title="Editar"
                      >
                        ✏️
                      </button>
                      <button
                        className="btn-action btn-assets"
                        onClick={() => navigate(`/admin/movies/${movie.id_pelicula}/assets`)}
                        title="Gestionar Videos"
                      >
                        🎥
                      </button>
                      <button
                        className="btn-action btn-delete"
                        onClick={() => setDeleteConfirm(movie)}
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

      {/* Modal de confirmación de eliminación */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>¿Eliminar Película?</h2>
            <p>
              ¿Estás seguro de que deseas eliminar "<strong>{deleteConfirm.titulo}</strong>"?
            </p>
            <p className="warning-text">Esta acción no se puede deshacer.</p>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setDeleteConfirm(null)}>
                Cancelar
              </button>
              <button className="btn-confirm-delete" onClick={() => handleDelete(deleteConfirm.id_pelicula)}>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Movies;
