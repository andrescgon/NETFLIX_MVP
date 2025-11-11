import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './Recommendations.css';

const Recommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scrollX, setScrollX] = useState(0);
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

  const handleMovieClick = (movieId) => {
    navigate(`/player/${movieId}`);
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
    </div>
  );
};

export default Recommendations;
