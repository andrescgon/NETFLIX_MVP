import Skeleton from './Skeleton';
import './PlansSkeleton.css';

const PlansSkeleton = () => {
  return (
    <div className="plans-container">
      <div className="plans-content">
        <Skeleton width="400px" height="40px" className="plans-title-skeleton" />
        <Skeleton width="500px" height="20px" className="plans-subtitle-skeleton" />

        <div className="plans-grid">
          {[1, 2, 3].map((i) => (
            <div key={i} className="plan-card-skeleton">
              <div className="plan-header-skeleton">
                <Skeleton width="150px" height="32px" />
                <Skeleton width="120px" height="48px" />
              </div>

              <div className="plan-features-skeleton">
                {[1, 2, 3, 4].map((j) => (
                  <div key={j} className="feature-skeleton">
                    <Skeleton width="24px" height="24px" borderRadius="50%" />
                    <Skeleton width="200px" height="20px" />
                  </div>
                ))}
              </div>

              <Skeleton width="100%" height="48px" borderRadius="8px" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PlansSkeleton;