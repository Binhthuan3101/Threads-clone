import { useState } from "react";
import { Link } from "react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  followUser,
  getFollowSuggestions,
  search,
  unfollowUser,
} from "@/api/Threads";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/hooks/useDebounce";
import { useTheme } from "@/store/theme";

function UserRow({ user }) {
  const queryClient = useQueryClient();
  const [following, setFollowing] = useState(!!user.is_following);

  const followMutation = useMutation({
    mutationFn: async (wantFollow) => {
      if (!user?.id) throw new Error("Không có user id");
      return wantFollow ? followUser(user.id) : unfollowUser(user.id);
    },
    onMutate: async (wantFollow) => {
      const prev = following;
      setFollowing(wantFollow);
      return { prev };
    },
    onError: (err, _wantFollow, ctx) => {
      const msg = err?.response?.data?.message || "";
      if (/already following/i.test(msg)) {
        setFollowing(true);
        return;
      }
      if (/not following/i.test(msg)) {
        setFollowing(false);
        return;
      }
      if (ctx) setFollowing(ctx.prev);
      console.error("Follow error:", err?.response?.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["search"] });
      queryClient.invalidateQueries({ queryKey: ["suggestions"] });
    },
  });

  return (
    <div className="flex items-center gap-3 px-4 py-3 hover:bg-neutral-900/40 transition">
      <Link
        to={`/${user.username}`}
        className="flex items-center gap-3 flex-1 min-w-0"
      >
        <img
          src={user.avatar_url || user.avatar || "/default-avatar.jpg"}
          alt=""
          className="w-11 h-11 rounded-full object-cover shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <span className="font-semibold text-sm truncate">
              {user.name || user.username}
            </span>
            {user.verified && (
              <i className="fa-solid fa-circle-check text-sky-500 text-xs" />
            )}
          </div>
          <p className="text-sm text-neutral-500 truncate">@{user.username}</p>
          {user.bio && (
            <p className="text-sm text-neutral-400 line-clamp-1 mt-0.5">
              {user.bio}
            </p>
          )}
          {user.followers_count != null && (
            <p className="text-xs text-neutral-500 mt-0.5">
              {user.followers_count} người theo dõi
            </p>
          )}
        </div>
      </Link>

      <Button
        size="sm"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          followMutation.mutate(!following);
        }}
        disabled={followMutation.isPending}
        className={`shrink-0 rounded-xl text-sm font-semibold px-4 h-8 ${
          following
            ? "bg-transparent border border-zinc-600 text-white hover:bg-neutral-800"
            : "bg-white text-black hover:bg-neutral-200"
        }`}
      >
        {following ? "Đang theo dõi" : "Theo dõi"}
      </Button>
    </div>
  );
}

function TopicRow({ topic }) {
  return (
    <Link
      to={`/topic/${topic.id}`}
      state={{ topic }}
      className="flex items-center gap-3 px-4 py-3 hover:bg-neutral-900/40 transition"
    >
      <div className="w-11 h-11 rounded-full bg-neutral-800 flex items-center justify-center shrink-0">
        <i className="fa-solid fa-hashtag text-neutral-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm truncate">
          {topic.name || topic.title || topic.slug}
        </p>
        {topic.posts_count != null && (
          <p className="text-xs text-neutral-500">
            {topic.posts_count} bài viết
          </p>
        )}
      </div>
      <i className="fa-solid fa-chevron-right text-neutral-600 text-xs" />
    </Link>
  );
}

