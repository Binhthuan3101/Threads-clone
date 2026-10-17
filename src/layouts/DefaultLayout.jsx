import { Outlet } from "react-router";
import Menu from "../components/Menu";
import { useTheme } from "../store/theme";

export default function DefaultLayout() {
  const theme = useTheme((state) => state.theme);
  const styleTheme =
    theme === "dark" ? "bg-black text-white" : "bg-white text-black";

  return (
    <div className={`relative min-h-screen flex flex-col ${styleTheme}`}>
      <div className="relative">
        <Menu />
      </div>
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
