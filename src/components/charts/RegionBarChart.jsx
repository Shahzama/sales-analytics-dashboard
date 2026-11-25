import { memo, useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import { formatCompactCurrency, formatCurrency } from '../../utils/format';

const MAX_REGIONS = 8;

const OPTIONS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: { callbacks: { label: (context) => ` ${formatCurrency(context.parsed.y)}` } },
  },
  scales: {
    x: { grid: { display: false }, ticks: { autoSkip: false, maxRotation: 45, minRotation: 0 } },
    y: {
      beginAtZero: true,
      ticks: { callback: (value) => formatCompactCurrency(value) },
      grid: { color: '#f1f5f9' },
    },
  },
};

function RegionBarChart({ totals }) {
  const data = useMemo(() => {
    const top = totals.slice(0, MAX_REGIONS);
    return {
      labels: top.map((item) => item.label),
      datasets: [
        {
          label: 'Revenue',
          data: top.map((item) => item.value),
          backgroundColor: '#10b981',
          borderRadius: 6,
          maxBarThickness: 36,
        },
      ],
    };
  }, [totals]);

  return (
    <Bar data={data} options={OPTIONS} aria-label="Bar chart of revenue by region" role="img" />
  );
}

export default memo(RegionBarChart);
