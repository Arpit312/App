import axios from 'axios';

// Get API base URL from Environment variables, falling back to local port (defaulting to typical localhost)
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Optional: Add request interceptors to append Auth Token (JWT) in headers if available in AsyncStorage / Expo SecureStore
api.interceptors.request.use(
  async (config) => {
    // Boilerplate placeholder:
    // const token = await SecureStore.getItemAsync('auth_token');
    // if (token) { config.headers.Authorization = `Bearer ${token}`; }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
