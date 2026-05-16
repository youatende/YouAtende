import axios from "axios";

/* ── Storage keys ─────────────────────────────────────────────── */
const BACKEND_URL_KEY  = "youtickets_backend_url";
const TOKEN_KEY        = "youtickets_token";
const REFRESH_TOKEN_KEY = "youtickets_refresh_token";
const DEMO_MODE_KEY    = "youtickets_demo_mode";

/* ── Helpers ──────────────────────────────────────────────────── */
export const getBackendUrl    = ()  => localStorage.getItem(BACKEND_URL_KEY) ?? "";
export const setBackendUrl    = (u: string) =>
  localStorage.setItem(BACKEND_URL_KEY, u.trim().replace(/\/+$/, ""));

export const getToken         = ()  => localStorage.getItem(TOKEN_KEY);
export const setToken         = (t: string) => localStorage.setItem(TOKEN_KEY, t);

export const getRefreshToken  = ()  => localStorage.getItem(REFRESH_TOKEN_KEY);
export const setRefreshToken  = (t: string) => localStorage.setItem(REFRESH_TOKEN_KEY, t);

export const clearTokens = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

export const isDemoMode   = () => localStorage.getItem(DEMO_MODE_KEY) === "true";
export const enableDemo   = () => localStorage.setItem(DEMO_MODE_KEY, "true");
export const disableDemo  = () => localStorage.removeItem(DEMO_MODE_KEY);

export const isConnected  = () => !isDemoMode() && !!getToken() && !!getBackendUrl();

/* ── Axios instance ───────────────────────────────────────────── */
const api = axios.create({ timeout: 15000, headers: { "Content-Type": "application/json" } });

// Attach dynamic base URL + token on every request
api.interceptors.request.use((config) => {
  const url = getBackendUrl();
  if (url) config.baseURL = url;
  const tok = getToken();
  if (tok) config.headers.Authorization = `Bearer ${tok}`;
  return config;
});

// Handle 401 → try refresh → force logout if it fails
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const orig = err.config;
    const refreshToken = getRefreshToken();
    if (err.response?.status === 401 && !orig._retry && refreshToken) {
      orig._retry = true;
      try {
        const { data } = await axios.post(
          `${getBackendUrl()}/auth/refresh_token`,
          {},
          { headers: { Authorization: `Bearer ${refreshToken}` } }
        );
        setToken(data.token);
        orig.headers.Authorization = `Bearer ${data.token}`;
        return api(orig);
      } catch {
        clearTokens();
        window.dispatchEvent(new Event("youtickets:logout"));
      }
    }
    return Promise.reject(err);
  }
);

export default api;
