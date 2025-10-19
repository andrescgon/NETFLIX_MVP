import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { historyService } from '../services/history';
import { movieService } from '../services/movies';
import { useProfile } from '../context/ProfileContext';
import { useToast } from '../context/ToastContext';
import Skeleton from '../components/Skeleton';
import './History.css';

const History = () => {
  const [history, setHistory] = useState([]);
  const [movies, setMovies] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('30'); // días
  const { activeProfile } = useProfile();
  const navigate = useNavigate();
  const toast = useToast();

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
  }, [activeProfile, filter]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const data = await historyService.getRecentHistory({
        days: parseInt(filter),
        limit: 100,
        perfil: activeProfile.id_perfil
      });

      setHistory(data.items || []);

      // Cargar detalles de películas únicas
      const uniqueMovieIds = [...new Set(data.items.map(item => item.pelicula_id))];
      const movieDetailsPromises = uniqueMovieIds.map(id =>
        movieService.getMovieDetail(id).catch(() => null)
      );

      const movieDetails = await Promise.all(movieDetailsPromises);
      const moviesMap = {};
      movieDetails.forEach(movie => {
        if (movie) {
          moviesMap[movie.id_pelicula] = movie;
        }
      });

      setMovies(moviesMap);
    } catch (error) {
      console.error('Error cargando historial:', error);
      toast.error('Error al cargar el historial');
    } finally {
      setLoading(false);
    }
  };

  const handleMovieClick = (movieId) => {
    navigate(`/player/${movieId}`);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Hoy';
    } else if (diffDays === 1) {
      return 'Ayer';
    } else if (diffDays < 7) {
      return `Hace ${diffDays} días`;
    } else {
      return date.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    }
  };

  const groupByDate = (items) => {
    const groups = {};
    items.forEach(item => {
      const date = new Date(item.fecha_vista).toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(item);
    });
    return groups;
  };

  if (loading) {
    return (
      <div className="history-container">
        <div className="history-header">
          <Skeleton width="300px" height="40px" />
          <Skeleton width="150px" height="40px" />
        </div>
        <div className="history-content">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="history-item-skeleton">
              <Skeleton width="200px" height="120px" borderRadius="8px" />
              <div className="history-item-info">
                <Skeleton width="250px" height="24px" />
                <Skeleton width="150px" height="18px" />
                <Skeleton width="100px" height="18px" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!history.length) {
    return (
      <div className="history-container">
        <div className="history-header">
          <h1>Mi Historial</h1>
        </div>
        <div className="history-empty">
          <h2>No hay historial de visualización</h2>
          <p>Las películas que veas aparecerán aquí</p>
          <button onClick={() => navigate('/home')} className="btn-browse">
            Explorar películas
          </button>
        </div>
      </div>
    );
  }

  const groupedHistory = groupByDate(history);

  return (
    <div className="history-container">
      <div className="history-header">
        <h1>Mi Historial</h1>
        <select
          className="history-filter"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="7">Últimos 7 días</option>
          <option value="30">Últimos 30 días</option>
          <option value="90">Últimos 3 meses</option>
          <option value="365">Último año</option>
        </select>
      </div>

      <div className="history-content">
        {Object.entries(groupedHistory).map(([date, items]) => (
          <div key={date} className="history-group">
            <h2 className="history-date">{date}</h2>
            <div className="history-items">
              {items.map((item) => {
                const movie = movies[item.pelicula_id];
                return (
                  <div
                    key={item.id_historial}
                    className="history-item"
                    onClick={() => handleMovieClick(item.pelicula_id)}
                  >
                    <div className="history-item-poster">
                      {getImageUrl(movie?.miniatura) ? (
                        <img src={getImageUrl(movie.miniatura)} alt={movie.titulo} />
                      ) : (
                        <div className="history-item-placeholder">
                          <span>{item.pelicula_titulo?.charAt(0) || '?'}</span>
                        </div>
                      )}
                      <div className="history-item-overlay">
                        <span className="play-icon">▶</span>
                      </div>
                    </div>
                    <div className="history-item-info">
                      <h3>{item.pelicula_titulo || 'Película desconocida'}</h3>
                      {movie && (
                        <>
                          <div className="history-item-meta">
                            {movie.anio && <span>{movie.anio}</span>}
                            {movie.duracion && <span>{movie.duracion} min</span>}
                            {movie.clasificacion && <span>{movie.clasificacion}</span>}
                          </div>
                          {movie.generos && movie.generos.length > 0 && (
                            <div className="history-item-genres">
                              {movie.generos.slice(0, 3).map((genre, idx) => (
                                <span key={idx} className="genre-tag">{genre.nombre}</span>
                              ))}
                            </div>
                          )}
                        </>
                      )}
                      <p className="history-item-time">{formatDate(item.fecha_vista)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default History;