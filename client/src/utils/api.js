import axios from 'axios';
import { auth } from './firebase';

/**
 * Axios instance.
 *
 * baseURL = '' so /api/listings becomes a relative URL → 
 * Vite dev proxy forwards it to http://localhost:5000.
 * This sidesteps CORS entirely during development.
 */
const api = axios.create({
  baseURL: '',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Attach Firebase ID token to every outgoing request ────────────────────────
api.interceptors.request.use(
  async (config) => {
    try {
      const user = auth?.currentUser;
      if (user) {
        const token = await user.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (_) {
      // Non-fatal — public routes (listings, home) don't need auth
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── On 401, force-refresh token once and retry ────────────────────────────────
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  failedQueue = [];
};

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry && auth?.currentUser) {
      if (isRefreshing) {
        return new Promise((resolve, reject) =>
          failedQueue.push({ resolve, reject })
        ).then((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        });
      }

      original._retry = true;
      isRefreshing = true;

      try {
        const fresh = await auth.currentUser.getIdToken(true);
        processQueue(null, fresh);
        original.headers.Authorization = `Bearer ${fresh}`;
        return api(original);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
