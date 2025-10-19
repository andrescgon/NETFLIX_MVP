import Skeleton from './Skeleton';
import './ProfilesSkeleton.css';

const ProfilesSkeleton = () => {
  return (
    <div className="profile-selection-container">
      <div className="profile-selection-content">
        <Skeleton width="300px" height="40px" className="profiles-title-skeleton" />

        <div className="profiles-grid-skeleton">
          {[1, 2, 3].map((i) => (
            <div key={i} className="profile-card-skeleton">
              <Skeleton width="150px" height="150px" borderRadius="8px" />
              <Skeleton width="120px" height="24px" />
            </div>
          ))}
        </div>

        <Skeleton width="200px" height="48px" borderRadius="8px" className="manage-btn-skeleton" />
      </div>
    </div>
  );
};

export default ProfilesSkeleton;