import { create } from "zustand";

export const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem("access_token") || null,
  isAuthenticated: !!localStorage.getItem("access_token"),
  
  setAuth: (user, token, refreshToken) => {
    localStorage.setItem("access_token", token);
    if (refreshToken) localStorage.setItem("refresh_token", refreshToken);
    set({ user, token, isAuthenticated: true });
  },

  setUser: (user) => set({ user }),

  logout: () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    set({ user: null, token: null, isAuthenticated: false });
  },
}));