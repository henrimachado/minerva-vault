import axios, { AxiosInstance } from 'axios';
import { API_BASE_URL, ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from './constants';

const api: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptador para envio do token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    if (config.data instanceof FormData) {
        delete config.headers['Content-Type'];
    }
    return config;
})


// Refresh token
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

                if (refreshToken) {
                    const response = await axios.post(
                        `${API_BASE_URL}/auth/refresh/`,
                        { refresh: refreshToken }
                    );

                    localStorage.setItem(ACCESS_TOKEN_KEY, response.data.access);

                    originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
                    return axios(originalRequest);
                }
                localStorage.removeItem(ACCESS_TOKEN_KEY);
                window.location.href = '/login';
            } catch (refreshError) {
                localStorage.removeItem(ACCESS_TOKEN_KEY);
                localStorage.removeItem(REFRESH_TOKEN_KEY);
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export default api;