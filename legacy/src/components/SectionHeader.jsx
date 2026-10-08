export default function SectionHeader({ eyebrow, title, subtitle, align = 'center' }) {
  return (
    <div className={`section-header reveal ${align === 'left' ? 'section-header--left' : ''}`}>
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      <h2>{title}</h2>
      {subtitle && <p>{subtitle}</p>}
    </div>
  );
}
