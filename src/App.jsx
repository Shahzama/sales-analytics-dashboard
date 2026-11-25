import { useCallback, useMemo, useState } from 'react';
import ChartCard from './components/ChartCard';
import AudienceDoughnut from './components/charts/AudienceDoughnut';
import CategoryBarChart from './components/charts/CategoryBarChart';
import RegionBarChart from './components/charts/RegionBarChart';
import RevenueTrendChart from './components/charts/RevenueTrendChart';
import FilterBar from './components/FilterBar';
import Header from './components/Header';
import KpiCard from './components/KpiCard';
import { DashboardSkeleton, EmptyState, ErrorState } from './components/StatusViews';
import TopProductsTable from './components/TopProductsTable';
import { useDashboardData } from './hooks/useDashboardData';
import { PALETTE } from './utils/colors';
import { formatCurrency, formatNumber, formatPercent } from './utils/format';
import {
  ALL,
  computeKpis,
  filterLines,
  getFilterOptions,
  revenueByMonth,
  summariseProducts,
  sumRevenueBy,
} from './utils/transform';

const INITIAL_FILTERS = { category: ALL, state: ALL, gender: ALL };

export default function App() {
  const { status, lines, error, updatedAt, reload } = useDashboardData();
  const [filters, setFilters] = useState(INITIAL_FILTERS);

  // Stable callbacks so memoised children don't re-render because of a new function.
  const handleFilterChange = useCallback((key, value) => {
    setFilters((current) => (current[key] === value ? current : { ...current, [key]: value }));
  }, []);
  const resetFilters = useCallback(() => setFilters(INITIAL_FILTERS), []);

  // Each aggregation is memoised on exactly what it depends on, so a filter
  // change recomputes once and an unrelated state change recomputes nothing.
  const options = useMemo(
    () => (lines ? getFilterOptions(lines) : { categories: [], states: [], genders: [] }),
    [lines],
  );
  const filtered = useMemo(() => (lines ? filterLines(lines, filters) : []), [lines, filters]);
  const kpis = useMemo(() => computeKpis(filtered), [filtered]);
  const monthly = useMemo(() => revenueByMonth(filtered), [filtered]);
  const byState = useMemo(() => sumRevenueBy(filtered, 'state'), [filtered]);
  const byAge = useMemo(() => sumRevenueBy(filtered, 'ageGroup'), [filtered]);
  const products = useMemo(() => summariseProducts(filtered), [filtered]);

  // The category chart ignores its own filter so every bar stays visible and
  // the selected one is highlighted instead.
  const linesForCategoryChart = useMemo(
    () => (lines ? filterLines(lines, { ...filters, category: ALL }) : []),
    [lines, filters],
  );
  const byCategory = useMemo(() => sumRevenueBy(linesForCategoryChart, 'category'), [linesForCategoryChart]);

  const showSkeleton = status === 'loading' && !lines;

  return (
    <main className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <Header updatedAt={updatedAt} loading={status === 'loading'} onRefresh={reload} />

      {status === 'error' && !lines && <ErrorState error={error} onRetry={reload} />}
      {showSkeleton && <DashboardSkeleton />}

      {lines && (
        <>
          <FilterBar
            filters={filters}
            options={options}
            onChange={handleFilterChange}
            onReset={resetFilters}
          />

          {filtered.length === 0 ? (
            <EmptyState onReset={resetFilters} />
          ) : (
            <>
              <section aria-label="Key metrics" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <KpiCard
                  label="Net revenue"
                  value={formatCurrency(kpis.revenue)}
                  hint={`${formatPercent(kpis.discountRate)} average discount`}
                  accent={PALETTE[0]}
                />
                <KpiCard
                  label="Orders"
                  value={formatNumber(kpis.orders)}
                  hint={`${formatNumber(kpis.customers)} unique customers`}
                  accent={PALETTE[1]}
                />
                <KpiCard
                  label="Avg. order value"
                  value={formatCurrency(kpis.avgOrderValue)}
                  hint="Net revenue ÷ orders"
                  accent={PALETTE[2]}
                />
                <KpiCard
                  label="Units sold"
                  value={formatNumber(kpis.units)}
                  hint={`Across ${formatNumber(products.length)} products`}
                  accent={PALETTE[3]}
                />
              </section>

              <div className="grid gap-6 lg:grid-cols-3">
                <ChartCard
                  title="Revenue trend"
                  subtitle="Monthly net revenue and orders (order dates are simulated)"
                  className="lg:col-span-2"
                >
                  <RevenueTrendChart monthly={monthly} />
                </ChartCard>
                <ChartCard title="Revenue by age group" subtitle="Share of net revenue">
                  <AudienceDoughnut totals={byAge} />
                </ChartCard>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <ChartCard title="Revenue by category" subtitle="Top 10 · click a bar to filter">
                  <CategoryBarChart
                    totals={byCategory}
                    selected={filters.category}
                    onSelect={handleFilterChange}
                  />
                </ChartCard>
                <ChartCard title="Top regions" subtitle="Net revenue by customer state">
                  <RegionBarChart totals={byState} />
                </ChartCard>
              </div>

              <TopProductsTable products={products} />
            </>
          )}
        </>
      )}

      <footer className="pt-2 text-center text-xs text-slate-400">
        Data from the DummyJSON REST API · Built with React, Chart.js and Tailwind CSS
      </footer>
    </main>
  );
}
