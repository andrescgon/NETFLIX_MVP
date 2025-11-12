import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { movieService } from '../services/movies';
import './Recommendations.css';

const Recommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scrollX, setScrollX] = useState(0);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const rowRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      const response = await api.get('/history/recommendations/');
      setRecommendations(response.data.recommendations || []);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
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

  if (loading) {
    return (
      <div className="recommendations">
        <h2>Recomendaciones para ti</h2>
        <p className="loading-text">Cargando recomendaciones...</p>
      </div>
    );
  }

  if (!recommendations || recommendations.length === 0) {
    return null;
  }

  return (
    <div className="recommendations">
      <h2>Recomendaciones para ti</h2>
      <div className="recommendations-container">
        {scrollX > 0 && (
          <button className="recommendations-arrow recommendations-arrow-left" onClick={handleLeftArrow}>
            ‹
          </button>
        )}
        <div className="recommendations-grid" ref={rowRef}>
          {recommendations.map((movie) => (
            <div
              key={movie.id_pelicula}
              className="recommendations-card"
              onClick={() => handleMovieClick(movie.id_pelicula)}
            >
              <div className="recommendations-poster">
                {movie.miniatura ? (
                  <img
                    src={movie.miniatura}
                    alt={movie.titulo}
                    loading="lazy"
                  />
                ) : (
                  <div className="recommendations-placeholder">
                    <span>{movie.titulo}</span>
                  </div>
                )}
              </div>
              <div className="recommendations-info">
                <h3>{movie.titulo}</h3>
                <div className="recommendations-meta">
                  <span className="year">{movie.ano_lanzamiento}</span>
                  {movie.calificacion_imdb && (
                    <span className="rating">⭐ {movie.calificacion_imdb}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        {rowRef.current && scrollX < (rowRef.current.scrollWidth - rowRef.current.offsetWidth) && (
          <button className="recommendations-arrow recommendations-arrow-right" onClick={handleRightArrow}>
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
              {selectedMovie.tiene_video ? '▶ Reproducir' : '🔒 Próximamente'}
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

export default Recommendations;
