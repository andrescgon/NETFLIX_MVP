import { useState, useEffect } from 'react';
import { getDashboardStats } from '../../services/admin';
import { useToast } from '../../context/ToastContext';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState({
    total_movies: 0,
    total_users: 0,
    active_subscriptions: 0,
    total_revenue: 0,
    active_users: 0,
    new_users_this_month: 0,
    revenue_this_month: 0,
    top_movies: [],
    subscriptions_by_plan: [],
  });
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const result = await getDashboardStats();

      if (result.success) {
        setStats(result.data);
      } else {
        showToast('Error al cargar estadísticas', 'error');
      }
    } catch (error) {
      console.error('Error al cargar datos del dashboard:', error);
      showToast('Error al conectar con el servidor', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Cargando dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard de Administración</h1>
        <p>Bienvenido al panel de control de Netflix MVP</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🎬</div>
          <div className="stat-content">
            <h3>Total Películas</h3>
            <p className="stat-number">{stats.total_movies}</p>
            <span className="stat-label">películas en catálogo</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>Total Usuarios</h3>
            <p className="stat-number">{stats.total_users}</p>
            <span className="stat-label">usuarios registrados</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <h3>Suscripciones Activas</h3>
            <p className="stat-number">{stats.active_subscriptions}</p>
            <span className="stat-label">suscripciones activas</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>Ingresos Totales</h3>
            <p className="stat-number">
              ${stats.total_revenue.toLocaleString('es-CO')}
            </p>
            <span className="stat-label">pesos colombianos</span>
          </div>
        </div>
      </div>

      {/* Estadísticas adicionales */}
      <div className="stats-grid secondary-stats">
        <div className="stat-card secondary">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>Usuarios Activos</h3>
            <p className="stat-number">{stats.active_users}</p>
            <span className="stat-label">con suscripción activa</span>
          </div>
        </div>

        <div className="stat-card secondary">
          <div className="stat-icon">🆕</div>
          <div className="stat-content">
            <h3>Nuevos Este Mes</h3>
            <p className="stat-number">{stats.new_users_this_month}</p>
            <span className="stat-label">usuarios nuevos</span>
          </div>
        </div>

        <div className="stat-card secondary">
          <div className="stat-icon">💵</div>
          <div className="stat-content">
            <h3>Ingresos del Mes</h3>
            <p className="stat-number">
              ${stats.revenue_this_month.toLocaleString('es-CO')}
            </p>
            <span className="stat-label">pesos colombianos</span>
          </div>
        </div>
      </div>

      {/* Películas más vistas */}
      {stats.top_movies && stats.top_movies.length > 0 && (
        <div className="dashboard-section">
          <div className="section-card">
            <h2>🏆 Películas Más Vistas</h2>
            <div className="top-movies-list">
              {stats.top_movies.slice(0, 5).map((movie, index) => (
                <div key={movie.id} className="top-movie-item">
                  <div className="movie-rank">#{index + 1}</div>
                  <div className="movie-info">
                    <span className="movie-title">{movie.title}</span>
                    <span className="movie-views">{movie.views} visualizaciones</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Distribución de suscripciones */}
      {stats.subscriptions_by_plan && stats.subscriptions_by_plan.length > 0 && (
        <div className="dashboard-section">
          <div className="section-card">
            <h2>📊 Suscripciones por Plan</h2>
            <div className="subscriptions-list">
              {stats.subscriptions_by_plan.map((item, index) => (
                <div key={index} className="subscription-item">
                  <div className="subscription-bar-container">
                    <div className="subscription-info">
                      <span className="plan-name">{item.plan__nombre}</span>
                      <span className="plan-count">{item.count} suscripciones</span>
                    </div>
                    <div className="subscription-bar">
                      <div
                        className="subscription-bar-fill"
                        style={{
                          width: `${(item.count / stats.active_subscriptions) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="dashboard-info">
        <div className="info-card">
          <h2>Accesos Rápidos</h2>
          <div className="quick-links">
            <button className="quick-link-btn" onClick={() => (window.location.href = '/admin/movies')}>
              <span className="quick-link-icon">🎬</span>
              <span>Gestionar Películas</span>
            </button>
            <button className="quick-link-btn" onClick={() => (window.location.href = '/admin/users')}>
              <span className="quick-link-icon">👥</span>
              <span>Gestionar Usuarios</span>
            </button>
            <button className="quick-link-btn" onClick={() => (window.location.href = '/admin/plans')}>
              <span className="quick-link-icon">💳</span>
              <span>Gestionar Planes</span>
            </button>
            <button className="quick-link-btn" onClick={() => (window.location.href = '/admin/subscriptions')}>
              <span className="quick-link-icon">📋</span>
              <span>Ver Suscripciones</span>
            </button>
          </div>
        </div>

        <div className="info-card">
          <h2>Estado del Sistema</h2>
          <div className="system-status">
            <div className="status-item">
              <span className="status-indicator status-ok"></span>
              <span>API Backend: Operativo</span>
            </div>
            <div className="status-item">
              <span className="status-indicator status-ok"></span>
              <span>Base de Datos: Conectada</span>
            </div>
            <div className="status-item">
              <span className="status-indicator status-ok"></span>
              <span>Servidor de Streaming: Activo</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
