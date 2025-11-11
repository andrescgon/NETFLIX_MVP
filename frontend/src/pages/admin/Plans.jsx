import { useState, useEffect } from 'react';
import { getPlansAdmin, createPlan, updatePlan, deletePlan } from '../../services/admin';
import { useToast } from '../../context/ToastContext';
import './Plans.css';

const Plans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    nombre: '',
    precio: '',
    duracion_dias: 30
  });

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    setLoading(true);
    try {
      const result = await getPlansAdmin();
      if (result.success) {
        setPlans(result.data);
      } else {
        showToast('Error al cargar planes', 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      showToast('Error al cargar planes', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (plan = null) => {
    if (plan) {
      setEditingPlan(plan);
      setFormData({
        nombre: plan.nombre,
        precio: plan.precio,
        duracion_dias: plan.duracion_dias
      });
    } else {
      setEditingPlan(null);
      setFormData({
        nombre: '',
        precio: '',
        duracion_dias: 30
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingPlan(null);
    setFormData({
      nombre: '',
      precio: '',
      duracion_dias: 30
    });
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.nombre.trim()) {
      showToast('El nombre es obligatorio', 'error');
      return;
    }

    if (!formData.precio || parseFloat(formData.precio) <= 0) {
      showToast('El precio debe ser mayor a 0', 'error');
      return;
    }

    if (!formData.duracion_dias || parseInt(formData.duracion_dias) <= 0) {
      showToast('La duración debe ser mayor a 0', 'error');
      return;
    }

    try {
      const planData = {
        nombre: formData.nombre.trim(),
        precio: parseFloat(formData.precio),
        duracion_dias: parseInt(formData.duracion_dias)
      };

      if (editingPlan) {
        const result = await updatePlan(editingPlan.id, planData);

        if (result.success) {
          // Actualización optimista
          setPlans(prev => prev.map(plan =>
            plan.id === result.data.id ? result.data : plan
          ));
          handleCloseModal();
          showToast('Plan actualizado correctamente', 'success');

          // Sincronizar en segundo plano
          loadPlans();
        } else {
          const errorMsg = result.error?.detail || result.error || 'Error al actualizar plan';
          showToast(errorMsg, 'error');
        }
      } else {
        const result = await createPlan(planData);

        if (result.success) {
          // Actualización optimista
          setPlans(prev => [...prev, result.data]);
          handleCloseModal();
          showToast('Plan creado correctamente', 'success');

          // Sincronizar en segundo plano
          loadPlans();
        } else {
          const errorMsg = result.error?.detail || result.error || 'Error al crear plan';
          showToast(errorMsg, 'error');
        }
      }
    } catch (error) {
      console.error('Error:', error);
      showToast('Error al procesar solicitud', 'error');
    }
  };

  const handleDelete = async (planId, planName) => {
    setDeleteConfirm(null);

    try {
      const result = await deletePlan(planId);
      if (result.success) {
        // Actualización optimista
        setPlans(prev => prev.filter(plan => plan.id !== planId));
        showToast(`Plan "${planName}" eliminado correctamente`, 'success');

        // Sincronizar en segundo plano
        loadPlans();
      } else {
        const errorMsg = result.error?.detail || result.error || 'Error al eliminar plan';
        showToast(errorMsg, 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      showToast('Error al eliminar plan', 'error');
    }
  };

  if (loading) {
    return (
      <div className="actors-loading">
        <div className="spinner"></div>
        <p>Cargando planes...</p>
      </div>
    );
  }

  return (
    <div className="actors-page">
      <div className="actors-header">
        <h1>Gestión de Planes de Suscripción</h1>
        <p>Administra los planes disponibles para los usuarios</p>
      </div>

      <div className="actors-controls">
        <button className="btn-create" onClick={() => handleOpenModal()}>
          + Nuevo Plan
        </button>
      </div>

      {plans.length === 0 ? (
        <div className="no-actors">
          <p>No hay planes creados</p>
          <button className="btn-add-first" onClick={() => handleOpenModal()}>
            Crear Primer Plan
          </button>
        </div>
      ) : (
        <div className="actors-table-container">
          <table className="actors-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Precio (COP)</th>
                <th>Duración</th>
                <th>Precio/Día</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {plans.map((plan) => {
                const precioPorDia = (parseFloat(plan.precio) / parseInt(plan.duracion_dias)).toFixed(2);
                return (
                  <tr key={plan.id}>
                    <td>{plan.id}</td>
                    <td><strong>{plan.nombre}</strong></td>
                    <td>${parseFloat(plan.precio).toLocaleString('es-CO')}</td>
                    <td>{plan.duracion_dias} días</td>
                    <td>${precioPorDia}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-edit"
                          onClick={() => handleOpenModal(plan)}
                          title="Editar"
                        >
                          ✏️
                        </button>
                        <button
                          className="btn-delete"
                          onClick={() => setDeleteConfirm(plan)}
                          title="Eliminar"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de creación/edición */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editingPlan ? 'Editar Plan' : 'Nuevo Plan'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="nombre">Nombre del Plan *</label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleFormChange}
                  required
                  className="form-input"
                  placeholder="Ej: Plan Básico, Premium, etc."
                />
              </div>

              <div className="form-group">
                <label htmlFor="precio">Precio (COP) *</label>
                <input
                  type="number"
                  id="precio"
                  name="precio"
                  value={formData.precio}
                  onChange={handleFormChange}
                  required
                  min="0"
                  step="0.01"
                  className="form-input"
                  placeholder="Ej: 15000"
                />
              </div>

              <div className="form-group">
                <label htmlFor="duracion_dias">Duración (días) *</label>
                <input
                  type="number"
                  id="duracion_dias"
                  name="duracion_dias"
                  value={formData.duracion_dias}
                  onChange={handleFormChange}
                  required
                  min="1"
                  className="form-input"
                  placeholder="Ej: 30"
                />
                <small style={{ color: '#999', fontSize: '0.85rem', display: 'block', marginTop: '0.5rem' }}>
                  Duración en días (30 = 1 mes, 365 = 1 año)
                </small>
              </div>

              {formData.precio && formData.duracion_dias && (
                <div style={{
                  background: '#1a1a1a',
                  padding: '1rem',
                  borderRadius: '8px',
                  marginBottom: '1rem',
                  border: '1px solid #333'
                }}>
                  <p style={{ margin: 0, color: '#999', fontSize: '0.9rem' }}>
                    <strong>Precio por día:</strong> ${(parseFloat(formData.precio) / parseInt(formData.duracion_dias)).toFixed(2)} COP
                  </p>
                </div>
              )}

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={handleCloseModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn-submit">
                  {editingPlan ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>¿Eliminar Plan?</h2>
            <p>
              ¿Estás seguro de que deseas eliminar el plan <strong>{deleteConfirm.nombre}</strong>?
            </p>
            <p className="warning-text">
              Esta acción no se puede deshacer. Los usuarios con suscripciones activas de este plan no se verán afectados.
            </p>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setDeleteConfirm(null)}>
                Cancelar
              </button>
              <button
                className="btn-confirm-delete"
                onClick={() => handleDelete(deleteConfirm.id, deleteConfirm.nombre)}
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Plans;
