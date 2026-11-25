import { useCallback, useEffect, useState } from 'react';
import { clearApiCache, fetchCarts, fetchProducts, fetchUsers } from '../api/client';
import { buildOrderLines } from '../utils/transform';

/** Loads all three endpoints in parallel and joins them into order lines. */
export function useDashboardData() {
  const [state, setState] = useState({
    status: 'loading',
    lines: null,
    error: null,
    updatedAt: null,
  });
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let ignore = false;
    setState((previous) => ({ ...previous, status: 'loading', error: null }));

    Promise.all([fetchCarts(), fetchUsers(), fetchProducts()])
      .then(([carts, users, products]) => {
        if (ignore) return;
        setState({
          status: 'success',
          lines: buildOrderLines(carts, users, products),
          error: null,
          updatedAt: new Date(),
        });
      })
      .catch((error) => {
        if (ignore) return;
        setState((previous) => ({ ...previous, status: 'error', error }));
      });

    return () => {
      ignore = true;
    };
  }, [reloadKey]);

  const reload = useCallback(() => {
    clearApiCache();
    setReloadKey((key) => key + 1);
  }, []);

  return { ...state, reload };
}
