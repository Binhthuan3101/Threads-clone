import { useCallback } from "react";
import { Link, useParams, useLocation } from "react-router";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getPostsByTopic } from "@/api/Threads";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { useTheme } from "@/store/theme";
import PostCard from "@/pages/HomePage/PostCard";

export default function TopicPage() {
  const { topicId } = useParams();
  const location = useLocation();
  const topicFromState = location.state?.topic;
  const theme = useTheme((s) => s.theme);

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    error,
  } = useInfiniteQuery({
    queryKey: ["topicPosts", topicId],
    queryFn: ({ pageParam = 1 }) => getPostsByTopic(topicId, pageParam, 10),
    getNextPageParam: (last) => {
      const p = last?.pagination;
      if (!p) return undefined;
      return p.current_page < p.last_page ? p.current_page + 1 : undefined;
    },
    initialPageParam: 1,
    enabled: !!topicId,
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

  const topicName =
    topicFromState?.name ||
    topicFromState?.slug ||
    posts[0]?.topic?.name ||
    `Chủ đề #${topicId}`;

  return (
    <div
      className={`h-screen w-full overflow-hidden flex flex-col ${
        theme === "dark" ? "bg-black text-white" : "bg-white text-black"
      }`}
    >
      <header className="fixed top-0 left-0 w-full h-14 backdrop-blur-3xl z-10 border-b border-zinc-800/50">
        <div className="h-full px-5 max-w-150 mx-auto flex items-center gap-4">
          <Link
            to="/search"
            className="p-2 rounded-full hover:bg-neutral-800"
          >
            <i className="fa-solid fa-arrow-left" />
          </Link>
          <div className="min-w-0">
            <h1 className="font-bold text-base truncate flex items-center gap-1">
              <span className="text-neutral-500">#</span>
              {topicName}
            </h1>
            {topicFromState?.posts_count != null && (
              <p className="text-xs text-neutral-500">
                {topicFromState.posts_count} bài viết
              </p>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-150 mx-auto border-t border-x border-zinc-700 rounded-t-xl mt-14 h-[calc(100vh-3.5rem)] overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="min-h-full pb-24 md:pb-6">
          {isLoading && (
            <div className="text-center pt-20 font-bold">Loading...</div>
          )}

          {error && (
            <div className="text-center pt-20 text-red-400 text-sm">
              Không tải được bài viết của chủ đề này.
            </div>
          )}

          {!isLoading && !error && posts.length === 0 && (
            <div className="text-center pt-20 text-neutral-500 text-sm">
              Chưa có bài viết nào trong chủ đề này.
            </div>
          )}

          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}

          <div
            ref={sentinelRef}
            className="h-10 flex items-center justify-center"
          >
            {isFetchingNextPage && (
              <span className="text-sm text-neutral-500">Đang tải thêm...</span>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}