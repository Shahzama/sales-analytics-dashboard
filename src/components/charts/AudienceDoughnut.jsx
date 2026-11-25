import { memo, useMemo } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { colorAt } from '../../utils/colors';
import { formatCurrency, formatPercent } from '../../utils/format';

const OPTIONS = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '65%',
  plugins: {
    legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 8, padding: 14 } },
    tooltip: {
      callbacks: {
        label: (context) => {
          const total = context.dataset.data.reduce((sum, value) => sum + value, 0);
          return ` ${context.label}: ${formatCurrency(context.parsed)} (${formatPercent(context.parsed / total)})`;
        },
      },
    },
  },
};

function AudienceDoughnut({ totals }) {
  // Age groups read best in their natural order rather than by size.
  const sorted = useMemo(() => [...totals].sort((a, b) => a.label.localeCompare(b.label)), [totals]);

  const data = useMemo(
    () => ({
      labels: sorted.map((item) => item.label),
      datasets: [
        {
          data: sorted.map((item) => item.value),
          backgroundColor: sorted.map((_, index) => colorAt(index)),
          borderColor: '#ffffff',
          borderWidth: 2,
          hoverOffset: 6,
        },
      ],
    }),
    [sorted],
  );

  return (
    <Doughnut
      data={data}
      options={OPTIONS}
      aria-label="Doughnut chart of revenue share by customer age group"
      role="img"
    />
  );
}

export default memo(AudienceDoughnut);
