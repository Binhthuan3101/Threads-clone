import { useTheme } from "@/store/theme";
import { Outlet } from "react-router";

export default function AuthLayout() {
  const theme = useTheme((state) => state.theme);

  return (
    <div className={`min-h-screen w-full ${theme==="dark"?"bg-black text-white":"bg-white text-black"} flex flex-col justify-between relative overflow-x-hidden select-none`}>
      <div className="absolute -top-30 left-0 w-full overflow-hidden pointer-events-none z-0">
        <img
          src="https://static.cdninstagram.com/rsrc.php/ym/r/gf40BP6SRYU.avif"
          alt="Threads"
          className="w-full object-cover origin-top scale-105 md:scale-100"
        />
      </div>

      <div className="flex-1 flex items-center justify-center z-10 px-4 pt-40 pb-20">
        <div
          className={`w-full max-w-120 h-fit rounded-2xl border ${
            theme === "dark"
              ? "border-zinc-800 bg-black"
              : "border-neutral-200 bg-white"
          } p-6 shadow-2xl`}
        >
          <Outlet />
        </div>
      </div>

      <footer className="w-full pb-8 z-10 px-6 relative flex flex-col items-center justify-center">
        <div className="max-w-4xl mx-auto">
          <ul className="flex flex-wrap gap-x-3 gap-y-2 items-center justify-center text-center">
            <li>
              <span
                className="text-neutral-600 text-[11px] whitespace-nowrap no-underline hover:underline"
                
              >
                © 2026
              </span>
            </li>
            <li>
              <a
                className="text-neutral-600 text-[11px] whitespace-nowrap no-underline hover:underline"
                href="https://help.instagram.com/769983657850450"
              >
                Điều khoản của Threads
              </a>
            </li>
            <li>
              <a
                className="text-neutral-600 text-[11px] whitespace-nowrap no-underline hover:underline"
                href="https://help.instagram.com/515230437301944"
              >
                Chính sách quyền riêng tư
              </a>
            </li>
            <li>
              <a
                className="text-neutral-600 text-[11px] whitespace-nowrap no-underline hover:underline"
                href="https://privacycenter.instagram.com/policies/cookies/"
              >
                Chính sách cookie
              </a>
            </li>
            <li>
              <a
                className="text-neutral-600 text-[11px] whitespace-nowrap no-underline hover:underline"
                href="https://www.threads.com/login?hl=vi"
              >
                Báo cáo sự cố
              </a>
            </li>
          </ul>
        </div>

        <div className="hidden md:flex flex-col items-center fixed bottom-6 right-8">
          <span className="text-neutral-500 text-[11px] mb-3">
            Quét để tải ứng dụng
          </span>
          <div className=" bg-neutral-900 border text-white border-zinc-800/60 rounded-xl p-3 flex items-center justify-center shadow-lg hover:scale-110 transition">
            <img src="/QR.png" alt="QR" className="w-24 h-24 object-cover" />
          </div>
        </div>
      </footer>
    </div>
  );
}
