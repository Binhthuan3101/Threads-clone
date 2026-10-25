import { useState } from "react";
import { Link } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { getFollowSuggestions, getUserInfo } from "@/api/Threads";
import { useTheme } from "@/store/theme";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/hooks/useDebounce";

export default function Messenger() {
  const theme = useTheme((s) => s.theme);
  const isDark = theme === "dark";
  const token = localStorage.getItem("access_token");
  const [query, setQuery] = useState("");
  const debounced = useDebounce(query, 300);

  const { data: meData } = useQuery({
    queryKey: ["currentUser"],
    queryFn: getUserInfo,
    enabled: !!token,
  });
  const me = meData?.data || meData;

  const { data: suggestionsData, isLoading } = useQuery({
    queryKey: ["suggestions"],
    queryFn: () => getFollowSuggestions(1, 20),
    enabled: !!token,
  });

  const list = Array.isArray(suggestionsData?.data)
    ? suggestionsData.data
    : Array.isArray(suggestionsData)
      ? suggestionsData
      : [];

  const filtered = debounced.trim()
    ? list.filter((u) => {
        const q = debounced.toLowerCase();
        return (
          u.username?.toLowerCase().includes(q) ||
          u.name?.toLowerCase().includes(q)
        );
      })
    : list;

  if (!token) {
    return (
      <div
        className={`min-h-screen flex flex-col items-center justify-center gap-4 ${
          isDark ? "bg-black text-white" : "bg-white text-black"
        }`}
      >
        <p className="text-neutral-400">Đăng nhập để xem tin nhắn</p>
        <Link to="/login">
          <Button
            className={
              isDark ? "bg-white text-black" : "bg-black text-white"
            }
          >
            Đăng nhập
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div
      className={`h-screen w-full overflow-hidden flex flex-col ${
        isDark ? "bg-black text-white" : "bg-white text-black"
      }`}
    >
      {/* Header */}
      <header className="fixed top-0 left-0 w-full h-14 backdrop-blur-3xl z-10 border-b border-zinc-800/50">
        <div className="h-full px-5 max-w-150 mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="lg:hidden text-neutral-400">
              <i className="fa-solid fa-arrow-left" />
            </Link>
            <h1 className="font-bold text-lg">Tin nhắn</h1>
          </div>
          <button
            type="button"
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-neutral-400 text-lg"
            title="Tin nhắn mới"
            onClick={() => alert("API tin nhắn chưa được F8 hỗ trợ")}
          >
            <i className="fa-regular fa-pen-to-square" />
          </button>
        </div>
      </header>

      <main className="flex-1 w-full max-w-150 mx-auto border-x border-zinc-700 mt-14 h-[calc(100vh-3.5rem)] overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {/* Search */}
        <div className="px-4 py-3 sticky top-0  backdrop-blur z-10">
          <div className="relative">
            <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 text-sm" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm kiếm"
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl  border border-zinc-800 text-sm focus:outline-none focus:border-zinc-600 placeholder:text-neutral-500"
            />
          </div>
        </div>

        {/* Empty inbox notice */}
        <div className="px-4 py-6 text-center border-b border-zinc-800">
          <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-neutral-800 flex items-center justify-center">
            <i className="fa-regular fa-comments text-xl text-neutral-500" />
          </div>
          <p className="font-semibold text-sm">Chưa có tin nhắn</p>
          <p className="text-xs text-neutral-500 mt-1 max-w-xs mx-auto">
            F8 API hiện chưa hỗ trợ chat. Dưới đây là gợi ý người dùng bạn có
            thể theo dõi.
          </p>
        </div>

        {/* Gợi ý liên hệ */}
        <section>
          <h2 className="px-4 pt-4 pb-2 text-xs font-bold text-neutral-500 uppercase tracking-wide">
            Gợi ý
          </h2>

          {isLoading && (
            <p className="text-center py-8 text-sm text-neutral-500">
              Đang tải...
            </p>
          )}

          {!isLoading && filtered.length === 0 && (
            <p className="text-center py-8 text-sm text-neutral-500">
              Không có gợi ý
            </p>
          )}

          {filtered.map((user) => (
            <Link
              key={user.id}
              to={`/${user.username}`}
              className="flex items-center gap-3 px-4 py-3 hover:bg-neutral-900/50 transition"
            >
              <img
                src={user.avatar_url || user.avatar || "/default-avatar.jpg"}
                alt=""
                className="w-12 h-12 rounded-full object-cover shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate flex items-center gap-1">
                  {user.name || user.username}
                  {user.verified && (
                    <i className="fa-solid fa-circle-check text-sky-500 text-xs" />
                  )}
                </p>
                <p className="text-xs text-neutral-500 truncate">
                  @{user.username}
                  {user.bio ? ` · ${user.bio}` : ""}
                </p>
              </div>
              <span className="text-xs text-neutral-600 shrink-0">
                Xem trang
              </span>
            </Link>
          ))}
        </section>

        <div className="h-20" />
      </main>
    </div>
  );
}