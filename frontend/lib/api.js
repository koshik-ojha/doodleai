import axios from "axios";
import toast from "react-hot-toast";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL + "/api",
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    // Show success message if response contains a message
    if (response.data?.message && response.config.method !== 'get') {
      toast.success(response.data.message);
    }
    return response;
  },
  (error) => {
    if (typeof window !== "undefined") {
      const isSuspended = error.response?.data?.suspended === true;
      const errorMessage = error.response?.data?.message ||
                          error.response?.data?.error ||
                          error.message ||
                          "An error occurred";

      if (error.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/";
      } else if (isSuspended) {
        // Mark user as suspended in localStorage and notify the dashboard
        try {
          const stored = JSON.parse(localStorage.getItem("user") || "{}");
          localStorage.setItem("user", JSON.stringify({ ...stored, isSuspended: true }));
        } catch {}
        window.dispatchEvent(new CustomEvent("account-suspended"));
      } else {
        toast.error(errorMessage);
      }
    }
    return Promise.reject(error);
  }
);

export default api;

