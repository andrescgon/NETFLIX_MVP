import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  getMovieDetailAdmin,
  createMovie,
  updateMovie,
  getActors,
  getDirectors,
  getGenres
} from '../../services/admin';
import { useToast } from '../../context/ToastContext';
import './MovieForm.css';

const MovieForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const isEditMode = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(isEditMode);
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    fecha_estreno: '',
    duracion: '',
    clasificacion: 'G',
    actores: [],
    directores: [],
    generos: [],
    miniatura: null
  });

  const [catalogData, setCatalogData] = useState({
    actores: [],
    directores: [],
    generos: []
  });

  // Estados para las búsquedas
  const [searchActores, setSearchActores] = useState('');
  const [searchDirectores, setSearchDirectores] = useState('');
  const [searchGeneros, setSearchGeneros] = useState('');
  const [thumbnailPreview, setThumbnailPreview] = useState(null);

  useEffect(() => {
    loadCatalogData();
    if (isEditMode) {
      loadMovieData();
    }
  }, [id]);

  const loadCatalogData = async () => {
    try {
      const [actorsResult, directorsResult, genresResult] = await Promise.all([
        getActors(),
        getDirectors(),
        getGenres()
      ]);

      setCatalogData({
        actores: actorsResult.success ? actorsResult.data : [],
        directores: directorsResult.success ? directorsResult.data : [],
        generos: genresResult.success ? genresResult.data : []
      });
    } catch (error) {
      console.error('Error cargando catálogos:', error);
      showToast('Error al cargar datos de catálogo', 'error');
    }
  };

  const loadMovieData = async () => {
    setLoadingData(true);
    try {
      const result = await getMovieDetailAdmin(id);
      if (result.success) {
        const movie = result.data;
        setFormData({
          titulo: movie.titulo || '',
          descripcion: movie.descripcion || '',
          fecha_estreno: movie.fecha_estreno || '',
          duracion: movie.duracion || '',
          clasificacion: movie.clasificacion || 'G',
          actores: movie.actores?.map(a => a.id_actor) || [],
          directores: movie.directores?.map(d => d.id_director) || [],
          generos: movie.generos?.map(g => g.id_genero) || [],
          miniatura: null
        });
        if (movie.miniatura) {
          setThumbnailPreview(movie.miniatura);
        }
      } else {
        showToast('Error al cargar película', 'error');
        navigate('/admin/movies');
      }
    } catch (error) {
      console.error('Error:', error);
      showToast('Error al cargar película', 'error');
      navigate('/admin/movies');
    } finally {
      setLoadingData(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        miniatura: file
      }));

      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Funciones para agregar/quitar items
  const addItem = (field, itemId) => {
    if (!formData[field].includes(itemId)) {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], itemId]
      }));
    }
  };

  const removeItem = (field, itemId) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter(id => id !== itemId)
    }));
  };

  // Filtrar items según búsqueda
  const getFilteredActores = () => {
    return catalogData.actores.filter(actor =>
      actor.nombre.toLowerCase().includes(searchActores.toLowerCase())
    );
  };

  const getFilteredDirectores = () => {
    return catalogData.directores.filter(director =>
      director.nombre.toLowerCase().includes(searchDirectores.toLowerCase())
    );
  };

  const getFilteredGeneros = () => {
    return catalogData.generos.filter(genero =>
      genero.nombre.toLowerCase().includes(searchGeneros.toLowerCase())
    );
  };

  // Obtener nombres de items seleccionados
  const getSelectedActoresNames = () => {
    return catalogData.actores
      .filter(actor => formData.actores.includes(actor.id_actor))
      .map(actor => ({ id: actor.id_actor, nombre: actor.nombre }));
  };

  const getSelectedDirectoresNames = () => {
    return catalogData.directores
      .filter(director => formData.directores.includes(director.id_director))
      .map(director => ({ id: director.id_director, nombre: director.nombre }));
  };

  const getSelectedGenerosNames = () => {
    return catalogData.generos
      .filter(genero => formData.generos.includes(genero.id_genero))
      .map(genero => ({ id: genero.id_genero, nombre: genero.nombre }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Deshabilitar el botón inmediatamente para evitar doble click
    setLoading(true);

    try {
      // Preparar datos del formulario
      const submitData = new FormData();
      submitData.append('titulo', formData.titulo);
      submitData.append('descripcion', formData.descripcion);
      submitData.append('fecha_estreno', formData.fecha_estreno);
      submitData.append('duracion', formData.duracion);
      submitData.append('clasificacion', formData.clasificacion);

      formData.actores.forEach(id => submitData.append('actores', id));
      formData.directores.forEach(id => submitData.append('directores', id));
      formData.generos.forEach(id => submitData.append('generos', id));

      if (formData.miniatura) {
        submitData.append('miniatura', formData.miniatura);
      }

      // Guardar el título para el mensaje
      const movieTitle = formData.titulo;

      // Realizar la petición
      let result;
      if (isEditMode) {
        result = await updateMovie(id, submitData);
      } else {
        result = await createMovie(submitData);
      }

      if (result.success) {
        // Solo navegar si fue exitoso
        navigate('/admin/movies');

        showToast(
          isEditMode ? `"${movieTitle}" actualizada correctamente` : `"${movieTitle}" creada correctamente`,
          'success'
        );
      } else {
        const errorMsg = result.error?.detail || result.error || 'Error al guardar película';
        showToast(errorMsg, 'error');
        console.error('Error:', result.error);
        setLoading(false); // Rehabilitar el botón en caso de error
      }
    } catch (error) {
      console.error('Error:', error);
      showToast('Error al guardar película', 'error');
      setLoading(false); // Rehabilitar el botón en caso de error
    }
  };

  if (loadingData) {
    return (
      <div className="movie-form-loading">
        <div className="spinner"></div>
        <p>Cargando datos...</p>
      </div>
    );
  }

  return (
    <div className="movie-form-page">
      {/* Overlay de guardando */}
      {loading && (
        <div className="saving-overlay">
          <div className="saving-content">
            <div className="spinner"></div>
            <p>{isEditMode ? 'Actualizando película...' : 'Creando película...'}</p>
          </div>
        </div>
      )}
      <div className="movie-form-header">
        <button className="btn-back" onClick={() => navigate('/admin/movies')}>
          ← Volver
        </button>
        <h1>{isEditMode ? 'Editar Película' : 'Nueva Película'}</h1>
      </div>

      <form onSubmit={handleSubmit} className="movie-form">
        <div className="form-grid">
          {/* Información básica */}
          <div className="form-section">
            <h2>Información Básica</h2>

            <div className="form-group">
              <label htmlFor="titulo">Título *</label>
              <input
                type="text"
                id="titulo"
                name="titulo"
                value={formData.titulo}
                onChange={handleInputChange}
                required
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="descripcion">Descripción *</label>
              <textarea
                id="descripcion"
                name="descripcion"
                value={formData.descripcion}
                onChange={handleInputChange}
                required
                rows="4"
                className="form-input"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="fecha_estreno">Fecha de Estreno *</label>
                <input
                  type="date"
                  id="fecha_estreno"
                  name="fecha_estreno"
                  value={formData.fecha_estreno}
                  onChange={handleInputChange}
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="duracion">Duración (minutos) *</label>
                <input
                  type="number"
                  id="duracion"
                  name="duracion"
                  value={formData.duracion}
                  onChange={handleInputChange}
                  required
                  min="1"
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="clasificacion">Clasificación *</label>
              <select
                id="clasificacion"
                name="clasificacion"
                value={formData.clasificacion}
                onChange={handleInputChange}
                required
                className="form-input"
              >
                <option value="G">G - General</option>
                <option value="PG">PG - Parental Guidance</option>
                <option value="PG-13">PG-13 - Mayores de 13</option>
                <option value="R">R - Restringida</option>
                <option value="NC-17">NC-17 - Adultos</option>
              </select>
            </div>
          </div>

          {/* Miniatura */}
          <div className="form-section">
            <h2>Miniatura</h2>

            <div className="form-group">
              <label htmlFor="miniatura">Imagen de Miniatura</label>
              {thumbnailPreview && (
                <div className="thumbnail-preview">
                  <img src={thumbnailPreview} alt="Preview" />
                </div>
              )}
              <input
                type="file"
                id="miniatura"
                name="miniatura"
                onChange={handleFileChange}
                accept="image/*"
                className="form-input"
              />
              <small className="form-hint">Formatos aceptados: JPG, PNG, WebP. Tamaño recomendado: 300x450px</small>
            </div>
          </div>

          {/* Catálogo con búsqueda */}
          <div className="form-section form-section-full">
            <h2>Catálogo</h2>

            {/* Actores */}
            <div className="form-group">
              <label>Actores</label>
              <div className="searchable-select">
                <input
                  type="text"
                  placeholder="Buscar actores..."
                  value={searchActores}
                  onChange={(e) => setSearchActores(e.target.value)}
                  className="form-input search-input-catalog"
                />
                <div className="searchable-options">
                  {getFilteredActores().map((actor) => (
                    <div
                      key={actor.id_actor}
                      className={`option-item ${formData.actores.includes(actor.id_actor) ? 'selected' : ''}`}
                      onClick={() => {
                        if (formData.actores.includes(actor.id_actor)) {
                          removeItem('actores', actor.id_actor);
                        } else {
                          addItem('actores', actor.id_actor);
                        }
                      }}
                    >
                      <span>{actor.nombre}</span>
                      {formData.actores.includes(actor.id_actor) && <span className="check">✓</span>}
                    </div>
                  ))}
                </div>
              </div>
              {getSelectedActoresNames().length > 0 && (
                <div className="selected-tags">
                  {getSelectedActoresNames().map((actor) => (
                    <span key={actor.id} className="tag">
                      {actor.nombre}
                      <button
                        type="button"
                        onClick={() => removeItem('actores', actor.id)}
                        className="tag-remove"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Directores */}
            <div className="form-group">
              <label>Directores</label>
              <div className="searchable-select">
                <input
                  type="text"
                  placeholder="Buscar directores..."
                  value={searchDirectores}
                  onChange={(e) => setSearchDirectores(e.target.value)}
                  className="form-input search-input-catalog"
                />
                <div className="searchable-options">
                  {getFilteredDirectores().map((director) => (
                    <div
                      key={director.id_director}
                      className={`option-item ${formData.directores.includes(director.id_director) ? 'selected' : ''}`}
                      onClick={() => {
                        if (formData.directores.includes(director.id_director)) {
                          removeItem('directores', director.id_director);
                        } else {
                          addItem('directores', director.id_director);
                        }
                      }}
                    >
                      <span>{director.nombre}</span>
                      {formData.directores.includes(director.id_director) && <span className="check">✓</span>}
                    </div>
                  ))}
                </div>
              </div>
              {getSelectedDirectoresNames().length > 0 && (
                <div className="selected-tags">
                  {getSelectedDirectoresNames().map((director) => (
                    <span key={director.id} className="tag">
                      {director.nombre}
                      <button
                        type="button"
                        onClick={() => removeItem('directores', director.id)}
                        className="tag-remove"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Géneros */}
            <div className="form-group">
              <label>Géneros</label>
              <div className="searchable-select">
                <input
                  type="text"
                  placeholder="Buscar géneros..."
                  value={searchGeneros}
                  onChange={(e) => setSearchGeneros(e.target.value)}
                  className="form-input search-input-catalog"
                />
                <div className="searchable-options">
                  {getFilteredGeneros().map((genero) => (
                    <div
                      key={genero.id_genero}
                      className={`option-item ${formData.generos.includes(genero.id_genero) ? 'selected' : ''}`}
                      onClick={() => {
                        if (formData.generos.includes(genero.id_genero)) {
                          removeItem('generos', genero.id_genero);
                        } else {
                          addItem('generos', genero.id_genero);
                        }
                      }}
                    >
                      <span>{genero.nombre}</span>
                      {formData.generos.includes(genero.id_genero) && <span className="check">✓</span>}
                    </div>
                  ))}
                </div>
              </div>
              {getSelectedGenerosNames().length > 0 && (
                <div className="selected-tags">
                  {getSelectedGenerosNames().map((genero) => (
                    <span key={genero.id} className="tag">
                      {genero.nombre}
                      <button
                        type="button"
                        onClick={() => removeItem('generos', genero.id)}
                        className="tag-remove"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="form-actions">
          <button
            type="button"
            className="btn-cancel"
            onClick={() => navigate('/admin/movies')}
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="btn-submit"
            disabled={loading}
          >
            {loading ? 'Guardando...' : (isEditMode ? 'Actualizar Película' : 'Crear Película')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MovieForm;