export default function Search() {
  const theme = useTheme((s) => s.theme);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 500);
  const token = localStorage.getItem("access_token");
  const canSearch = debouncedQuery.trim().length >= 2;

  const { data: searchData, isFetching: searching } = useQuery({
    queryKey: ["search", debouncedQuery],
    queryFn: () => search(debouncedQuery.trim(), 1, 10, 20),
    enabled: canSearch,
  });

  // Gợi ý khi CHƯA search (ô trống / < 2 ký tự)
  const { data: suggestionsData, isLoading: loadingSuggestions } = useQuery({
    queryKey: ["suggestions"],
    queryFn: () => getFollowSuggestions(1, 15),
    enabled: !!token && !canSearch,
  });

  const result = searchData?.data || searchData;
  const users = result?.users || [];
  const topics = result?.topics || [];
  const suggestions = Array.isArray(suggestionsData?.data)
    ? suggestionsData.data
    : Array.isArray(suggestionsData)
      ? suggestionsData
      : [];

  return (
    <div
      className={`h-screen w-full overflow-hidden flex flex-col ${
        theme === "dark" ? "bg-black text-white" : "bg-white text-black"
      }`}
    >
      <header className="fixed top-0 left-0 w-full h-14 backdrop-blur-3xl z-10">
        <div className="h-full px-5 grid grid-cols-1 lg:grid-cols-[1fr_2fr_1fr] items-center">
          <Link
            to="/"
            className="text-xl md:text-2xl hidden lg:block font-bold italic"
          >
            <i className="fa-brands fa-threads" /> threads
          </Link>

          <div className="w-full max-w-150 justify-self-center px-2">
            <div className="relative">
              <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 text-sm" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Tìm kiếm"
                className="w-full pl-10 pr-10 py-2.5 rounded-2xl  border border-zinc-800 text-sm focus:outline-none focus:border-zinc-600 placeholder:text-neutral-500"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white"
                >
                  <i className="fa-solid fa-circle-xmark" />
                </button>
              )}
            </div>
          </div>
          <div className="hidden lg:block" />
        </div>
      </header>

      <main className="flex-1 w-full max-w-150 mx-auto border-t border-x border-zinc-700 rounded-t-xl mt-14 h-[calc(100vh-3.5rem)] overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="min-h-full pb-24 md:pb-6">
          {/* Kết quả tìm kiếm */}
          {canSearch && (
            <>
              {searching && (
                <div className="text-center pt-16 text-neutral-500 text-sm">
                  Đang tìm...
                </div>
              )}

              {!searching && users.length === 0 && topics.length === 0 && (
                <div className="text-center pt-16 text-neutral-500 text-sm">
                  Không tìm thấy kết quả cho &quot;{debouncedQuery}&quot;
                </div>
              )}

              {topics.length > 0 && (
                <section>
                  <h2 className="px-4 pt-4 pb-2 text-sm font-bold text-neutral-400 uppercase tracking-wide">
                    Chủ đề
                  </h2>
                  {topics.map((topic) => (
                    <TopicRow key={topic.id || topic.slug} topic={topic} />
                  ))}
                </section>
              )}

              {users.length > 0 && (
                <section>
                  <h2 className="px-4 pt-4 pb-2 text-sm font-bold text-neutral-400 uppercase tracking-wide">
                    Người dùng
                  </h2>
                  {users.map((user) => (
                    <UserRow key={user.id} user={user} />
                  ))}
                </section>
              )}
            </>
          )}

          {/* Gợi ý khi chưa search */}
          {!canSearch && (
            <section>
              <h2 className="px-4 pt-4 pb-2 text-sm font-bold">
                Gợi ý theo dõi
              </h2>

              {!token && (
                <div className="px-4 py-6 text-center text-neutral-500 text-sm">
                  <p className="mb-3">Đăng nhập để xem gợi ý</p>
                  <Link to="/login">
                    <Button
                      className={
                        theme === "dark"
                          ? "bg-white text-black"
                          : "bg-black text-white"
                      }
                    >
                      Đăng nhập
                    </Button>
                  </Link>
                </div>
              )}

              {token && loadingSuggestions && (
                <div className="text-center pt-10 text-neutral-500 text-sm">
                  Đang tải...
                </div>
              )}

              {token &&
                !loadingSuggestions &&
                suggestions.map((user) => (
                  <UserRow key={user.id} user={user} />
                ))}

              {token && !loadingSuggestions && suggestions.length === 0 && (
                <div className="text-center pt-10 text-neutral-500 text-sm">
                  Không có gợi ý
                </div>
              )}
            </section>
          )}
        </div>
      </main>
    </div>
  );
}