import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { streamingService } from '../services/streaming';
import { movieService } from '../services/movies';
import { useProfile } from '../context/ProfileContext';
import api from '../services/api';
import './Player.css';

const Player = () => {
  const { movieId } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const { activeProfile } = useProfile();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [streamData, setStreamData] = useState(null);
  const [movieInfo, setMovieInfo] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showRotateMessage, setShowRotateMessage] = useState(false);
  const [progressLoaded, setProgressLoaded] = useState(false);
  const progressIntervalRef = useRef(null);

  useEffect(() => {
    if (!activeProfile) {
      setError('No hay perfil activo. Por favor, selecciona un perfil primero.');
      setLoading(false);
      return;
    }
    loadMovie();
  }, [movieId, activeProfile]);

  // Detectar si es dispositivo móvil
  const isMobile = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  };

  // Detectar orientación y mostrar mensaje en móviles
  useEffect(() => {
    if (!isMobile()) return;

    const checkOrientation = () => {
      const isPortrait = window.innerHeight > window.innerWidth;
      setShowRotateMessage(isPortrait && isPlaying);
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, [isPlaying]);

  // Manejar orientación de pantalla en móviles
  useEffect(() => {
    if (!isMobile()) return;

    const videoElement = videoRef.current;
    if (!videoElement) return;

    const lockOrientation = async () => {
      try {
        // Intentar bloquear la orientación a landscape
        if (screen.orientation && screen.orientation.lock) {
          await screen.orientation.lock('landscape');
          console.log('✅ Orientación bloqueada a landscape');
        }
      } catch (error) {
        console.log('⚠️ No se pudo bloquear la orientación:', error.message);
        // La API de orientación solo funciona en fullscreen en la mayoría de navegadores
      }
    };

    const unlockOrientation = () => {
      try {
        if (screen.orientation && screen.orientation.unlock) {
          screen.orientation.unlock();
          console.log('✅ Orientación desbloqueada');
        }
      } catch (error) {
        console.log('⚠️ No se pudo desbloquear la orientación:', error.message);
      }
    };

    // Listener para cuando el video entra en fullscreen
    const handleFullscreenChange = async () => {
      const isFullscreen =
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement;

      if (isFullscreen) {
        console.log('📺 Video en fullscreen, intentando bloquear orientación...');
        await lockOrientation();
      } else {
        console.log('📺 Video salió de fullscreen, desbloqueando orientación...');
        unlockOrientation();
      }
    };

    // Agregar listeners para fullscreen
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    // Cleanup: desbloquear cuando se desmonte el componente
    return () => {
      unlockOrientation();
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, [videoRef]);

  // Cargar progreso guardado
  const loadProgress = async () => {
    try {
      const response = await api.get(`/history/progress/${movieId}/`);
      const { progreso_segundos } = response.data;

      if (progreso_segundos > 0 && videoRef.current) {
        videoRef.current.currentTime = progreso_segundos;
        console.log(`⏩ Cargando progreso: ${progreso_segundos} segundos`);
      }
      setProgressLoaded(true);
    } catch (error) {
      console.error('Error cargando progreso:', error);
      setProgressLoaded(true);
    }
  };

  // Guardar progreso
  const saveProgress = async (currentTime, isFinished = false) => {
    try {
      await api.post('/history/progress/', {
        pelicula_id: parseInt(movieId),
        progreso_segundos: Math.floor(currentTime),
        terminado: isFinished
      });
      console.log(`💾 Progreso guardado: ${Math.floor(currentTime)} segundos`);
    } catch (error) {
      console.error('Error guardando progreso:', error);
    }
  };

  const loadMovie = async () => {
    try {
      setLoading(true);
      setError('');

      // Cargar info de la película y URL de streaming en paralelo
      const [movieData, streamInfo] = await Promise.all([
        movieService.getMovieDetail(movieId),
        streamingService.getPlayUrl(movieId, { perfil: activeProfile.id_perfil })
      ]);

      console.log('Stream data recibida:', streamInfo);
      console.log('URL del video:', streamInfo?.url);

      setMovieInfo(movieData);
      setStreamData(streamInfo);
    } catch (error) {
      console.error('Error cargando video:', error);
      setError(error.response?.data?.detail || 'Error al cargar el video');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handlePlay = () => {
    setIsPlaying(true);

    // Cargar progreso la primera vez que se reproduce
    if (!progressLoaded && videoRef.current) {
      loadProgress();
    }

    // Intentar entrar en fullscreen automáticamente (en todos los dispositivos)
    if (videoRef.current) {
      const elem = videoRef.current;

      if (elem.requestFullscreen) {
        elem.requestFullscreen().catch(err => {
          console.log('⚠️ Error al entrar en fullscreen:', err.message);
        });
      } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
      } else if (elem.mozRequestFullScreen) {
        elem.mozRequestFullScreen();
      } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen();
      } else if (elem.webkitEnterFullscreen) {
        // Para iOS Safari
        elem.webkitEnterFullscreen();
      }

      console.log('📺 Intentando entrar en fullscreen automáticamente...');
    }

    // Iniciar guardado automático cada 10 segundos
    if (!progressIntervalRef.current) {
      progressIntervalRef.current = setInterval(() => {
        if (videoRef.current && !videoRef.current.paused) {
          saveProgress(videoRef.current.currentTime);
        }
      }, 10000); // Guardar cada 10 segundos
    }
  };

  const handlePause = () => {
    setIsPlaying(false);
    // Guardar progreso al pausar
    if (videoRef.current) {
      saveProgress(videoRef.current.currentTime);
    }
  };

  const handleEnded = () => {
    console.log('Video terminado');
    setIsPlaying(false);
    // Marcar como terminado
    if (videoRef.current) {
      saveProgress(videoRef.current.currentTime, true);
    }
  };

  const handleTimeUpdate = () => {
    // Opcional: podrías agregar lógica aquí si necesitas hacer algo cada vez que cambia el tiempo
  };

  // Cleanup: guardar progreso al salir y limpiar interval
  useEffect(() => {
    return () => {
      // Limpiar interval
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }

      // Guardar progreso cuando el componente se desmonte
      const currentTime = videoRef.current?.currentTime;
      if (currentTime && currentTime > 0) {
        // Usar fetch directamente porque el componente se está desmontando
        fetch('/api/history/progress/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            pelicula_id: parseInt(movieId),
            progreso_segundos: Math.floor(currentTime),
            terminado: false
          }),
          keepalive: true // Importante: permite que la petición se complete aunque el componente se desmonte
        }).catch(err => console.error('Error guardando progreso al salir:', err));
      }
    };
  }, [movieId]);

  if (loading) {
    return (
      <div className="player-container">
        <div className="player-loading">
          <div className="loading-spinner"></div>
          <p>Cargando video...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="player-container">
        <div className="player-error">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={handleBack} className="btn-back">
            Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="player-container">
      <button className="player-back-btn" onClick={handleBack}>
        ← Volver
      </button>

      {/* Mensaje para rotar dispositivo */}
      {showRotateMessage && (
        <div className="rotate-message">
          <div className="rotate-icon">📱</div>
          <p>Por favor, gira tu dispositivo</p>
          <p className="rotate-subtitle">Para una mejor experiencia</p>
        </div>
      )}

      <div className="player-wrapper">
        <video
          ref={videoRef}
          className="video-player"
          controls
          controlsList="nodownload noremoteplayback"
          disablePictureInPicture
          autoPlay
          preload="metadata"
          onPlay={handlePlay}
          onPause={handlePause}
          onEnded={handleEnded}
          onContextMenu={(e) => e.preventDefault()}
          src={streamData?.url}
        >
          Tu navegador no soporta el elemento de video.
        </video>
      </div>

      {movieInfo && (
        <div className="player-info">
          <h2>{movieInfo.titulo}</h2>
          <p className="player-meta">
            {streamData?.calidad && <span>Calidad: {streamData.calidad}</span>}
            {movieInfo.duracion && <span>{movieInfo.duracion} min</span>}
            {movieInfo.clasificacion && <span>{movieInfo.clasificacion}</span>}
          </p>
        </div>
      )}
    </div>
  );
};

export default Player;