import { useState, useEffect } from 'react';
import { getAllHistory } from '../../services/admin';
import { useToast } from '../../context/ToastContext';
import './Catalog.css';
import './AdminHistory.css';

const AdminHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const { showToast } = useToast();

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const result = await getAllHistory();
      if (result.success) {
        setHistory(result.data);
      } else {
        showToast('Error al cargar historial', 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      showToast('Error al conectar con el servidor', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filterByDate = (item) => {
    if (dateFilter === 'all') return true;

    const itemDate = new Date(item.fecha_visualizacion);
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

  const filteredHistory = history.filter(item => {
    const matchesSearch =
      item.pelicula?.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.perfil?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.usuario?.name?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch && filterByDate(item);
  });

  const formatDuration = (seconds) => {
    if (!seconds) return '0m 0s';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m ${secs}s`;
  };

  const getProgressPercentage = (segundosVistos, duracionTotal) => {
    if (!duracionTotal || duracionTotal === 0) return 0;
    const percentage = (segundosVistos / (duracionTotal * 60)) * 100;
    return Math.min(Math.round(percentage), 100);
  };

  const getProgressClass = (percentage) => {
    if (percentage >= 90) return 'progress-completed';
    if (percentage >= 50) return 'progress-halfway';
    return 'progress-started';
  };

  if (loading) {
    return (
      <div className="catalog-loading">
        <div className="spinner"></div>
        <p>Cargando historial...</p>
      </div>
    );
  }

  return (
    <div className="admin-history-page">
      <div className="actors-header">
        <div>
          <h1>Historial de Visualizaciones</h1>
          <p>Monitorea toda la actividad de visualización de la plataforma</p>
        </div>
        <div className="stats-summary">
          <div className="stat-card">
            <span className="stat-label">Total</span>
            <span className="stat-value">{history.length}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Hoy</span>
            <span className="stat-value stat-active">
              {history.filter(h => {
                const date = new Date(h.fecha_visualizacion);
                return date.toDateString() === new Date().toDateString();
              }).length}
            </span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Esta semana</span>
            <span className="stat-value stat-week">
              {history.filter(h => {
                const date = new Date(h.fecha_visualizacion);
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                return date >= weekAgo;
              }).length}
            </span>
          </div>
        </div>
      </div>

      <div className="actors-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="Buscar por película, perfil o usuario..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
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

      {filteredHistory.length === 0 ? (
        <div className="no-actors">
          <p>{searchTerm || dateFilter !== 'all' ? 'No se encontraron registros' : 'No hay historial de visualizaciones'}</p>
        </div>
      ) : (
        <div className="actors-table-container">
          <table className="actors-table">
            <thead>
              <tr>
                <th>Película</th>
                <th>Usuario</th>
                <th>Perfil</th>
                <th>Fecha</th>
                <th>Tiempo visto</th>
                <th>Progreso</th>
                <th>Completada</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.map((item, index) => {
                const progress = getProgressPercentage(item.segundos_vistos, item.pelicula?.duracion);
                return (
                  <tr key={`${item.id_historial || index}`}>
                    <td>
                      <div className="movie-info">
                        {item.pelicula?.miniatura && (
                          <img
                            src={item.pelicula.miniatura}
                            alt={item.pelicula.titulo}
                            className="movie-thumb"
                          />
                        )}
                        <span>{item.pelicula?.titulo || 'N/A'}</span>
                      </div>
                    </td>
                    <td>{item.usuario?.name || 'N/A'}</td>
                    <td>
                      <span className="profile-badge">
                        {item.perfil?.nombre || 'N/A'}
                      </span>
                    </td>
                    <td>
                      <div className="date-info">
                        <div>{new Date(item.fecha_visualizacion).toLocaleDateString('es-ES')}</div>
                        <small>{new Date(item.fecha_visualizacion).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</small>
                      </div>
                    </td>
                    <td>{formatDuration(item.segundos_vistos)}</td>
                    <td>
                      <div className="progress-container">
                        <div className="progress-bar">
                          <div
                            className={`progress-fill ${getProgressClass(progress)}`}
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                        <span className="progress-text">{progress}%</span>
                      </div>
                    </td>
                    <td>
                      {item.completada ? (
                        <span className="completed-badge">✓ Sí</span>
                      ) : (
                        <span className="incomplete-badge">— No</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminHistory;
