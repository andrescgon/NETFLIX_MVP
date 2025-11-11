import { useState, useEffect } from 'react';
import { getAllSubscriptions, cancelSubscription } from '../../services/admin';
import { useToast } from '../../context/ToastContext';
import './Catalog.css';
import './Subscriptions.css';

const Subscriptions = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [cancelConfirm, setCancelConfirm] = useState(null);
  const { showToast } = useToast();

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const loadSubscriptions = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getAllSubscriptions();
      console.log('Subscriptions result:', result);

      if (result.success && Array.isArray(result.data)) {
        setSubscriptions(result.data);
      } else {
        console.error('Error en respuesta:', result);
        setError('Error al cargar suscripciones');
        showToast('Error al cargar suscripciones', 'error');
        setSubscriptions([]);
      }
    } catch (error) {
      console.error('Error al cargar suscripciones:', error);
      setError(error.message || 'Error desconocido');
      showToast('Error al conectar con el servidor', 'error');
      setSubscriptions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async (subscriptionId, userName) => {
    setCancelConfirm(null);

    try {
      const result = await cancelSubscription(subscriptionId);
      if (result.success) {
        setSubscriptions(prev => prev.map(sub =>
          sub.id_suscripcion === subscriptionId
            ? { ...sub, estado: 'cancelada' }
            : sub
        ));

        showToast(`Suscripción de "${userName}" cancelada correctamente`, 'success');
        loadSubscriptions();
      } else {
        const errorMsg = result.error?.detail || result.error || 'Error al cancelar suscripción';
        showToast(errorMsg, 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      showToast('Error al cancelar suscripción', 'error');
    }
  };

  const filteredSubscriptions = subscriptions.filter(sub => {
    const matchesSearch = sub.usuario?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.usuario?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.plan?.nombre?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || sub.estado === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'activa': return 'status-active';
      case 'cancelada': return 'status-cancelled';
      case 'vencida': return 'status-expired';
      case 'expirada': return 'status-expired';
      case 'suspendida': return 'status-suspended';
      default: return '';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'activa': return 'Activa';
      case 'cancelada': return 'Cancelada';
      case 'vencida': return 'Vencida';
      case 'expirada': return 'Expirada';
      case 'suspendida': return 'Suspendida';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="catalog-loading">
        <div className="spinner"></div>
        <p>Cargando suscripciones...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="catalog-loading">
        <p style={{ color: '#e50914' }}>Error: {error}</p>
        <button onClick={loadSubscriptions} className="btn-submit">Reintentar</button>
      </div>
    );
  }

  return (
    <div className="subscriptions-page">
      <div className="actors-header">
        <div>
          <h1>Gestión de Suscripciones</h1>
          <p>Administra todas las suscripciones de la plataforma</p>
        </div>
        <div className="stats-summary">
          <div className="stat-card">
            <span className="stat-label">Total</span>
            <span className="stat-value">{subscriptions.length}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Activas</span>
            <span className="stat-value stat-active">
              {subscriptions.filter(s => s.estado === 'activa').length}
            </span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Canceladas</span>
            <span className="stat-value stat-cancelled">
              {subscriptions.filter(s => s.estado === 'cancelada').length}
            </span>
          </div>
        </div>
      </div>

      <div className="actors-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="Buscar por usuario, email o plan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>
        <div className="filter-group">
          <label>Estado:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">Todos</option>
            <option value="activa">Activas</option>
            <option value="cancelada">Canceladas</option>
            <option value="vencida">Vencidas</option>
            <option value="expirada">Expiradas</option>
            <option value="suspendida">Suspendidas</option>
          </select>
        </div>
      </div>

      {filteredSubscriptions.length === 0 ? (
        <div className="no-actors">
          <p>{searchTerm || statusFilter !== 'all' ? 'No se encontraron suscripciones' : 'No hay suscripciones registradas'}</p>
        </div>
      ) : (
        <div className="actors-table-container">
          <table className="actors-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Usuario</th>
                <th>Email</th>
                <th>Plan</th>
                <th>Estado</th>
                <th>Inicio</th>
                <th>Fin</th>
                <th>Precio</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubscriptions.map((subscription) => (
                <tr key={subscription.id_suscripcion}>
                  <td>{subscription.id_suscripcion}</td>
                  <td>{subscription.usuario?.name || 'N/A'}</td>
                  <td>{subscription.usuario?.email || 'N/A'}</td>
                  <td>
                    <span className="plan-badge">
                      {subscription.plan?.nombre || 'N/A'}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${getStatusBadgeClass(subscription.estado)}`}>
                      {getStatusLabel(subscription.estado)}
                    </span>
                  </td>
                  <td>{new Date(subscription.fecha_inicio).toLocaleDateString('es-ES')}</td>
                  <td>{new Date(subscription.fecha_fin).toLocaleDateString('es-ES')}</td>
                  <td>${Number(subscription.plan?.precio || 0).toFixed(2)}</td>
                  <td>
                    <div className="action-buttons">
                      {subscription.estado === 'activa' && (
                        <button
                          className="btn-cancel-sub"
                          onClick={() => setCancelConfirm(subscription)}
                          title="Cancelar suscripción"
                        >
                          ❌
                        </button>
                      )}
                      {subscription.estado !== 'activa' && (
                        <span className="no-actions">—</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de confirmación de cancelación */}
      {cancelConfirm && (
        <div className="modal-overlay" onClick={() => setCancelConfirm(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>¿Cancelar Suscripción?</h2>
            <p>
              ¿Estás seguro de que deseas cancelar la suscripción de{' '}
              <strong>{cancelConfirm.usuario?.name}</strong>?
            </p>
            <p className="subscription-info">
              Plan: <strong>{cancelConfirm.plan?.nombre}</strong>
              <br />
              Fecha de fin: <strong>{new Date(cancelConfirm.fecha_fin).toLocaleDateString('es-ES')}</strong>
            </p>
            <p className="warning-text">
              Esta acción no se puede deshacer. El usuario perderá acceso al finalizar el período actual.
            </p>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setCancelConfirm(null)}>
                Volver
              </button>
              <button
                className="btn-confirm-delete"
                onClick={() => handleCancelSubscription(cancelConfirm.id_suscripcion, cancelConfirm.usuario?.name)}
              >
                Cancelar Suscripción
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Subscriptions;
