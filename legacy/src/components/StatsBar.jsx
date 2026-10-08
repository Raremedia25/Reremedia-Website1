import { useEffect, useRef, useState } from 'react';
import './StatsBar.css';

const stats = [
  { value: 25, suffix: '+', label: 'Projects Delivered' },
  { value: 15, suffix: '+', label: 'Happy Clients' },
  { value: 7, suffix: '', label: 'Service Areas' },
  { value: 99, suffix: '%', label: 'Client Satisfaction' },
];

function Counter({ value, suffix, start }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!start) return undefined;
    const duration = 1400;
    const startTime = performance.now();
    let frame;

    const tick = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * value));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [start, value]);

  return (
    <span className="stats-bar__value">
      {display}
      {suffix}
    </span>
  );
}

export default function StatsBar() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    if (!('IntersectionObserver' in window)) {
      setVisible(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="stats-bar reveal" ref={ref}>
      <div className="container stats-bar__grid">
        {stats.map((stat) => (
          <div className="stats-bar__item" key={stat.label}>
            <Counter value={stat.value} suffix={stat.suffix} start={visible} />
            <span className="stats-bar__label">{stat.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
