import Skeleton from './Skeleton';
import './MovieCardSkeleton.css';

const MovieCardSkeleton = () => {
  return (
    <div className="movie-card-skeleton">
      <Skeleton height="300px" borderRadius="8px 8px 0 0" />
      <div className="movie-card-skeleton-info">
        <Skeleton height="20px" width="80%" />
        <Skeleton height="16px" width="60%" />
        <div className="skeleton-genres">
          <Skeleton height="24px" width="60px" borderRadius="4px" />
          <Skeleton height="24px" width="70px" borderRadius="4px" />
        </div>
      </div>
    </div>
  );
};

export default MovieCardSkeleton;