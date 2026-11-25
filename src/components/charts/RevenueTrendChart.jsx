import { memo, useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import { formatCompactCurrency, formatCurrency } from '../../utils/format';
import { MONTHS } from '../../utils/transform';

// Options never change, so they live at module level: Chart.js never sees a
// "new" options object and skips a full chart update on parent re-renders.
const OPTIONS = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: 'index', intersect: false },
  plugins: {
    legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 8 } },
    tooltip: {
      callbacks: {
        label: (context) =>
          context.dataset.yAxisID === 'revenue'
            ? ` Revenue: ${formatCurrency(context.parsed.y)}`
            : ` Orders: ${context.parsed.y}`,
      },
    },
  },
  scales: {
    x: { grid: { display: false } },
    revenue: {
      position: 'left',
      beginAtZero: true,
      ticks: { callback: (value) => formatCompactCurrency(value) },
      grid: { color: '#f1f5f9' },
    },
    orders: {
      position: 'right',
      beginAtZero: true,
      ticks: { precision: 0 },
      grid: { display: false },
    },
  },
};

function RevenueTrendChart({ monthly }) {
  const data = useMemo(
    () => ({
      labels: MONTHS,
      datasets: [
        {
          label: 'Revenue',
          data: monthly.revenue,
          yAxisID: 'revenue',
          borderColor: '#4f46e5',
          backgroundColor: 'rgba(79, 70, 229, 0.12)',
          fill: true,
          cubicInterpolationMode: 'monotone', // smooth, but never overshoots below 0
          pointRadius: 3,
          pointHoverRadius: 5,
        },
        {
          label: 'Orders',
          data: monthly.orders,
          yAxisID: 'orders',
          borderColor: '#0ea5e9',
          borderDash: [6, 4],
          pointRadius: 0,
          cubicInterpolationMode: 'monotone',
        },
      ],
    }),
    [monthly],
  );

  return (
    <Line
      data={data}
      options={OPTIONS}
      aria-label="Line chart of monthly revenue and order count"
      role="img"
    />
  );
}

export default memo(RevenueTrendChart);
