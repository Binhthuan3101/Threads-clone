import { useCallback } from "react";
import { Link } from "react-router";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { useTheme } from "@/store/theme";
import PostCard from "@/pages/HomePage/PostCard";
import { getSavedPosts, getUserInfo } from "@/api/Threads";

export default function Save() {
  const theme = useTheme((s) => s.theme);
  const token = localStorage.getItem("access_token");

  const { data: userData } = useQuery({
    queryKey: ["currentUser"],
    queryFn: getUserInfo,
    enabled: !!token,
  });
  const currentUser = userData?.data || userData;

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    error,
  } = useInfiniteQuery({
    queryKey: ["savedPosts"],
    queryFn: ({ pageParam = 1 }) => getSavedPosts(pageParam, 10),
    getNextPageParam: (last) => {
      const p = last?.pagination;
      if (!p) return undefined;
      return p.current_page < p.last_page ? p.current_page + 1 : undefined;
    },
    initialPageParam: 1,
    enabled: !!token,
  });

  const posts = data?.pages?.flatMap((p) => p.data || []) || [];

  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const sentinelRef = useInfiniteScroll(
    loadMore,
    !!hasNextPage,
    isFetchingNextPage
  );

  if (!token) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-neutral-400">Đăng nhập để xem bài đã lưu</p>
        <Link to="/login" className="font-bold underline">
          Đăng nhập
        </Link>
      </div>
    );
  }

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
          <h1 className="text-base md:text-lg font-bold text-center lg:text-left pl-5 md:pl-0">
            Đã lưu
          </h1>
          <div />
        </div>
      </header>

      <main className="flex-1 w-full max-w-150 mx-auto border-t border-x border-zinc-700 rounded-t-xl mt-14 h-[calc(100vh-3.5rem)] overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="min-h-full pb-24 md:pb-6">
          {isLoading ? (
            <div className="text-center pt-20 font-bold">Loading...</div>
          ) : error ? (
            <div className="text-red-500 text-center pt-20">
              Không thể tải bài đã lưu.
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center pt-20 text-neutral-500 text-sm">
              Chưa có bài viết nào được lưu.
              <br />
              Bấm ⋮ trên bài viết → Lưu
            </div>
          ) : (
            <div>
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  currentUserId={currentUser?.id}
                />
              ))}
              <div
                ref={sentinelRef}
                className="h-10 flex items-center justify-center"
              >
                {isFetchingNextPage && (
                  <span className="text-sm text-neutral-500">
                    Đang tải thêm...
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}