import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { movieService } from '../services/movies';
import ContinueWatching from '../components/ContinueWatching';
import ContinueWatchingSkeleton from '../components/ContinueWatchingSkeleton';
import Recommendations from '../components/Recommendations';
import MovieRow from '../components/MovieRow';
import ChatBot from '../components/ChatBot';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const [generos, setGeneros] = useState([]);
  const [moviesByGenre, setMoviesByGenre] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [noSubscription, setNoSubscription] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [allMovies, setAllMovies] = useState([]);
  const [filterType, setFilterType] = useState('titulo'); // titulo, genero, director, actor
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      setLoading(true);
      setError('');
      setNoSubscription(false);

      // Cargar géneros primero
      const filtersData = await movieService.getFilters();
      setGeneros(filtersData.generos || []);

      // Cargar películas por género y recopilar todas las películas
      const moviesByGenreTemp = {};
      const allMoviesTemp = [];

      for (const genero of filtersData.generos) {
        const movies = await movieService.getMovies({ genero_id: genero.id_genero });
        if (movies.length > 0) {
          moviesByGenreTemp[genero.id_genero] = {
            nombre: genero.nombre,
            peliculas: movies,
          };
          // Agregar películas a la lista general (evitar duplicados)
          movies.forEach(movie => {
            if (!allMoviesTemp.find(m => m.id_pelicula === movie.id_pelicula)) {
              allMoviesTemp.push(movie);
            }
          });
        }
      }

      setMoviesByGenre(moviesByGenreTemp);
      setAllMovies(allMoviesTemp);
    } catch (error) {
      console.error('Error cargando contenido:', error);

      // Detectar error de suscripción
      if (error.response?.status === 403 ||
          error.response?.data?.detail?.includes('suscripción') ||
          error.response?.data?.detail?.includes('subscription')) {
        setNoSubscription(true);
        setError('');
      } else {
        setError('Error al cargar el contenido');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleMovieClick = async (movie) => {
    try {
      const detail = await movieService.getMovieDetail(movie.id_pelicula);
      setSelectedMovie(detail);
    } catch (error) {
      console.error('Error cargando detalle:', error);
    }
  };

  const closeModal = () => {
    setSelectedMovie(null);
  };

  const handlePlay = (movieId) => {
    navigate(`/player/${movieId}`);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  // Función para eliminar tildes/acentos
  const removeAccents = (str) => {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  };

  // Filtrar películas según el término de búsqueda y tipo de filtro
  const getFilteredMovies = () => {
    if (!searchTerm.trim()) return null;

    const term = removeAccents(searchTerm.toLowerCase().trim());

    return allMovies.filter(movie => {
      switch(filterType) {
        case 'titulo':
          return removeAccents(movie.titulo?.toLowerCase() || '').includes(term);
        case 'genero':
          return movie.generos?.some(g =>
            removeAccents(g.nombre?.toLowerCase() || '').includes(term)
          );
        case 'director':
          return movie.directores?.some(d =>
            removeAccents(d.nombre?.toLowerCase() || '').includes(term)
          );
        case 'actor':
          return movie.actores?.some(a =>
            removeAccents(a.nombre?.toLowerCase() || '').includes(term)
          );
        default:
          return false;
      }
    });
  };

  const getPlaceholder = () => {
    switch(filterType) {
      case 'titulo':
        return 'Buscar por título...';
      case 'genero':
        return 'Buscar por género...';
      case 'director':
        return 'Buscar por director...';
      case 'actor':
        return 'Buscar por actor...';
      default:
        return 'Buscar...';
    }
  };

  const filteredMovies = getFilteredMovies();

  return (
    <div className="home-container">
      {/* Barra de búsqueda */}
      {!noSubscription && !loading && (
        <div className="search-bar-container">
          <div className="search-bar">
            {/* Botón para mostrar/ocultar filtros */}
            <button
              className="btn-filter-toggle"
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? '✕' : '☰'} Filtros
            </button>

            {/* Opciones de filtro */}
            {showFilters && (
              <div className="filter-options">
                <button
                  className={`filter-option ${filterType === 'titulo' ? 'active' : ''}`}
                  onClick={() => {
                    setFilterType('titulo');
                    setShowFilters(false);
                  }}
                >
                  Título
                </button>
                <button
                  className={`filter-option ${filterType === 'genero' ? 'active' : ''}`}
                  onClick={() => {
                    setFilterType('genero');
                    setShowFilters(false);
                  }}
                >
                  Género
                </button>
                <button
                  className={`filter-option ${filterType === 'director' ? 'active' : ''}`}
                  onClick={() => {
                    setFilterType('director');
                    setShowFilters(false);
                  }}
                >
                  Director
                </button>
                <button
                  className={`filter-option ${filterType === 'actor' ? 'active' : ''}`}
                  onClick={() => {
                    setFilterType('actor');
                    setShowFilters(false);
                  }}
                >
                  Actor
                </button>
              </div>
            )}

            <input
              type="text"
              placeholder={getPlaceholder()}
              value={searchTerm}
              onChange={handleSearchChange}
              className="search-input"
            />
            {searchTerm && (
              <button onClick={clearSearch} className="btn-clear-search">
                ✕
              </button>
            )}
            <span className="search-icon">🔍</span>
          </div>
        </div>
      )}

      {error && <div className="error-message">{error}</div>}

      {/* Mensaje de no suscripción */}
      {noSubscription && (
        <div className="no-subscription-banner">
          <div className="no-subscription-content">
            <div className="no-subscription-icon">🔒</div>
            <h2>No tienes una suscripción activa</h2>
            <p>Para acceder al catálogo de películas necesitas una suscripción activa.</p>
            <button onClick={() => navigate('/plans')} className="btn-subscribe-banner">
              Ver Planes de Suscripción
            </button>
          </div>
        </div>
      )}

      {!noSubscription && (
        <>
          {/* Continuar viendo */}
          {!loading && !searchTerm && <ContinueWatching />}

          {/* Recomendaciones */}
          {!loading && !searchTerm && <Recommendations />}

          {/* Loading skeleton */}
          {loading ? (
            <>
              <ContinueWatchingSkeleton />
              <div style={{ padding: '0 3%' }}>
                <div className="skeleton-row-title"></div>
                <div className="skeleton-row"></div>
                <div className="skeleton-row-title"></div>
                <div className="skeleton-row"></div>
              </div>
            </>
          ) : searchTerm ? (
            /* Resultados de búsqueda */
            <div className="search-results">
              {filteredMovies && filteredMovies.length > 0 ? (
                <MovieRow
                  title={`Resultados de búsqueda: "${searchTerm}" (${filteredMovies.length})`}
                  movies={filteredMovies}
                  onMovieClick={handleMovieClick}
                />
              ) : (
                <div className="no-results">
                  <p>No se encontraron películas para "{searchTerm}"</p>
                  <button onClick={clearSearch} className="btn-clear">
                    Limpiar búsqueda
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Películas por género */
            <div className="genre-rows">
              {generos.map((genero) => {
                const genreData = moviesByGenre[genero.id_genero];
                if (!genreData) return null;
                return (
                  <MovieRow
                    key={genero.id_genero}
                    title={genreData.nombre}
                    movies={genreData.peliculas}
                    onMovieClick={handleMovieClick}
                  />
                );
              })}
            </div>
          )}
        </>
      )}

      {selectedMovie && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>
              ×
            </button>
            <h2>{selectedMovie.titulo}</h2>
            <div className="modal-meta">
              <span>{selectedMovie.fecha_estreno ? new Date(selectedMovie.fecha_estreno).getFullYear() : 'N/A'}</span>
              <span>{selectedMovie.duracion ? `${selectedMovie.duracion} min` : ''}</span>
              <span>{selectedMovie.clasificacion}</span>
            </div>
            <p className="modal-description">{selectedMovie.descripcion}</p>
            <button
              className="btn-play"
              onClick={() => handlePlay(selectedMovie.id_pelicula)}
            >
              ▶ Reproducir
            </button>
            {selectedMovie.generos && selectedMovie.generos.length > 0 && (
              <div className="modal-section">
                <strong>Géneros:</strong> {selectedMovie.generos.map(g => g.nombre).join(', ')}
              </div>
            )}
            {selectedMovie.directores && selectedMovie.directores.length > 0 && (
              <div className="modal-section">
                <strong>Director(es):</strong> {selectedMovie.directores.map(d => d.nombre).join(', ')}
              </div>
            )}
            {selectedMovie.actores && selectedMovie.actores.length > 0 && (
              <div className="modal-section">
                <strong>Actores:</strong> {selectedMovie.actores.map(a => a.nombre).join(', ')}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ChatBot de recomendaciones */}
      {!noSubscription && <ChatBot />}
    </div>
  );
};

export default Home;