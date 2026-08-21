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
    fetch('/journey.json')
      .then((res) => res.json())
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
      { threshold: 0.2, rootMargin: '0px 0px -50px 0px' }
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
      data-bg="cream"
      ref={sectionRef}
    >
      <span className="section-label timeline__label">Journey</span>

      {/* Decorative elements */}
      <div className="timeline__bg-accent timeline__bg-accent--1" />
      <div className="timeline__bg-accent timeline__bg-accent--2" />

      <div className="timeline__header">
        <span className="timeline__tag">Education & Experience</span>
        <h2 className="timeline__title">
          My <span className="timeline__title-accent">Journey</span>
        </h2>
        <p className="timeline__subtitle">
          Timeline of my academic milestones and professional experiences
        </p>
      </div>

      <div className="timeline__container">
        {/* Central line */}
        <div className="timeline__line" />

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'rgba(0,0,0,0.4)' }}>
            Loading journey...
          </div>
        ) : timelineData.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'rgba(0,0,0,0.4)' }}>
            No journey entries found. Add items to journey.json!
          </div>
        ) : (
          timelineData.map((item, index) => {
            const side = index % 2 === 0 ? 'left' : 'right';
            const isItemVisible = visibleItems.has(index);
            const isEdu = item.type === 'education';

            return (
              <div
                className={`timeline__item timeline__item--${side} ${isItemVisible ? 'timeline__item--visible' : ''
                  }`}
                key={item.id || index}
                data-index={index}
                ref={(el) => (itemRefs.current[index] = el)}
              >
                {/* Dot on timeline */}
                <div className="timeline__dot">
                  {item.logo ? (
                    <img
                      src={item.logo}
                      alt={item.organization}
                      className="timeline__dot-logo"
                      loading="lazy"
                    />
                  ) : (
                    <span className="timeline__dot-icon">
                      {isEdu ? '🎓' : '💼'}
                    </span>
                  )}
                </div>

                {/* Card */}
                <div className="timeline__card">
                  <div className="timeline__card-header">
                    <span
                      className={`timeline__type timeline__type--${isEdu ? 'education' : 'work'
                        }`}
                    >
                      {isEdu ? 'Education' : 'Experience'}
                    </span>
                    <span className="timeline__period">{item.period}</span>
                  </div>
                  <h3 className="timeline__card-title">{item.title}</h3>
                  <p className="timeline__organization">{item.organization}</p>
                  <p className="timeline__description">{item.description}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}

