import { Outlet } from "react-router";

export default function EmbedLayout() {
  return (
    <div className="min-h-screen w-full bg-white text-black">
      <main className="w-full max-w-xl mx-auto">
        <Outlet />
      </main>
    </div>
  );
}
