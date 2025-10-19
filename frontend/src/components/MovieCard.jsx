import './MovieCard.css';

const MovieCard = ({ movie, onClick }) => {
  // Construir URL de imagen correctamente
  const getImageUrl = (miniatura) => {
    if (!miniatura) return null;
    // Si ya es una URL completa, usarla directamente
    if (miniatura.startsWith('http://') || miniatura.startsWith('https://')) {
      return miniatura;
    }
    // Usar ruta relativa para que Vite proxy funcione
    // Si miniatura ya empieza con /, usarla directamente
    if (miniatura.startsWith('/')) {
      return miniatura;
    }
    // Si no, agregar /
    return `/${miniatura}`;
  };

  const imageUrl = getImageUrl(movie.miniatura);

  return (
    <div className="movie-card" onClick={() => onClick(movie)}>
      <div className="movie-poster">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={movie.titulo}
            className="movie-poster-image"
            onError={(e) => {
              console.error('Error cargando imagen:', imageUrl);
              e.target.style.display = 'none';
              e.target.parentElement.innerHTML = `<div class="movie-poster-placeholder">${movie.titulo.charAt(0).toUpperCase()}</div>`;
            }}
          />
        ) : (
          <div className="movie-poster-placeholder">
            {movie.titulo.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
      <div className="movie-info">
        <h3 className="movie-title">{movie.titulo}</h3>
        <div className="movie-meta">
          <span className="movie-year">
            {movie.fecha_estreno ? new Date(movie.fecha_estreno).getFullYear() : 'N/A'}
          </span>
          {movie.clasificacion && (
            <span className="movie-rating">{movie.clasificacion}</span>
          )}
        </div>
        {movie.generos && movie.generos.length > 0 && (
          <div className="movie-genres">
            {movie.generos.slice(0, 3).map((genre) => (
              <span key={genre.id_genero} className="genre-tag">
                {genre.nombre}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MovieCard;