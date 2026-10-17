import { useTheme } from "../store/theme";
import { Link } from "react-router";
import { useState } from "react";
import CreateFeed from "../components/CreateFeed";
import { useQuery } from "@tanstack/react-query";
import { getUserInfo } from "@/api/Threads";

export default function AccountUser() {
  const theme = useTheme((state) => state.theme);
  const token = localStorage.getItem("access_token");

  const { data: userData } = useQuery({
    queryKey: ["currentUser"],
    queryFn: getUserInfo,
    enabled: !!token,
  });

  const currentUser = userData?.data || userData;

  const [isShow, setIsShow] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="h-screen w-full overflow-hidden flex flex-col">
      <header className="fixed top-0 left-0 w-full h-14 backdrop-blur-3xl z-10 border-b border-zinc-900/50">
        <div className="h-full py-1 px-5 grid-cols-1 lg:grid-cols-[1fr_2fr_1fr] grid items-center">
          <Link
            to="/"
            className="text-xl md:text-2xl hidden lg:block font-bold italic"
          >
            <span>
              <i className="fa-brands fa-threads"></i>
            </span>
            <span>threads</span>
          </Link>

          <div className="flex relative w-full max-w-150 justify-self-center justify-between items-center p-2">
            <button className="pl-5 md:pl-0 text-base md:text-lg font-bold">
              {currentUser?.name}
            </button>

            <button
              onClick={() => setIsShow((prev) => !prev)}
              className="px-0.5 cursor-pointer rounded-full border border-inherit"
            >
              <i className="fa-solid fa-ellipsis"></i>
            </button>

            {isShow && (
              <div
                className={`absolute p-3 rounded-2xl ${
                  theme === "dark" ? "bg-neutral-900" : "bg-white"
                } top-10 right-2 w-60 z-50 shadow-xl`}
              >
                <button
                  onClick={() => {
                    setIsOpen(true);
                    setIsShow(false);
                  }}
                  className="flex w-full hover:bg-gray-700 rounded-md p-1 justify-between items-center"
                >
                  <span className="font-bold text-sm">Tạo bảng feed mới</span>

                  <span>
                    <i className="fa-solid fa-circle-plus"></i>
                  </span>
                </button>
              </div>
            )}
          </div>

          <div></div>
        </div>
      </header>

      {isOpen && (
        <CreateFeed isOpen={isOpen} isClose={() => setIsOpen(false)} />
      )}

      <main className="flex-1 w-full max-w-150 mx-auto border-t border-x border-zinc-600 rounded-t-xl mt-18 h-[calc(100vh-3.5rem)] overflow-y-auto">
        <div className="min-h-full pb-24 md:pb-6">
          <div className="divide-y divide-zinc-900">
            <div className="p-5 w-full">
              <div className="flex p-3 items-start justify-between gap-5">
                <div className="min-w-0 flex-1">
                  <h1 className="font-bold text-3xl break-words">
                    {currentUser?.name}
                  </h1>

                  <h3 className="text-lg text-neutral-500 break-words">
                    {currentUser?.username}
                  </h3>

                  {currentUser?.bio && (
                    <p className="text-sm mt-2 whitespace-pre-wrap break-words">
                      {currentUser.bio}
                    </p>
                  )}
                </div>

                <div className="shrink-0">
                  <label className="block cursor-pointer">
                    <img
                      src={currentUser?.avatar_url || "/default-avatar.jpg"}
                      alt="avatar"
                      className="w-25 h-25 rounded-full object-cover"
                    />

                    <input type="file" accept="image/*" className="hidden" />
                  </label>
                </div>
              </div>

              <div className="flex gap-5 px-3 mt-5 text-sm">
                <span>
                  <strong>{currentUser?.followers_count || 0}</strong> người
                  theo dõi
                </span>

                <span>
                  <strong>{currentUser?.following_count || 0}</strong> đang theo
                  dõi
                </span>
              </div>

              <Link
                to="/update-profile"
                className="w-full block text-center mt-5 border border-zinc-600 rounded-lg py-2 font-semibold hover:bg-zinc-800 transition"
              >
                Chỉnh sửa trang cá nhân
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
