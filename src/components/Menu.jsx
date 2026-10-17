import { useEffect, useRef, useState } from "react";
import { NavLink, Link } from "react-router";
import { useTheme } from "../store/theme";
import { Button } from "./ui/button";
import { getUserInfo, logout } from "@/api/Threads";
import CreatePostFeed from "./CreatePostFeed";
import { useQuery } from "@tanstack/react-query";

export default function Menu() {
  const [isShowAdd, setIsShowAdd] = useState(false);
  const [isInterface, setIsInterface] = useState(false);
  const menuRef = useRef(null);
  const [createPost, setCreatePost] = useState(false);

  const token = localStorage.getItem("access_token");

  const theme = useTheme((state) => state.theme);
  const themeLight = useTheme((state) => state.themeLight);
  const themeDark = useTheme((state) => state.themeDark);
  const themeAuto = useTheme((state) => state.themeAuto);

  const { data: userData } = useQuery({
    queryKey: ["currentUser"],
    queryFn: getUserInfo,
    enabled: !!token,
  });
  const currentUser = userData?.data || userData;
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsShowAdd(false);
        setIsInterface(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key !== "Escape") return;

      if (isInterface) {
        setIsInterface(false);
        setIsShowAdd(true);
      } else if (isShowAdd) {
        setIsShowAdd(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isInterface, isShowAdd]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.log(error);
    } finally {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      window.location.reload();
    }
  };

  const navLinkClass = ({ isActive }) =>
    `flex justify-start items-center w-fit gap-4 p-3 md:p-2 rounded-xl text-base md:text-sm md:w-full cursor-pointer transition-all duration-200 ${
      isActive
        ? "text-white bg-neutral-900 font-semibold"
        : "text-neutral-500 hover:bg-neutral-800 hover:text-neutral-200"
    }`;

  return (
    <div ref={menuRef}>
      <div
        className={`fixed bottom-0 left-0 w-full z-40 backdrop-blur-md border-t border-zinc-800/40 md:bg-transparent md:backdrop-blur-none md:border-t-0 md:w-30 lg:w-60 md:top-20 md:bottom-0 md:h-[calc(100vh-5rem)] flex flex-col md:p-2`}
      >
        <div className="flex-1 relative">
          <div className="flex px-4 py-2 md:py-2 md:px-2 md:flex-col flex-row items-center justify-between h-auto md:items-start md:justify-start gap-1.5 w-full">
            <div className="w-fit lg:w-full order-1 md:order-1">
              <NavLink to="/" className={navLinkClass}>
                <i className="fa-solid fa-house text-xl w-6 text-center"></i>
                <span className="hidden lg:block">Dành cho bạn</span>
              </NavLink>
            </div>

            <div className="w-fit lg:w-full order-3 md:order-3">
              <button
                onClick={() => setCreatePost((prev) => !prev)}
                className="flex gap-4 p-2 text-neutral-500 hover:text-white rounded-xl w-fit lg:w-full hover:bg-neutral-800"
              >
                <i className="fa-solid fa-plus text-xl w-6 text-center"></i>
                <span className="hidden lg:block">Thread mới</span>
              </button>
            </div>

            <div className="hidden md:block w-fit lg:w-full md:order-2">
              <NavLink to="/search" className={navLinkClass}>
                <i className="fa-solid fa-magnifying-glass text-xl w-6 text-center"></i>
                <span className="hidden lg:block">Tìm kiếm</span>
              </NavLink>
            </div>

            <div className="w-fit lg:w-full order-2 md:order-4">
              <NavLink to="/messenger" className={navLinkClass}>
                <i className="fa-solid fa-paper-plane text-xl w-6 text-center"></i>
                <span className="hidden lg:block">Tin nhắn</span>
              </NavLink>
            </div>

            <div className="w-fit lg:w-full order-4 md:order-5">
              <NavLink to="/active" className={navLinkClass}>
                <i className="fa-solid fa-heart text-xl w-6 text-center"></i>
                <span className="hidden lg:block">Hoạt động</span>
              </NavLink>
            </div>

            <div className="w-fit lg:w-full order-5 md:order-6">
              <NavLink to="/account" className={navLinkClass}>
                <i className="fa-solid fa-user text-xl w-6 text-center"></i>
                <span className="hidden lg:block">Trang cá nhân</span>
              </NavLink>
            </div>

            <div className="hidden md:block w-fit lg:w-full order-7">
              <NavLink to="/analytics" className={navLinkClass}>
                <i className="fa-solid fa-square-poll-vertical text-xl w-6 text-center"></i>
                <span className="hidden lg:block">Thông tin chi tiết</span>
              </NavLink>
            </div>

            <div className="hidden md:block w-fit lg:w-full order-8">
              <NavLink to="/saved" className={navLinkClass}>
                <i className="fa-solid fa-bookmark text-xl w-6 text-center"></i>
                <span className="hidden lg:block">Đã lưu</span>
              </NavLink>
            </div>

            {!token && (
              <div className="w-full flex-col gap-4 order-9 hidden lg:flex">
                <Link to="/login" className="w-full">
                  <Button
                    size="lg"
                    variant={theme === "dark" ? "secondary" : "default"}
                    className={`font-semibold w-full text-sm px-4 py-1.5 rounded-lg hover:opacity-90 transition-all border ${
                      theme === "dark"
                        ? "bg-white text-black border-white"
                        : "bg-black text-white border-black"
                    }`}
                  >
                    Đăng Nhập
                  </Button>
                </Link>

                <Link to="/register" className="w-full">
                  <Button
                    size="lg"
                    variant={theme === "dark" ? "secondary" : "default"}
                    className={`font-semibold w-full text-sm px-4 py-1.5 rounded-lg hover:opacity-90 transition-all border ${
                      theme === "dark"
                        ? "bg-white text-black border-white"
                        : "bg-black text-white border-black"
                    }`}
                  >
                    Đăng ký
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
      {createPost && (
        <CreatePostFeed
          isOpen={createPost}
          isClose={() => setCreatePost(false)}
          user={currentUser}
        />
      )}

      <button
        onClick={() => {
          setIsShowAdd((prev) => !prev);
          setIsInterface(false);
        }}
        className={`fixed w-fit lg:w-55 top-3 left-2 z-[100] md:bottom-2 md:left-2 md:top-auto px-2 py-2 md:px-4 md:py-2 rounded-lg flex gap-2 items-center cursor-pointer ${
          theme === "dark" ? "hover:bg-neutral-800" : "hover:bg-slate-300"
        }`}
      >
        <i className="fa-solid fa-equals"></i>
        <span className="hidden md:block">Xem thêm</span>
      </button>

      {isShowAdd && (
        <div
          className={`fixed top-12 left-2 z-[100] w-50 md:w-55 rounded-xl shadow-lg overflow-hidden ${
            theme === "dark"
              ? "bg-neutral-800 text-white"
              : "bg-white text-black"
          } md:bottom-2 md:left-45 lg:left-60 md:top-auto`}
        >
          <div className="p-2">
            <button
              onClick={() => {
                setIsInterface(true);
                setIsShowAdd(false);
              }}
              className="px-2 text-left rounded-md hover:bg-neutral-500 py-2 w-full flex items-center justify-between"
            >
              <span>Giao diện</span>
              <span>
                <i className="fa-solid fa-chevron-right"></i>
              </span>
            </button>

            <button className="px-2 text-left rounded-md hover:bg-neutral-500 py-2 w-full">
              Cài đặt
            </button>
          </div>

          <div className="p-2 border-y border-gray-500">
            <button className="px-2 text-left rounded-md hover:bg-neutral-500 py-2 w-full">
              Đã thích
            </button>

            <button className="px-2 text-left rounded-md hover:bg-neutral-500 py-2 w-full">
              Lưu trữ
            </button>
          </div>

          <div className="p-2">
            <button className="px-2 text-left rounded-md hover:bg-neutral-500 py-2 w-full mb-2">
              Báo cáo sự cố
            </button>

            {!token && (
              <div className="border-t border-neutral-700/50 pt-2 flex flex-col lg:hidden">
                <Link
                  to="/login"
                  className="px-2 text-left rounded-md hover:bg-neutral-500 py-2 w-full"
                >
                  Đăng Nhập
                </Link>

                <Link
                  to="/register"
                  className="px-2 text-left rounded-md hover:bg-neutral-500 py-2 w-full"
                >
                  Đăng ký
                </Link>
              </div>
            )}

            {token && (
              <button
                onClick={handleLogout}
                className="px-2 text-left rounded-md hover:bg-neutral-500 py-2 w-full text-red-600"
              >
                Đăng xuất
              </button>
            )}
          </div>
        </div>
      )}

      {isInterface && (
        <div
          className={`fixed top-12 left-2 z-[100] w-60  rounded-xl p-2 ${
            theme === "dark"
              ? "bg-neutral-800 text-white"
              : "bg-slate-300 text-black"
          } md:bottom-2 md:left-45 lg:left-60  md:top-auto`}
        >
          <div className="grid grid-cols-3 w-full mb-2">
            <button
              onClick={() => {
                setIsInterface(false);
                setIsShowAdd(true);
              }}
              className="flex items-center justify-start"
            >
              <i className="fa-solid fa-arrow-left-long"></i>
            </button>

            <div className="col-span-2 flex items-center justify-center font-semibold">
              Giao diện
            </div>
          </div>

          <div
            className={`flex gap-1 p-1 rounded-xl ${
              theme === "dark" ? "bg-neutral-900" : "bg-zinc-200"
            }`}
          >
            <button
              onClick={themeLight}
              className={`flex items-center justify-center w-full h-10 rounded-lg cursor-pointer transition-all duration-200 ${
                theme === "light"
                  ? "bg-zinc-800 text-white shadow-sm"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
              title="Chế độ sáng"
            >
              <i className="fa-solid fa-sun"></i>
            </button>

            <button
              onClick={themeDark}
              className={`flex items-center justify-center w-full h-10 rounded-lg cursor-pointer transition-all duration-200 ${
                theme === "dark"
                  ? "bg-zinc-800 text-white shadow-sm"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
              title="Chế độ tối"
            >
              <i className="fa-solid fa-moon"></i>
            </button>

            <button
              onClick={themeAuto}
              className={`flex items-center justify-center w-full h-10 rounded-lg text-sm font-medium cursor-pointer transition-all duration-200 ${
                theme === "auto"
                  ? "bg-zinc-800 text-white shadow-sm border border-zinc-700/50"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
              title="Tự động"
            >
              <i className="fa-solid fa-circle-half-stroke"></i>
            </button>
          </div>

          <div className="mt-2">
            <button
              onClick={() => {
                setIsInterface(false);
                setIsShowAdd(false);
              }}
              className="px-2 text-left rounded-md hover:bg-neutral-500 py-2 w-full"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
