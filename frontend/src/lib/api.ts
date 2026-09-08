import axios from 'axios';

const apiBaseUrl = (import.meta.env.VITE_API_URL as string | undefined ?? '/api').replace(/\/$/, '');

const api = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
