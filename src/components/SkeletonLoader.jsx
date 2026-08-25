import './SkeletonLoader.css';

export default function SkeletonLoader() {
  return (
    <div className="skeleton-wrapper">
      <section className="section skeleton-section">
        <div className="skeleton-label"></div>
        <div className="skeleton-content">
          <div className="skeleton-header"></div>
          <div className="skeleton-line" style={{ width: '90%' }}></div>
          <div className="skeleton-line" style={{ width: '85%' }}></div>
          <div className="skeleton-line" style={{ width: '95%' }}></div>
          <div className="skeleton-line" style={{ width: '70%' }}></div>
          
          <div className="skeleton-grid">
            <div className="skeleton-card"></div>
            <div className="skeleton-card"></div>
            <div className="skeleton-card"></div>
          </div>
        </div>
      </section>
    </div>
  );
}
