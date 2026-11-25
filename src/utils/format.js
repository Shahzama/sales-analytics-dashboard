const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});
const compactCurrency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  notation: 'compact',
  maximumFractionDigits: 1,
});
const integer = new Intl.NumberFormat('en-US');
const percent = new Intl.NumberFormat('en-US', { style: 'percent', maximumFractionDigits: 1 });

export const formatCurrency = (value) => currency.format(value);
export const formatCompactCurrency = (value) => compactCurrency.format(value);
export const formatNumber = (value) => integer.format(value);
export const formatPercent = (value) => percent.format(value);
