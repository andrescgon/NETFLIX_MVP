import Skeleton from './Skeleton';
import './SubscriptionSkeleton.css';

const SubscriptionSkeleton = () => {
  return (
    <div className="subscription-container">
      <div className="subscription-content">
        <Skeleton width="250px" height="40px" className="subscription-title-skeleton" />

        <div className="subscription-card-skeleton">
          <div className="subscription-header-skeleton">
            <div>
              <Skeleton width="180px" height="32px" />
              <Skeleton width="100px" height="28px" className="status-skeleton" />
            </div>
            <Skeleton width="120px" height="48px" />
          </div>

          <div className="subscription-details-skeleton">
            {[1, 2, 3].map((i) => (
              <div key={i} className="detail-row-skeleton">
                <Skeleton width="150px" height="20px" />
                <Skeleton width="200px" height="20px" />
              </div>
            ))}
          </div>

          <div className="subscription-benefits-skeleton">
            <Skeleton width="180px" height="24px" className="benefits-title-skeleton" />
            <div className="benefits-list-skeleton">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="benefit-skeleton">
                  <Skeleton width="24px" height="24px" borderRadius="50%" />
                  <Skeleton width="180px" height="20px" />
                </div>
              ))}
            </div>
          </div>

          <div className="subscription-actions-skeleton">
            <Skeleton width="150px" height="48px" borderRadius="8px" />
            <Skeleton width="150px" height="48px" borderRadius="8px" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionSkeleton;