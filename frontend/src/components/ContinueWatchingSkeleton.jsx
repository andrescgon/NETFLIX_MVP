import Skeleton from './Skeleton';
import './ContinueWatchingSkeleton.css';

const ContinueWatchingSkeleton = () => {
  return (
    <div className="continue-watching-skeleton">
      <Skeleton height="30px" width="200px" />
      <div className="continue-skeleton-grid">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="continue-skeleton-card">
            <Skeleton height="160px" borderRadius="8px" />
            <Skeleton height="18px" width="80%" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContinueWatchingSkeleton;