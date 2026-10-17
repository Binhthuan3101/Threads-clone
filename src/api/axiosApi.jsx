import axios from "axios";

export const request = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL || "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

const refreshRequest = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL || "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

request.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Quan trọng: nếu data là FormData thì XÓA Content-Type
  // để browser tự set multipart/form-data + boundary đúng
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }

  return config;
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token);
    }
  });

  failedQueue = [];
};

request.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    // Nếu không phải lỗi 401 hoặc request đã qua retry 1 lần thì trả về lỗi luôn
    if (error.response?.status !== 401 || originalRequest?._retry) {
      return Promise.reject(error);
    }

    // Nếu đang trong quá trình refresh token, cho các request đến sau vào hàng chờ
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return request(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const refreshToken = localStorage.getItem("refresh_token");

      if (!refreshToken) {
        throw new Error("Không tìm thấy refresh token");
      }

      // Dùng refreshRequest riêng biệt thay vì request
      const { data } = await refreshRequest.post("/auth/refresh", {
        refresh_token: refreshToken,
      });

      const newToken = data.access_token;

      localStorage.setItem("access_token", newToken);
      request.defaults.headers.common.Authorization = `Bearer ${newToken}`;

      processQueue(null, newToken);

      originalRequest.headers.Authorization = `Bearer ${newToken}`;

      return request(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);

      // Refresh thất bại -> Xóa sạch token và chuyển hướng về trang login
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");

      window.location.href = "/login";

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);