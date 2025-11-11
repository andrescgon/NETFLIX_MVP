import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { subscriptionService } from '../services/subscriptions';
import { useToast } from '../context/ToastContext';
import PlansSkeleton from '../components/PlansSkeleton';
import ConfirmDialog from '../components/ConfirmDialog';
import './Plans.css';

const Plans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [subscribing, setSubscribing] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null);
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const data = await subscriptionService.getPlans();
      setPlans(data);
    } catch (error) {
      console.error('Error cargando planes:', error);
      setError('Error al cargar los planes');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = (planId) => {
    const plan = plans.find(p => p.id === planId);
    setConfirmDialog({
      planId,
      planName: plan?.nombre || 'este plan'
    });
  };

  const confirmSubscribe = async () => {
    const planId = confirmDialog.planId;
    setConfirmDialog(null);

    try {
      setSubscribing(planId);
      await subscriptionService.subscribe(planId);
      toast.success('¡Suscripción exitosa! Ahora puedes disfrutar del contenido.');
      navigate('/subscription');
    } catch (error) {
      console.error('Error al suscribirse:', error);
      toast.error(error.response?.data?.detail || 'Error al suscribirse');
    } finally {
      setSubscribing(null);
    }
  };

  if (loading) {
    return <PlansSkeleton />;
  }

  if (error) {
    return (
      <div className="plans-container">
        <div className="plans-error">{error}</div>
      </div>
    );
  }

  return (
    <>
      <div className="plans-container">
        <div className="plans-content">
          <h1>Elige el plan perfecto para ti</h1>
          <p className="plans-subtitle">
            Disfruta de películas ilimitadas con cualquiera de nuestros planes
          </p>

          <div className="plans-grid">
            {plans.map((plan) => (
              <div key={plan.id} className="plan-card">
                <div className="plan-header">
                  <h2>{plan.nombre}</h2>
                  <div className="plan-price">
                    <span className="currency">$</span>
                    <span className="amount">{plan.precio}</span>
                    <span className="period">/{plan.duracion_dias} días</span>
                  </div>
                </div>

                <div className="plan-features">
                  <div className="feature">
                    <span className="feature-icon">✓</span>
                    <span>Películas ilimitadas</span>
                  </div>
                  <div className="feature">
                    <span className="feature-icon">✓</span>
                    <span>Hasta 3 perfiles</span>
                  </div>
                  <div className="feature">
                    <span className="feature-icon">✓</span>
                    <span>Calidad HD</span>
                  </div>
                  <div className="feature">
                    <span className="feature-icon">✓</span>
                    <span>Acceso desde cualquier dispositivo</span>
                  </div>
                </div>

                <button
                  className="btn-subscribe"
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={subscribing === plan.id}
                >
                  {subscribing === plan.id ? 'Procesando...' : 'Suscribirse'}
                </button>
              </div>
            ))}
          </div>

          <div className="plans-footer">
            <button onClick={() => navigate('/home')} className="btn-back-home">
              Volver al inicio
            </button>
          </div>
        </div>
      </div>

      {confirmDialog && (
        <ConfirmDialog
          title="Confirmar suscripción"
          message={`¿Estás seguro de que deseas suscribirte a ${confirmDialog.planName}?`}
          confirmText="Suscribirse"
          cancelText="Cancelar"
          onConfirm={confirmSubscribe}
          onCancel={() => setConfirmDialog(null)}
        />
      )}
    </>
  );
};

export default Plans;