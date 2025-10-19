import { useNavigate } from 'react-router-dom';
import './NotFound.css';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="not-found-container">
      <div className="not-found-content fade-in-up">
        <div className="error-code">404</div>
        <h1>Página no encontrada</h1>
        <p className="error-message">
          Lo sentimos, la página que buscas no existe o ha sido movida.
        </p>
        <div className="error-actions">
          <button onClick={() => navigate('/home')} className="btn-home">
            Ir al inicio
          </button>
          <button onClick={() => navigate(-1)} className="btn-back">
            Volver atrás
          </button>
        </div>
      </div>
      <div className="error-illustration">
        <div className="film-strip">
          <div className="film-frame"></div>
          <div className="film-frame"></div>
          <div className="film-frame"></div>
          <div className="film-frame active"></div>
          <div className="film-frame"></div>
          <div className="film-frame"></div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;