import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { movieService } from '../services/movies';
import './ChatBot.css';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      text: '¡Hola! 👋 Soy tu asistente de recomendaciones de Netflix. ¿Qué tipo de películas te gustaría ver hoy?',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const messagesEndRef = useRef(null);
  const lastBotMessageRef = useRef(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToLastBotMessage = () => {
    // Si hay un mensaje del bot reciente, hacer scroll a él en lugar del final
    if (lastBotMessageRef.current) {
      lastBotMessageRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      scrollToBottom();
    }
  };

  useEffect(() => {
    // Solo hacer scroll al final en la primera carga o cuando el usuario envía mensaje
    // Si el último mensaje es del bot, hacer scroll a su inicio
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.type === 'bot') {
        // Esperar un poco para que el DOM se actualice
        setTimeout(() => {
          scrollToLastBotMessage();
        }, 100);
      } else {
        scrollToBottom();
      }
    }
  }, [messages]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    // Agregar mensaje del usuario
    const userMessage = {
      type: 'user',
      text: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentMessage = inputMessage;
    setInputMessage('');
    setIsLoading(true);

    try {
      // Llamar a la API del chatbot con IA
      const response = await api.post('/chatbot/chat/', {
        message: currentMessage
      });

      // Agregar mensaje de respuesta del bot
      const botMessage = {
        type: 'bot',
        text: response.data.response,
        timestamp: new Date(),
        movies: response.data.movies || null
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error al comunicarse con el chatbot:', error);

      // Mensaje de error amigable
      const errorMessage = {
        type: 'bot',
        text: 'Lo siento, tuve un problema al procesar tu mensaje. Por favor intenta de nuevo.',
        timestamp: new Date(),
        movies: null
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
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
    setIsOpen(false);
  };

  return (
    <>
      {/* Botón flotante */}
      <button
        className={`chat-float-button ${isOpen ? 'open' : ''}`}
        onClick={toggleChat}
        aria-label="Abrir chat de recomendaciones"
      >
        {isOpen ? (
          <span className="chat-icon-close">✕</span>
        ) : (
          <span className="chat-icon">💬</span>
        )}
      </button>

      {/* Ventana de chat */}
      {isOpen && (
        <div className="chat-window">
          {/* Header */}
          <div className="chat-header">
            <div className="chat-header-content">
              <div className="chat-avatar">🤖</div>
              <div className="chat-header-text">
                <h3>Asistente Netflix</h3>
                <span className="chat-status">En línea</span>
              </div>
            </div>
            <button className="chat-close-btn" onClick={toggleChat}>
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="chat-messages">
            {messages.map((message, index) => {
              const isLastBotMessage = message.type === 'bot' && index === messages.length - 1;
              return (
                <div
                  key={index}
                  className={`chat-message ${message.type}`}
                  ref={isLastBotMessage ? lastBotMessageRef : null}
                >
                  {message.type === 'bot' && (
                    <div className="message-avatar">🤖</div>
                  )}
                  <div className="message-content">
                  <div className="message-bubble">
                    {/* Renderizar texto intercalado con películas */}
                    {(() => {
                      if (!message.text) return null;

                      // Si hay películas y están marcadas para intercalar
                      if (message.movies && message.movies.length > 0) {
                        // Crear mapa de películas por ID
                        const moviesMap = {};
                        message.movies.forEach(movie => {
                          moviesMap[movie.id_pelicula] = movie;
                        });

                        // Dividir el texto por los marcadores [MOVIE_ID:X]
                        const parts = message.text.split(/(\[MOVIE_ID:\d+\])/);

                        return parts.map((part, index) => {
                          // Verificar si es un marcador de película
                          const match = part.match(/\[MOVIE_ID:(\d+)\]/);

                          if (match) {
                            const movieId = parseInt(match[1]);
                            const movie = moviesMap[movieId];

                            if (movie) {
                              return (
                                <div
                                  key={`movie-${index}`}
                                  className="recommendation-inline"
                                  onClick={() => handleMovieClick(movie.id_pelicula)}
                                >
                                  <div className="recommendation-inline-poster">
                                    {movie.miniatura ? (
                                      <img src={movie.miniatura} alt={movie.titulo} />
                                    ) : (
                                      <div className="recommendation-placeholder-inline">
                                        🎬
                                      </div>
                                    )}
                                  </div>
                                  <div className="recommendation-inline-info">
                                    <h4>{movie.titulo}</h4>
                                    {movie.ano_lanzamiento && (
                                      <span className="movie-year">({movie.ano_lanzamiento})</span>
                                    )}
                                    {movie.descripcion && (
                                      <p className="movie-description">{movie.descripcion}</p>
                                    )}
                                    {movie.generos && movie.generos.length > 0 && (
                                      <div className="movie-genres">
                                        {movie.generos.join(', ')}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          }

                          // Es texto normal
                          if (part.trim()) {
                            return <p key={`text-${index}`}>{part}</p>;
                          }
                          return null;
                        });
                      }

                      // Sin películas, solo mostrar el texto
                      return <p>{message.text}</p>;
                    })()}
                  </div>
                  <span className="message-time">
                    {message.timestamp.toLocaleTimeString('es-ES', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>
            );
            })}

            {isLoading && (
              <div className="chat-message bot">
                <div className="message-avatar">🤖</div>
                <div className="message-content">
                  <div className="message-bubble loading">
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="chat-input-container">
            <textarea
              className="chat-input"
              placeholder="Escribe qué tipo de películas buscas..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              rows={1}
            />
            <button
              className="chat-send-btn"
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
            >
              <span className="send-icon">➤</span>
            </button>
          </div>
        </div>
      )}

      {/* Modal de detalles de película */}
      {selectedMovie && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content-movie" onClick={(e) => e.stopPropagation()}>
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
    </>
  );
};

export default ChatBot;
