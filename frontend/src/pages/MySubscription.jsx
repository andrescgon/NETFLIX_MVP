import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { subscriptionService } from '../services/subscriptions';
import SubscriptionSkeleton from '../components/SubscriptionSkeleton';
import './MySubscription.css';

const MySubscription = () => {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadSubscription();
  }, []);

  const loadSubscription = async () => {
    try {
      setLoading(true);
      const data = await subscriptionService.getMySubscription();
      setSubscription(data);
    } catch (error) {
      console.error('Error cargando suscripción:', error);
      if (error.response?.status === 404) {
        setError('No tienes una suscripción activa');
      } else {
        setError('Error al cargar la suscripción');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status, isActive) => {
    if (isActive) {
      return <span className="status-badge active">Activa</span>;
    }
    if (status === 'pendiente') {
      return <span className="status-badge pending">Pendiente</span>;
    }
    if (status === 'cancelada') {
      return <span className="status-badge cancelled">Cancelada</span>;
    }
    return <span className="status-badge expired">Expirada</span>;
  };

  if (loading) {
    return <SubscriptionSkeleton />;
  }

  if (error || !subscription) {
    return (
      <div className="subscription-container">
        <div className="subscription-content">
          <div className="no-subscription">
            <h2>No tienes una suscripción activa</h2>
            <p>Suscríbete a un plan para acceder a todo el contenido premium</p>
            <button onClick={() => navigate('/plans')} className="btn-subscribe-now">
              Ver Planes
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="subscription-container">
      <div className="subscription-content">
        <h1>Mi Suscripción</h1>

        <div className="subscription-card">
          <div className="subscription-header">
            <div className="plan-info">
              <h2>{subscription.plan.nombre}</h2>
              {getStatusBadge(subscription.estado, subscription.esta_activa)}
            </div>
            <div className="plan-price">
              <span className="amount">${subscription.plan.precio}</span>
              <span className="period">/{subscription.plan.duracion_dias} días</span>
            </div>
          </div>

          <div className="subscription-details">
            <div className="detail-row">
              <span className="detail-label">Fecha de inicio:</span>
              <span className="detail-value">{formatDate(subscription.fecha_inicio)}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Fecha de finalización:</span>
              <span className="detail-value">{formatDate(subscription.fecha_fin)}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Estado:</span>
              <span className="detail-value">
                {subscription.esta_activa ? 'Activa' : subscription.estado}
              </span>
            </div>
          </div>

          <div className="subscription-benefits">
            <h3>Beneficios incluidos:</h3>
            <div className="benefits-list">
              <div className="benefit">
                <span className="benefit-icon">✓</span>
                <span>Películas ilimitadas</span>
              </div>
              <div className="benefit">
                <span className="benefit-icon">✓</span>
                <span>Hasta 3 perfiles</span>
              </div>
              <div className="benefit">
                <span className="benefit-icon">✓</span>
                <span>Calidad HD</span>
              </div>
              <div className="benefit">
                <span className="benefit-icon">✓</span>
                <span>Sin anuncios</span>
              </div>
            </div>
          </div>

          <div className="subscription-actions">
            <button onClick={() => navigate('/plans')} className="btn-change-plan">
              Cambiar Plan
            </button>
            <button onClick={() => navigate('/home')} className="btn-back">
              Volver al Inicio
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MySubscription;