export default function ChartCard({ title, subtitle, children, className = '' }) {
  return (
    <section className={`flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}>
      <header className="mb-4">
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
        {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
      </header>
      <div className="relative min-h-64 flex-1">{children}</div>
    </section>
  );
}
