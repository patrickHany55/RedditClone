import axios from "axios";

// Create axios instance with base URL
// Use environment variable for API URL, fallback to localhost for development
const instance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 60000, // 60 seconds for video uploads
    maxContentLength: 100 * 1024 * 1024, // 100MB
    maxBodyLength: 100 * 1024 * 1024, // 100MB (allows for base64 expansion)
});

// Add a request interceptor to attach the token
instance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default instance;
