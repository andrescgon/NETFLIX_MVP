import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
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
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const getRandomMovies = async () => {
    try {
      // Obtener películas aleatorias del catálogo
      const response = await api.get('/contenido/peliculas/');
      const allMovies = response.data;

      // Seleccionar 5 películas aleatorias
      const shuffled = allMovies.sort(() => 0.5 - Math.random());
      return shuffled.slice(0, 5);
    } catch (error) {
      console.error('Error fetching movies:', error);
      return [];
    }
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
    setInputMessage('');
    setIsLoading(true);

    // Simular delay de IA
    setTimeout(async () => {
      // Obtener películas aleatorias
      const randomMovies = await getRandomMovies();

      // Agregar mensaje de respuesta del bot
      const botMessage = {
        type: 'bot',
        text: '¡Excelente elección! Basándome en tus preferencias, te recomiendo estas películas:',
        timestamp: new Date(),
        movies: randomMovies
      };

      setMessages(prev => [...prev, botMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleMovieClick = (movieId) => {
    navigate(`/player/${movieId}`);
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
            {messages.map((message, index) => (
              <div key={index} className={`chat-message ${message.type}`}>
                {message.type === 'bot' && (
                  <div className="message-avatar">🤖</div>
                )}
                <div className="message-content">
                  <div className="message-bubble">
                    <p>{message.text}</p>
                    {message.movies && message.movies.length > 0 && (
                      <div className="movie-recommendations">
                        {message.movies.map((movie) => (
                          <div
                            key={movie.id_pelicula}
                            className="recommendation-card"
                            onClick={() => handleMovieClick(movie.id_pelicula)}
                          >
                            <div className="recommendation-poster">
                              {movie.miniatura ? (
                                <img src={movie.miniatura} alt={movie.titulo} />
                              ) : (
                                <div className="recommendation-placeholder">
                                  🎬
                                </div>
                              )}
                            </div>
                            <div className="recommendation-info">
                              <h4>{movie.titulo}</h4>
                              {movie.ano_lanzamiento && (
                                <span className="recommendation-year">{movie.ano_lanzamiento}</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <span className="message-time">
                    {message.timestamp.toLocaleTimeString('es-ES', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>
            ))}

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
    </>
  );
};

export default ChatBot;
