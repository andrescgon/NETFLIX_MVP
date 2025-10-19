import { useState, useEffect } from 'react';
import { getPayments } from '../../services/admin';
import { useToast } from '../../context/ToastContext';
import './Catalog.css';
import './Payments.css';

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const { showToast } = useToast();

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    setLoading(true);
    try {
      // MOCK DATA - El endpoint de pagos está comentado en el backend
      // Cuando esté disponible, descomentar y usar: const result = await getPayments();

      // Datos de ejemplo para la interfaz
      const mockPayments = [
        {
          id_pago: 1,
          id_transaccion: 'MP-2025-001-ABC123',
          usuario: { name: 'Juan Pérez', email: 'juan@example.com' },
          suscripcion: { plan: { nombre: 'Premium' } },
          metodo_pago: 'Tarjeta',
          monto: '29.99',
          estado: 'completado',
          fecha: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        },
        {
          id_pago: 2,
          id_transaccion: 'MP-2025-002-DEF456',
          usuario: { name: 'María García', email: 'maria@example.com' },
          suscripcion: { plan: { nombre: 'Estándar' } },
          metodo_pago: 'PayPal',
          monto: '19.99',
          estado: 'completado',
          fecha: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
        },
        {
          id_pago: 3,
          id_transaccion: 'MP-2025-003-GHI789',
          usuario: { name: 'Carlos López', email: 'carlos@example.com' },
          suscripcion: { plan: { nombre: 'Básico' } },
          metodo_pago: 'Transferencia',
          monto: '9.99',
          estado: 'pendiente',
          fecha: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        }
      ];

      setPayments(mockPayments);

      // Cuando el backend esté listo, usar esto en lugar del mock:
      // if (result.success) {
      //   setPayments(result.data);
      // } else {
      //   showToast('Error al cargar pagos', 'error');
      // }
    } catch (error) {
      console.error('Error:', error);
      // showToast('Error al conectar con el servidor', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filterByDate = (item) => {
    if (dateFilter === 'all') return true;

    const itemDate = new Date(item.fecha);
    const now = new Date();

    switch (dateFilter) {
      case 'today':
        return itemDate.toDateString() === now.toDateString();
      case 'week':
        const weekAgo = new Date(now.setDate(now.getDate() - 7));
        return itemDate >= weekAgo;
      case 'month':
        const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
        return itemDate >= monthAgo;
      default:
        return true;
    }
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch =
      payment.usuario?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.usuario?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.id_transaccion?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || payment.estado === statusFilter;

    return matchesSearch && matchesStatus && filterByDate(payment);
  });

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'completado': return 'payment-completed';
      case 'pendiente': return 'payment-pending';
      case 'fallido': return 'payment-failed';
      case 'reembolsado': return 'payment-refunded';
      default: return '';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'completado': return 'Completado';
      case 'pendiente': return 'Pendiente';
      case 'fallido': return 'Fallido';
      case 'reembolsado': return 'Reembolsado';
      default: return status;
    }
  };

  const getMethodIcon = (method) => {
    switch (method?.toLowerCase()) {
      case 'tarjeta': return '💳';
      case 'paypal': return '🅿️';
      case 'transferencia': return '🏦';
      default: return '💰';
    }
  };

  const calculateTotals = () => {
    const total = filteredPayments.reduce((sum, p) => sum + (parseFloat(p.monto) || 0), 0);
    const completados = filteredPayments
      .filter(p => p.estado === 'completado')
      .reduce((sum, p) => sum + (parseFloat(p.monto) || 0), 0);

    return { total, completados };
  };

  const totals = calculateTotals();

  if (loading) {
    return (
      <div className="catalog-loading">
        <div className="spinner"></div>
        <p>Cargando pagos...</p>
      </div>
    );
  }

  return (
    <div className="payments-page">
      <div className="actors-header">
        <div>
          <h1>Gestión de Pagos</h1>
          <p>Monitorea todas las transacciones de la plataforma</p>
        </div>
        <div className="stats-summary">
          <div className="stat-card">
            <span className="stat-label">Total Transacciones</span>
            <span className="stat-value">{payments.length}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Completados</span>
            <span className="stat-value stat-active">
              {payments.filter(p => p.estado === 'completado').length}
            </span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Ingresos</span>
            <span className="stat-value stat-money">
              ${totals.completados.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      <div className="actors-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="Buscar por usuario, email o ID de transacción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>
        <div className="filters-row">
          <div className="filter-group">
            <label>Estado:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">Todos</option>
              <option value="completado">Completados</option>
              <option value="pendiente">Pendientes</option>
              <option value="fallido">Fallidos</option>
              <option value="reembolsado">Reembolsados</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Período:</label>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">Todo el tiempo</option>
              <option value="today">Hoy</option>
              <option value="week">Última semana</option>
              <option value="month">Último mes</option>
            </select>
          </div>
        </div>
      </div>

      {filteredPayments.length === 0 ? (
        <div className="no-actors">
          <p>{searchTerm || statusFilter !== 'all' || dateFilter !== 'all' ? 'No se encontraron pagos' : 'No hay pagos registrados'}</p>
        </div>
      ) : (
        <div className="actors-table-container">
          <table className="actors-table">
            <thead>
              <tr>
                <th>ID Transacción</th>
                <th>Usuario</th>
                <th>Email</th>
                <th>Suscripción</th>
                <th>Método</th>
                <th>Monto</th>
                <th>Estado</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map((payment) => (
                <tr key={payment.id_pago}>
                  <td>
                    <code className="transaction-id">
                      {payment.id_transaccion || `PAY-${payment.id_pago}`}
                    </code>
                  </td>
                  <td>{payment.usuario?.name || 'N/A'}</td>
                  <td>{payment.usuario?.email || 'N/A'}</td>
                  <td>
                    {payment.suscripcion?.plan?.nombre ? (
                      <span className="plan-badge">
                        {payment.suscripcion.plan.nombre}
                      </span>
                    ) : (
                      <span className="no-data">—</span>
                    )}
                  </td>
                  <td>
                    <span className="method-badge">
                      {getMethodIcon(payment.metodo_pago)} {payment.metodo_pago || 'N/A'}
                    </span>
                  </td>
                  <td>
                    <span className="amount-value">
                      ${parseFloat(payment.monto || 0).toFixed(2)}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${getStatusBadgeClass(payment.estado)}`}>
                      {getStatusLabel(payment.estado)}
                    </span>
                  </td>
                  <td>
                    <div className="date-info">
                      <div>{new Date(payment.fecha).toLocaleDateString('es-ES')}</div>
                      <small>{new Date(payment.fecha).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</small>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {filteredPayments.length > 0 && (
        <div className="payments-summary">
          <div className="summary-card">
            <span className="summary-label">Total filtrado:</span>
            <span className="summary-value">${totals.total.toFixed(2)}</span>
          </div>
          <div className="summary-card">
            <span className="summary-label">Completados filtrado:</span>
            <span className="summary-value stat-active">${totals.completados.toFixed(2)}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payments;
