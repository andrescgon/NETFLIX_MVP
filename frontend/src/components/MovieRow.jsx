import { useState, useRef } from 'react';
import MovieCard from './MovieCard';
import './MovieRow.css';

const MovieRow = ({ title, movies, onMovieClick }) => {
  const [scrollX, setScrollX] = useState(0);
  const rowRef = useRef(null);

  const handleLeftArrow = () => {
    if (rowRef.current) {
      const x = rowRef.current.scrollLeft - (window.innerWidth - 100);
      rowRef.current.scrollLeft = x;
      setScrollX(x);
    }
  };

  const handleRightArrow = () => {
    if (rowRef.current) {
      const x = rowRef.current.scrollLeft + (window.innerWidth - 100);
      rowRef.current.scrollLeft = x;
      setScrollX(x);
    }
  };

  if (!movies || movies.length === 0) {
    return null;
  }

  return (
    <div className="movie-row">
      <h2 className="row-title">{title}</h2>
      <div className="row-container">
        {scrollX > 0 && (
          <button className="row-arrow row-arrow-left" onClick={handleLeftArrow}>
            ‹
          </button>
        )}
        <div className="row-content" ref={rowRef}>
          {movies.map((movie) => (
            <div key={movie.id_pelicula} className="row-item">
              <MovieCard movie={movie} onClick={onMovieClick} />
            </div>
          ))}
        </div>
        {rowRef.current && scrollX < (rowRef.current.scrollWidth - rowRef.current.offsetWidth) && (
          <button className="row-arrow row-arrow-right" onClick={handleRightArrow}>
            ›
          </button>
        )}
      </div>
    </div>
  );
};

export default MovieRow;
