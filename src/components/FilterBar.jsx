import { memo } from 'react';
import { ALL } from '../utils/transform';

function Select({ id, label, value, options, onChange, formatOption = (option) => option }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-1 sm:min-w-44 sm:flex-none">
      <label htmlFor={id} className="text-xs font-medium text-slate-500">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(id, event.target.value)}
        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
      >
        <option value={ALL}>All</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {formatOption(option)}
          </option>
        ))}
      </select>
    </div>
  );
}

const capitalise = (text) => text.charAt(0).toUpperCase() + text.slice(1);

function FilterBar({ filters, options, onChange, onReset }) {
  const isFiltered = Object.values(filters).some((value) => value !== ALL);

  return (
    <section
      aria-label="Filters"
      className="flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
    >
      <Select
        id="category"
        label="Category"
        value={filters.category}
        options={options.categories}
        onChange={onChange}
      />
      <Select
        id="state"
        label="Region (state)"
        value={filters.state}
        options={options.states}
        onChange={onChange}
      />
      <Select
        id="gender"
        label="Customer gender"
        value={filters.gender}
        options={options.genders}
        onChange={onChange}
        formatOption={capitalise}
      />
      {isFiltered && (
        <button
          type="button"
          onClick={onReset}
          className="rounded-lg px-3 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 focus-visible:outline-2 focus-visible:outline-indigo-500"
        >
          Clear filters
        </button>
      )}
    </section>
  );
}

export default memo(FilterBar);
