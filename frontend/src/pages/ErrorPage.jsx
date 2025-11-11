import { useNavigate } from 'react-router-dom';
import './ErrorPage.css';

const ErrorPage = ({ code = '500', title = 'Error del servidor', message = 'Algo salió mal. Por favor, intenta nuevamente más tarde.' }) => {
  const navigate = useNavigate();

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="error-page-container">
      <div className="error-page-content fade-in-up">
        <div className="error-icon">⚠</div>
        <div className="error-code-large">{code}</div>
        <h1>{title}</h1>
        <p className="error-description">
          {message}
        </p>
        <div className="error-page-actions">
          <button onClick={handleRefresh} className="btn-refresh">
            Recargar página
          </button>
          <button onClick={() => navigate('/home')} className="btn-home-error">
            Ir al inicio
          </button>
        </div>
      </div>
      <div className="error-background">
        <div className="error-circle circle-1"></div>
        <div className="error-circle circle-2"></div>
        <div className="error-circle circle-3"></div>
      </div>
    </div>
  );
};

export default ErrorPage;