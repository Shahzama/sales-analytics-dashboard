// Turns raw API responses into flat "order lines" and aggregates them.
// Every function here is pure, so results can be memoised safely with useMemo.

export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const ALL = 'all';

const AGE_BUCKETS = [
  { max: 24, label: '18–24' },
  { max: 34, label: '25–34' },
  { max: 44, label: '35–44' },
  { max: 54, label: '45–54' },
  { max: Infinity, label: '55+' },
];

export function getAgeGroup(age) {
  if (typeof age !== 'number') return 'Unknown';
  return AGE_BUCKETS.find((bucket) => age <= bucket.max).label;
}

// DummyJSON carts carry no timestamp, so each order gets a deterministic
// month derived from its id. This keeps the trend chart stable between loads.
export function getSimulatedMonth(orderId) {
  return (orderId * 7) % 12;
}

export function formatCategory(slug) {
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/** Join carts with users and products into one row per purchased item. */
export function buildOrderLines(carts, users, products) {
  const userById = new Map(users.map((user) => [user.id, user]));
  const productById = new Map(products.map((product) => [product.id, product]));

  return carts.flatMap((cart) => {
    const user = userById.get(cart.userId);
    const month = getSimulatedMonth(cart.id);

    return cart.products.map((item) => {
      const product = productById.get(item.id);
      return {
        orderId: cart.id,
        customerId: cart.userId,
        month,
        state: user?.address?.state ?? 'Unknown',
        gender: user?.gender ?? 'unknown',
        ageGroup: getAgeGroup(user?.age),
        productId: item.id,
        title: item.title,
        thumbnail: item.thumbnail,
        category: product ? formatCategory(product.category) : 'Other',
        brand: product?.brand ?? 'Unbranded',
        rating: product?.rating ?? null,
        quantity: item.quantity,
        gross: item.total,
        revenue: item.discountedTotal,
      };
    });
  });
}

export function getFilterOptions(lines) {
  const unique = (key) => [...new Set(lines.map((line) => line[key]))].sort();
  return {
    categories: unique('category'),
    states: unique('state'),
    genders: unique('gender'),
  };
}

export function filterLines(lines, { category, state, gender }) {
  return lines.filter(
    (line) =>
      (category === ALL || line.category === category) &&
      (state === ALL || line.state === state) &&
      (gender === ALL || line.gender === gender),
  );
}

export function computeKpis(lines) {
  const orders = new Set();
  const customers = new Set();
  let revenue = 0;
  let gross = 0;
  let units = 0;

  for (const line of lines) {
    orders.add(line.orderId);
    customers.add(line.customerId);
    revenue += line.revenue;
    gross += line.gross;
    units += line.quantity;
  }

  return {
    revenue,
    orders: orders.size,
    customers: customers.size,
    units,
    avgOrderValue: orders.size ? revenue / orders.size : 0,
    discountRate: gross ? (gross - revenue) / gross : 0,
  };
}

export function revenueByMonth(lines) {
  const revenue = Array(12).fill(0);
  const orders = Array.from({ length: 12 }, () => new Set());
  for (const line of lines) {
    revenue[line.month] += line.revenue;
    orders[line.month].add(line.orderId);
  }
  return { revenue, orders: orders.map((set) => set.size) };
}

/** Sum revenue by any field, sorted from largest to smallest. */
export function sumRevenueBy(lines, key) {
  const totals = new Map();
  for (const line of lines) {
    totals.set(line[key], (totals.get(line[key]) ?? 0) + line.revenue);
  }
  return [...totals]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);
}

export function summariseProducts(lines) {
  const byId = new Map();
  for (const line of lines) {
    const entry = byId.get(line.productId) ?? {
      id: line.productId,
      title: line.title,
      thumbnail: line.thumbnail,
      category: line.category,
      brand: line.brand,
      rating: line.rating,
      units: 0,
      revenue: 0,
      orders: 0,
    };
    entry.units += line.quantity;
    entry.revenue += line.revenue;
    entry.orders += 1;
    byId.set(line.productId, entry);
  }
  return [...byId.values()];
}
