import { memo, useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import { formatCompactCurrency, formatCurrency } from '../../utils/format';
import { ALL } from '../../utils/transform';

const MAX_BARS = 10;

function CategoryBarChart({ totals, selected, onSelect }) {
  const top = useMemo(() => totals.slice(0, MAX_BARS), [totals]);

  const data = useMemo(
    () => ({
      labels: top.map((item) => item.label),
      datasets: [
        {
          label: 'Revenue',
          data: top.map((item) => item.value),
          backgroundColor: top.map((item) =>
            selected === ALL || selected === item.label ? '#4f46e5' : '#c7d2fe',
          ),
          borderRadius: 6,
          maxBarThickness: 22,
        },
      ],
    }),
    [top, selected],
  );

  const options = useMemo(
    () => ({
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: (context) => ` ${formatCurrency(context.parsed.x)}` } },
      },
      scales: {
        x: {
          beginAtZero: true,
          ticks: { callback: (value) => formatCompactCurrency(value) },
          grid: { color: '#f1f5f9' },
        },
        y: { grid: { display: false } },
      },
      onHover: (event, elements) => {
        event.native.target.style.cursor = elements.length ? 'pointer' : 'default';
      },
      // Clicking a bar toggles the category filter for the whole dashboard.
      onClick: (_event, elements) => {
        if (!elements.length) return;
        const label = top[elements[0].index].label;
        onSelect('category', selected === label ? ALL : label);
      },
    }),
    [top, selected, onSelect],
  );

  return (
    <Bar
      data={data}
      options={options}
      aria-label="Bar chart of revenue by product category"
      role="img"
    />
  );
}

export default memo(CategoryBarChart);
