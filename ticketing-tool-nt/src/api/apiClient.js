import axios from "axios";

// Create Axios instance
const apiClient = axios.create({
  baseURL: `${process.env.REACT_APP_API_URL}`, // ✅ configurable base URL
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Network status tracking
let isOnline = navigator.onLine;
let networkStatusListeners = [];

// Network status utility functions
export const checkNetworkStatus = () => navigator.onLine;

export const onNetworkStatusChange = (callback) => {
  networkStatusListeners.push(callback);
  // Return unsubscribe function
  return () => {
    networkStatusListeners = networkStatusListeners.filter(
      (listener) => listener !== callback
    );
  };
};

export const notifyNetworkStatus = (status) => {
  networkStatusListeners.forEach((listener) => listener(status));
};

// Network event listeners
window.addEventListener("online", () => {
  isOnline = true;
  notifyNetworkStatus(true);
  // You can trigger a notification here
  console.log("Internet connection restored");
  // Optional: Show toast notification
  showNetworkNotification("Internet connection restored", "success");
});

window.addEventListener("offline", () => {
  isOnline = false;
  notifyNetworkStatus(false);
  console.log("No internet connection");
  // Optional: Show toast notification
  showNetworkNotification("No internet connection", "error");
});

// Optional: Show notification function
const showNetworkNotification = (message, type = "info") => {
  // You can integrate with your UI notification system here
  // For example, if you're using react-toastify, material-ui, or custom notification
  if (typeof window !== "undefined") {
    // Simple browser alert (for demo - replace with your UI framework)
    // alert(message);

    // Or dispatch a custom event that your React components can listen to
    const event = new CustomEvent("network-status", {
      detail: { message, type, timestamp: new Date() },
    });
    window.dispatchEvent(event);
  }
};

// Add interceptors for auth or refresh tokens
apiClient.interceptors.request.use(
  (config) => {
    // Check network before making request
    if (!isOnline) {
      showNetworkNotification("No internet connection", "error");
      return Promise.reject({
        message: "No internet connection",
        isNetworkError: true,
      });
    }

    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // Handle network errors
    if (!error.response) {
      // No response means network error
      if (!isOnline) {
        showNetworkNotification("No internet connection", "error");
      } else {
        showNetworkNotification("Network error - please try again", "error");
      }

      console.error("Network Error:", error.message);
      throw {
        message: "Network error - please check your connection",
        isNetworkError: true,
        originalError: error,
      };
    }

    // Handle server errors
    console.error("API Error:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
);

// Export network status
export const getNetworkStatus = () => isOnline;

// Retry function for failed requests due to network issues
export const retryRequest = async (requestFn, maxRetries = 3, delay = 1000) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      if (checkNetworkStatus()) {
        return await requestFn();
      } else {
        throw new Error("No network connection");
      }
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise((resolve) => setTimeout(resolve, delay * (i + 1)));
    }
  }
};

export default apiClient;
