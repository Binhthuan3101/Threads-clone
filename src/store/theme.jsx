import { create } from "zustand";

const getInitial = () => {
  const s = localStorage.getItem("theme");
  return s === "light" || s === "dark" || s === "auto" ? s : "dark";
};

const apply = (theme) => {
  const dark =
    theme === "dark" ||
    (theme === "auto" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", dark);
  localStorage.setItem("theme", theme);
};

apply(getInitial());

export const useTheme = create((set) => ({
  theme: getInitial(),
  themeLight: () => {
    apply("light");
    set({ theme: "light" });
  },
  themeDark: () => {
    apply("dark");
    set({ theme: "dark" });
  },
  themeAuto: () => {
    apply("auto");
    set({ theme: "auto" });
  },
}));