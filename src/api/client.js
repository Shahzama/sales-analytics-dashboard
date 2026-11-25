const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'https://dummyjson.com';

// Cache in-flight and resolved requests by path so that repeated renders,
// React StrictMode double effects and remounts never hit the network twice.
const requestCache = new Map();

async function request(path) {
  const response = await fetch(`${BASE_URL}${path}`);
  if (!response.ok) {
    throw new Error(`Request to ${path} failed with status ${response.status}`);
  }
  return response.json();
}

function getJSON(path) {
  if (!requestCache.has(path)) {
    const promise = request(path).catch((error) => {
      requestCache.delete(path); // let a retry go to the network again
      throw error;
    });
    requestCache.set(path, promise);
  }
  return requestCache.get(path);
}

export function clearApiCache() {
  requestCache.clear();
}

// `select` trims each payload down to the fields the dashboard uses.
export const fetchProducts = () =>
  getJSON('/products?limit=0&select=title,category,brand,price,rating,stock,thumbnail').then(
    (data) => data.products,
  );

export const fetchUsers = () =>
  getJSON('/users?limit=0&select=age,gender,address').then((data) => data.users);

export const fetchCarts = () => getJSON('/carts?limit=0').then((data) => data.carts);
