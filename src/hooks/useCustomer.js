'use client';

import { useCallback, useEffect, useState } from 'react';

// Fired after login/logout so every component using this hook refreshes
export const AUTH_EVENT = 'aroma:auth-changed';
export const notifyAuthChanged = () => window.dispatchEvent(new Event(AUTH_EVENT));

const LIVE_REFRESH_MS = 15_000;

/**
 * The logged-in customer (or null), their Loyalty Member status and optionally booking history.
 * status: 'loading' | 'guest' | 'customer'
 */
export default function useCustomer({ withBookings = false } = {}) {
  const [state, setState] = useState({ status: 'loading', user: null, loyalty: null, bookings: [] });

  const refresh = useCallback(async () => {
    try {
      const res = await fetch(`/api/me${withBookings ? '' : '?brief=1'}`, { cache: 'no-store' });
      if (res.status === 401) {
        setState({ status: 'guest', user: null, loyalty: null, bookings: [] });
        return;
      }
      const data = await res.json();
      if (data.success) {
        setState({ status: 'customer', user: data.user, loyalty: data.loyalty, bookings: data.bookings || [] });
      }
    } catch (error) {
      console.error('Failed to load customer:', error);
      setState((s) => (s.status === 'loading' ? { ...s, status: 'guest' } : s));
    }
  }, [withBookings]);

  // Live updates: poll while the tab is visible and re-check when the customer comes back,
  // so Loyalty Member progress follows bookings being made, completed or cancelled.
  useEffect(() => {
    const first = setTimeout(refresh, 0);
    const timer = setInterval(() => {
      if (document.visibilityState === 'visible') refresh();
    }, LIVE_REFRESH_MS);
    const onVisible = () => document.visibilityState === 'visible' && refresh();

    window.addEventListener(AUTH_EVENT, refresh);
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearTimeout(first);
      clearInterval(timer);
      window.removeEventListener(AUTH_EVENT, refresh);
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [refresh]);

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    notifyAuthChanged();
  };

  return { ...state, refresh, logout };
}
