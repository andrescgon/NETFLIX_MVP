import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  getMovieDetailAdmin,
  getMediaAssets,
  createMediaAsset,
  deleteMediaAsset
} from '../../services/admin';
import { useToast } from '../../context/ToastContext';
import './MovieAssets.css';

const MovieAssets = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [movie, setMovie] = useState(null);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [playingVideo, setPlayingVideo] = useState(null);

  const [uploadForm, setUploadForm] = useState({
    calidad: '1080p',
    es_trailer: false,
    archivo: null
  });

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [movieResult, assetsResult] = await Promise.all([
        getMovieDetailAdmin(id),
        getMediaAssets({ pelicula_id: id })
      ]);

      if (movieResult.success) {
        setMovie(movieResult.data);
      } else {
        showToast('Error al cargar película', 'error');
        navigate('/admin/movies');
        return;
      }

      if (assetsResult.success) {
        setAssets(assetsResult.data);
      }
    } catch (error) {
      console.error('Error:', error);
      showToast('Error al cargar datos', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadFormChange = (e) => {
    const { name, value } = e.target;
    setUploadForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadForm(prev => ({
        ...prev,
        archivo: file
      }));
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!uploadForm.archivo) {
      showToast('Por favor selecciona un archivo', 'error');
      return;
    }

    // Verificar si ya existe un video completo (no trailer)
    const videoCompleto = assets.find(asset => !asset.es_trailer);
    if (!uploadForm.es_trailer && videoCompleto) {
      showToast('Ya existe un video completo para esta película. Elimínalo primero si deseas subir otro.', 'error');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('pelicula_id', id);
      formData.append('calidad', uploadForm.calidad);
      formData.append('es_trailer', uploadForm.es_trailer);
      formData.append('archivo', uploadForm.archivo);

      // Simular progreso de subida
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      const result = await createMediaAsset(formData);

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (result.success) {
        // Actualización optimista: agregar el nuevo asset inmediatamente
        setAssets(prev => [...prev, result.data]);

        // Cerrar modal y resetear formulario
        setShowUploadModal(false);
        setUploadForm({
          calidad: '1080p',
          es_trailer: false,
          archivo: null
        });

        showToast('Video subido correctamente', 'success');

        // Recargar en segundo plano para sincronizar
        loadData();
      } else {
        const errorMsg = result.error?.detail || result.error || 'Error al subir archivo';
        showToast(errorMsg, 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      showToast('Error al subir archivo', 'error');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async (assetId) => {
    const assetName = deleteConfirm.archivo ? deleteConfirm.archivo.split('/').pop() : 'Video';
    setDeleteConfirm(null);

    try {
      const result = await deleteMediaAsset(assetId);
      if (result.success) {
        // Actualización optimista: eliminar del estado inmediatamente
        setAssets(prev => prev.filter(asset => asset.id !== assetId));
        showToast(`Video eliminado correctamente`, 'success');

        // Recargar en segundo plano para sincronizar
        loadData();
      } else {
        const errorMsg = result.error?.detail || result.error || 'Error al eliminar';
        showToast(errorMsg, 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      showToast('Error al eliminar video', 'error');
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  };

  const getAssetIcon = (tipo) => {
    switch (tipo) {
      case 'video':
        return '🎬';
      case 'subtitulos':
        return '📝';
      case 'audio':
        return '🎵';
      default:
        return '📄';
    }
  };

  if (loading) {
    return (
      <div className="assets-loading">
        <div className="spinner"></div>
        <p>Cargando archivos...</p>
      </div>
    );
  }

  // Verificar si ya existe un video completo (no trailer)
  const videoCompleto = assets.find(asset => !asset.es_trailer);
  const puedeSubirVideo = !videoCompleto;

  const handleOpenUploadModal = () => {
    if (!puedeSubirVideo) {
      showToast('Ya existe un video completo para esta película. Elimínalo primero si deseas subir otro.', 'error');
      return;
    }
    setShowUploadModal(true);
  };

  return (
    <div className="movie-assets-page">
      <div className="assets-header">
        <button className="btn-back" onClick={() => navigate('/admin/movies')}>
          ← Volver
        </button>
        <div className="assets-header-info">
          <h1>Gestionar Videos y Archivos</h1>
          {movie && <p className="movie-title">{movie.titulo}</p>}
        </div>
        <button
          className={`btn-upload ${!puedeSubirVideo ? 'btn-disabled' : ''}`}
          onClick={handleOpenUploadModal}
          title={!puedeSubirVideo ? 'Ya existe un video completo. Elimínalo primero.' : 'Subir nuevo archivo'}
        >
          ⬆️ Subir Archivo
        </button>
      </div>

      {assets.length === 0 ? (
        <div className="no-assets">
          <p>No hay archivos multimedia para esta película</p>
          <button className="btn-add-first" onClick={handleOpenUploadModal}>
            Subir Primer Archivo
          </button>
        </div>
      ) : (
        <div className="assets-grid">
          {assets.map((asset) => (
            <div key={asset.id} className="asset-card">
              <div className="asset-icon">
                {asset.es_trailer ? '🎬' : '🎥'}
              </div>
              <div className="asset-info">
                <h3>{asset.archivo ? asset.archivo.split('/').pop() : 'Video'}</h3>
                <div className="asset-meta">
                  <span className="badge badge-type">{asset.es_trailer ? 'Tráiler' : 'Película Completa'}</span>
                  {asset.calidad && <span className="badge badge-quality">{asset.calidad}</span>}
                </div>
                <div className="asset-details">
                  <span>Formato: {asset.mime_type || 'video/mp4'}</span>
                  <span>Subido: {new Date(asset.creado_en).toLocaleDateString('es-ES')}</span>
                </div>
                {asset.archivo && (
                  <button
                    onClick={() => setPlayingVideo(asset)}
                    className="asset-link-button"
                  >
                    ▶ Ver video
                  </button>
                )}
              </div>
              <button
                className="btn-delete-asset"
                onClick={() => setDeleteConfirm(asset)}
                title="Eliminar"
              >
                🗑️
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal de subida */}
      {showUploadModal && (
        <div className="modal-overlay" onClick={() => !uploading && setShowUploadModal(false)}>
          <div className="modal-content modal-upload" onClick={(e) => e.stopPropagation()}>
            <h2>Subir Video de Película</h2>
            <form onSubmit={handleUpload}>
              <div className="form-group">
                <label htmlFor="calidad">Calidad del Video *</label>
                <select
                  id="calidad"
                  name="calidad"
                  value={uploadForm.calidad}
                  onChange={handleUploadFormChange}
                  required
                  className="form-input"
                  disabled={uploading}
                >
                  <option value="4K">4K (2160p)</option>
                  <option value="1080p">Full HD (1080p)</option>
                  <option value="720p">HD (720p)</option>
                  <option value="480p">SD (480p)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="es_trailer"
                    checked={uploadForm.es_trailer}
                    onChange={(e) => setUploadForm(prev => ({
                      ...prev,
                      es_trailer: e.target.checked
                    }))}
                    disabled={uploading}
                  />
                  <span>Es un tráiler (preview)</span>
                </label>
              </div>

              <div className="form-group">
                <label htmlFor="archivo">Archivo *</label>
                <input
                  type="file"
                  id="archivo"
                  name="archivo"
                  onChange={handleFileSelect}
                  required
                  className="form-input"
                  disabled={uploading}
                  accept="video/*,audio/*,.srt,.vtt"
                />
                {uploadForm.archivo && (
                  <small className="form-hint">
                    {uploadForm.archivo.name} ({formatFileSize(uploadForm.archivo.size)})
                  </small>
                )}
              </div>

              {uploading && (
                <div className="upload-progress">
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p>{uploadProgress}%</p>
                </div>
              )}

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setShowUploadModal(false)}
                  disabled={uploading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-submit"
                  disabled={uploading}
                >
                  {uploading ? 'Subiendo...' : 'Subir Archivo'}
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
            <h2>¿Eliminar Video?</h2>
            <p>
              ¿Estás seguro de que deseas eliminar este video?
            </p>
            <p className="warning-text">Esta acción no se puede deshacer y el archivo será eliminado permanentemente.</p>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setDeleteConfirm(null)}>
                Cancelar
              </button>
              <button className="btn-confirm-delete" onClick={() => handleDelete(deleteConfirm.id)}>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de reproducción de video */}
      {playingVideo && (
        <div className="modal-overlay" onClick={() => setPlayingVideo(null)}>
          <div className="modal-content modal-video-player" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-video" onClick={() => setPlayingVideo(null)}>
              ✕
            </button>
            <h2>{playingVideo.archivo ? playingVideo.archivo.split('/').pop() : 'Video'}</h2>
            <div className="video-player-container">
              <video
                controls
                autoPlay
                className="video-player"
                key={playingVideo.id}
              >
                <source src={playingVideo.archivo} type={playingVideo.mime_type || 'video/mp4'} />
                Tu navegador no soporta la reproducción de video.
              </video>
            </div>
            <div className="video-info">
              <span className="badge badge-type">{playingVideo.es_trailer ? 'Tráiler' : 'Película Completa'}</span>
              {playingVideo.calidad && <span className="badge badge-quality">{playingVideo.calidad}</span>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MovieAssets;
