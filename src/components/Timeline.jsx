import { useEffect, useRef, useState } from 'react';
import './Timeline.css';

export default function Timeline() {
  const [timelineData, setTimelineData] = useState([]);
  const [loading, setLoading] = useState(true);
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [visibleItems, setVisibleItems] = useState(new Set());
  const itemRefs = useRef([]);

  // Fetch timeline data from journey.json
  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}journey.json`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        const filtered = (Array.isArray(data) ? data : []).filter(
          (item) => Number(item.id) !== 0
        );
        const sorted = filtered.sort((a, b) => Number(b.id) - Number(a.id));
        setTimelineData(sorted);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load journey data:', err);
        setLoading(false);
      });
  }, []);

  // Section visibility
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Individual item visibility for staggered reveals
  useEffect(() => {
    if (timelineData.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = Number(entry.target.dataset.index);
            setVisibleItems((prev) => new Set(prev).add(idx));
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -20px 0px' }
    );

    itemRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, [timelineData]);

  return (
    <section
      id="journey"
      className={`section timeline ${isVisible ? 'timeline--visible' : ''}`}
      data-bg="dark"
      ref={sectionRef}
    >
      {/* ── Ambient Background ── */}
      <div className="timeline__bg-wrapper" aria-hidden="true">
        <div className="timeline__glow timeline__glow--primary" />
        <div className="timeline__glow timeline__glow--secondary" />
        <div className="timeline__grid-overlay" />
      </div>

      {/* ── Section Header ── */}
      <div className="timeline__header">
        <div className="timeline__header-left">
          <span className="timeline__header-number">02</span>
          <span className="timeline__header-slash">/</span>
          <span className="timeline__header-label">TRAJECTORY & FOUNDATION</span>
        </div>

      </div>

      {/* ── Timeline Entries ── */}
      <div className="timeline__entries">
        {loading ? (
          <div className="timeline__loading">Loading journey…</div>
        ) : timelineData.length === 0 ? (
          <div className="timeline__loading">No journey entries found.</div>
        ) : (
          timelineData.map((item, index) => {
            const isItemVisible = visibleItems.has(index);
            const isEdu = item.type === 'education';

            return (
              <div
                className={`timeline__entry ${isEdu ? 'timeline__entry--education' : 'timeline__entry--work'
                  } ${isItemVisible ? 'timeline__entry--visible' : ''}`}
                key={item.id || index}
                data-index={index}
                ref={(el) => (itemRefs.current[index] = el)}
              >
                {/* Divider line above */}
                <div className="timeline__divider" />

                <div className="timeline__entry-grid">
                  {/* Left column: Date / Period */}
                  <div className="timeline__entry-meta">
                    <span
                      className={`timeline__entry-period ${isEdu ? 'timeline__entry-period--edu' : ''
                        }`}
                    >
                      {item.period}
                    </span>
                  </div>

                  {/* Right column: Title, Org badge, Description */}
                  <div className="timeline__entry-content">
                    <div className="timeline__entry-title-row">
                      <h3 className="timeline__entry-title">{item.title}</h3>
                      <span className="timeline__org-badge">
                        {item.organization}
                      </span>
                    </div>
                    <p className="timeline__entry-description">{item.description}</p>
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* Final divider */}
        {!loading && timelineData.length > 0 && (
          <div className="timeline__divider timeline__divider--final" />
        )}
      </div>
    </section>
  );
}
