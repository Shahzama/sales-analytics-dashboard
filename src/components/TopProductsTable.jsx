import { memo, useEffect, useMemo, useState } from 'react';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { formatCurrency, formatNumber } from '../utils/format';

const PAGE_SIZE = 8;

const COLUMNS = [
  { key: 'title', label: 'Product', numeric: false },
  { key: 'category', label: 'Category', numeric: false },
  { key: 'units', label: 'Units', numeric: true },
  { key: 'orders', label: 'Orders', numeric: true },
  { key: 'rating', label: 'Rating', numeric: true },
  { key: 'revenue', label: 'Revenue', numeric: true },
];

function compare(a, b, key) {
  const left = a[key] ?? -Infinity;
  const right = b[key] ?? -Infinity;
  return typeof left === 'string' ? left.localeCompare(right) : left - right;
}

function SortIcon({ direction }) {
  return (
    <span aria-hidden="true" className="ml-1 inline-block w-3 text-indigo-600">
      {direction === 'asc' ? '▲' : direction === 'desc' ? '▼' : ''}
    </span>
  );
}

// Search text is local state: typing re-renders only this table, never the
// KPI cards or charts above it.
function TopProductsTable({ products }) {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState({ key: 'revenue', direction: 'desc' });
  const [page, setPage] = useState(0);
  const debouncedQuery = useDebouncedValue(query.trim().toLowerCase(), 250);

  const rows = useMemo(() => {
    const matches = debouncedQuery
      ? products.filter(
          (product) =>
            product.title.toLowerCase().includes(debouncedQuery) ||
            product.brand.toLowerCase().includes(debouncedQuery) ||
            product.category.toLowerCase().includes(debouncedQuery),
        )
      : products;
    const factor = sort.direction === 'asc' ? 1 : -1;
    return [...matches].sort((a, b) => factor * compare(a, b, sort.key));
  }, [products, debouncedQuery, sort]);

  // Go back to page 1 whenever the result set changes.
  useEffect(() => setPage(0), [debouncedQuery, products]);

  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const visible = rows.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  const toggleSort = (key) =>
    setSort((current) =>
      current.key === key
        ? { key, direction: current.direction === 'asc' ? 'desc' : 'asc' }
        : { key, direction: COLUMNS.find((column) => column.key === key).numeric ? 'desc' : 'asc' },
    );

  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <header className="flex flex-col gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Top products</h2>
          <p className="text-xs text-slate-500">{formatNumber(rows.length)} {rows.length === 1 ? 'product' : 'products'} · click a column to sort</p>
        </div>
        <label className="relative block sm:w-72">
          <span className="sr-only">Search products</span>
          <svg
            aria-hidden="true"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400"
          >
            <path
              fillRule="evenodd"
              d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z"
              clipRule="evenodd"
            />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search product, brand or category"
            className="w-full rounded-lg border border-slate-200 py-2 pr-3 pl-9 text-sm shadow-sm placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
          />
        </label>
      </header>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              {COLUMNS.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  aria-sort={
                    sort.key === column.key ? (sort.direction === 'asc' ? 'ascending' : 'descending') : 'none'
                  }
                  className={`px-5 py-3 font-medium ${column.numeric ? 'text-right' : ''}`}
                >
                  <button
                    type="button"
                    onClick={() => toggleSort(column.key)}
                    className="inline-flex items-center uppercase hover:text-slate-800 focus-visible:outline-2 focus-visible:outline-indigo-500"
                  >
                    {column.label}
                    <SortIcon direction={sort.key === column.key ? sort.direction : null} />
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {visible.map((product) => (
              <tr key={product.id} className="hover:bg-slate-50">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={product.thumbnail}
                      alt=""
                      loading="lazy"
                      width="36"
                      height="36"
                      className="h-9 w-9 rounded-md bg-slate-100 object-cover"
                    />
                    <div className="min-w-0">
                      <p className="truncate font-medium text-slate-900">{product.title}</p>
                      <p className="text-xs text-slate-500">{product.brand}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3 text-slate-600">{product.category}</td>
                <td className="px-5 py-3 text-right tabular-nums">{formatNumber(product.units)}</td>
                <td className="px-5 py-3 text-right tabular-nums">{formatNumber(product.orders)}</td>
                <td className="px-5 py-3 text-right tabular-nums">
                  {product.rating == null ? '—' : `★ ${product.rating.toFixed(1)}`}
                </td>
                <td className="px-5 py-3 text-right font-medium tabular-nums text-slate-900">
                  {formatCurrency(product.revenue)}
                </td>
              </tr>
            ))}
            {visible.length === 0 && (
              <tr>
                <td colSpan={COLUMNS.length} className="px-5 py-10 text-center text-slate-500">
                  No products match "{query}".
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <footer className="flex items-center justify-between border-t border-slate-200 px-5 py-3 text-sm text-slate-600">
        <span>
          Page {page + 1} of {pageCount}
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setPage((current) => current - 1)}
            disabled={page === 0}
            className="rounded-lg border border-slate-200 px-3 py-1.5 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={() => setPage((current) => current + 1)}
            disabled={page >= pageCount - 1}
            className="rounded-lg border border-slate-200 px-3 py-1.5 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </footer>
    </section>
  );
}

export default memo(TopProductsTable);
