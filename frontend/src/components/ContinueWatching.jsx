import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { historyService } from '../services/history';
import { movieService } from '../services/movies';
import { useProfile } from '../context/ProfileContext';
import ContinueWatchingSkeleton from './ContinueWatchingSkeleton';
import './ContinueWatching.css';

const ContinueWatching = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scrollX, setScrollX] = useState(0);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const rowRef = useRef(null);
  const { activeProfile } = useProfile();
  const navigate = useNavigate();

  const getImageUrl = (miniatura) => {
    if (!miniatura) return null;
    if (miniatura.startsWith('http://') || miniatura.startsWith('https://')) {
      return miniatura;
    }
    // Usar ruta relativa para que Vite proxy funcione
    if (miniatura.startsWith('/')) {
      return miniatura;
    }
    return `/${miniatura}`;
  };

  useEffect(() => {
    if (activeProfile) {
      loadHistory();
    }
  }, [activeProfile]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const historyData = await historyService.getRecentHistory({
        limit: 10,
        days: 30,
      });

      if (historyData.items && historyData.items.length > 0) {
        // Obtener detalles de las películas
        const moviePromises = historyData.items.map(item =>
          movieService.getMovieDetail(item.pelicula_id).catch(() => null)
        );
        const movieDetails = await Promise.all(moviePromises);

        // Filtrar películas que se cargaron correctamente
        const validMovies = movieDetails.filter(movie => movie !== null);
        setMovies(validMovies);
      }
    } catch (error) {
      console.error('Error cargando historial:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMovieClick = async (movieId) => {
    try {
      const detail = await movieService.getMovieDetail(movieId);
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
    setSelectedMovie(null);
  };

  const handleLeftArrow = () => {
    if (rowRef.current) {
      const x = rowRef.current.scrollLeft - (window.innerWidth - 100);
      rowRef.current.scrollLeft = x;
      setScrollX(x);
    }
  };

  const handleRightArrow = () => {
    if (rowRef.current) {
      const x = rowRef.current.scrollLeft + (window.innerWidth - 100);
      rowRef.current.scrollLeft = x;
      setScrollX(x);
    }
  };

  if (loading) {
    return <ContinueWatchingSkeleton />;
  }

  if (movies.length === 0) {
    return null; // No mostrar la sección si no hay historial
  }

  return (
    <div className="continue-watching">
      <h2>Continuar viendo</h2>
      <div className="continue-container">
        {scrollX > 0 && (
          <button className="continue-arrow continue-arrow-left" onClick={handleLeftArrow}>
            ‹
          </button>
        )}
        <div className="continue-grid" ref={rowRef}>
          {movies.map((movie) => (
            <div
              key={movie.id_pelicula}
              className="continue-card"
              onClick={() => handleMovieClick(movie.id_pelicula)}
            >
              <div className="continue-poster">
                {getImageUrl(movie.miniatura) ? (
                  <>
                    <img
                      src={getImageUrl(movie.miniatura)}
                      alt={movie.titulo}
                      className="continue-poster-image"
                    />
                    <div className="continue-play-overlay">
                      <div className="play-icon">▶</div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="continue-poster-placeholder">
                      {movie.titulo.charAt(0).toUpperCase()}
                    </div>
                    <div className="continue-play-overlay">
                      <div className="play-icon">▶</div>
                    </div>
                  </>
                )}
              </div>
              <div className="continue-info">
                <h3 className="continue-title">{movie.titulo}</h3>
                <div className="continue-meta">
                  {movie.duracion && <span>{movie.duracion} min</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
        {rowRef.current && scrollX < (rowRef.current.scrollWidth - rowRef.current.offsetWidth) && (
          <button className="continue-arrow continue-arrow-right" onClick={handleRightArrow}>
            ›
          </button>
        )}
      </div>

      {/* Modal de detalles */}
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
              className={`btn-play ${!selectedMovie.tiene_video ? 'btn-disabled' : ''}`}
              onClick={() => selectedMovie.tiene_video && handlePlay(selectedMovie.id_pelicula)}
              disabled={!selectedMovie.tiene_video}
            >
              {selectedMovie.tiene_video ? '▶ Continuar' : '🔒 Próximamente'}
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
    </div>
  );
};

export default ContinueWatching;