import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router";
import { useTheme } from "@/store/theme";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { getPost, getUserInfo } from "@/api/Threads";
import { Button } from "@/components/ui/button";
import CreatePostFeed from "@/components/CreatePostFeed";
import PostCard from "./PostCard";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { useTranslation } from "react-i18next";
import ReplyModal from "@/components/post/ReplyModal";
import EmbedModal from "@/components/post/EmbedModal";
import CreateFeed from "@/components/CreateFeed";

const TABS = [
  { key: "for_you", labelKey: "for_you" },
  { key: "following", labelKey: "following" },
  { key: "ghost", labelKey: "ghost_posts" },
];

export default function Home() {
  const theme = useTheme((s) => s.theme);
  const { t } = useTranslation();
  const [tab, setTab] = useState("for_you");
  const [isOpenTab, setIsOpenTab] = useState(false);
  const [isCreateTab, setIsCreateTab] = useState(false);
  const [isOpenPost, setIsOpenPost] = useState(false);
  const [replyPost, setReplyPost] = useState(null);
  const [embedPost, setEmbedPost] = useState(null);

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
    queryKey: ["posts", tab],
    queryFn: ({ pageParam = 1 }) => getPost(tab, pageParam, 10),
    getNextPageParam: (last) => {
      const p = last?.pagination;
      if (!p) return undefined;
      return p.current_page < p.last_page ? p.current_page + 1 : undefined;
    },
    initialPageParam: 1,
  });

  const posts = data?.pages?.flatMap((p) => p.data || []) || [];

  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const sentinelRef = useInfiniteScroll(
    loadMore,
    !!hasNextPage,
    isFetchingNextPage,
  );

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        setIsOpenPost(false);
        setReplyPost(null);
        setEmbedPost(null);
        setIsCreateTab(false);
        setIsOpenTab(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="h-screen w-full overflow-hidden flex flex-col">
      <header className="fixed top-0 left-0 w-full h-14 backdrop-blur-3xl z-10">
        <div className="h-full py-1 px-5 grid grid-cols-1 lg:grid-cols-[1fr_2fr_1fr] items-center">
          <Link
            to="/"
            className="text-xl md:text-2xl hidden lg:block font-bold italic"
          >
            <i className="fa-brands fa-threads" /> threads
          </Link>

          <div className="flex w-full relative max-w-150 justify-self-center items-center p-2">
            <div className="flex ml-5 md:ml-0  justify-between w-full overflow-x-auto">
              <div className="flex gap-3 items-center justify-center">
                {TABS.map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setTab(item.key)}
                    className={`text-xs md:text-sm cursor-pointer lg:text-base font-semibold whitespace-nowrap pb-1 border-b-2 transition ${
                      tab === item.key
                        ? "border-current"
                        : "border-transparent text-neutral-500"
                    }`}
                  >
                    {t(item.labelKey)}
                  </button>
                ))}
              </div>

              <div>
                <button
                  onClick={() => setIsOpenTab((prev) => !prev)}
                  className="px-1  hidden md:flex items-center justify-center py-1.5 text-xs border border-neutral-400 rounded-full cursor-pointer"
                >
                  <i className="fa-solid fa-ellipsis"></i>
                </button>
                <Link to="/search" className="block md:hidden">
                  <span>
                    <i className="fa-solid fa-magnifying-glass"></i>
                  </span>
                </Link>
              </div>
            </div>
            {isOpenTab && (
              <div className="px-2 py-1.5 rounded-lg bg-neutral-600 absolute z-50 w-55  top-10 right-5">
                <button
                  onClick={() => setIsCreateTab((prev) => !prev)}
                  className="flex p-1 cursor-pointer  w-full hover:bg-neutral-700  rounded-lg  items-center justify-between"
                >
                  <span>Tạo bảng feed mới</span>
                  <span>
                    <i className="fa-solid fa-circle-plus"></i>
                  </span>
                </button>
              </div>
            )}
          </div>
          <div className="hidden lg:block" />
        </div>
      </header>

      {isCreateTab && (
        <CreateFeed
          isOpen={isCreateTab}
          isClose={() => setIsCreateTab(false)}
        />
      )}

      {isOpenPost && (
        <CreatePostFeed
          isOpen={isOpenPost}
          isClose={() => setIsOpenPost(false)}
          user={currentUser}
        />
      )}

      {replyPost && (
        <ReplyModal
          post={replyPost}
          user={currentUser}
          isOpen={!!replyPost}
          onClose={() => setReplyPost(null)}
          onComment={() => setReplyPost(post)}
        />
      )}

      {embedPost && (
        <EmbedModal post={embedPost} onClose={() => setEmbedPost(null)} />
      )}

      <main className="flex-1 w-full max-w-150 mx-auto border-t border-x border-zinc-700 rounded-t-xl mt-14 h-[calc(100vh-3.5rem)] overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="min-h-full pb-24 md:pb-6">
          {token && currentUser && (
            <div className="p-4 border-b border-zinc-800 flex items-center gap-3">
              <img
                src={
                  currentUser?.avatar_url ||
                  currentUser?.avatar ||
                  "/default-avatar.jpg"
                }
                alt=""
                className="w-10 h-10 rounded-full object-cover"
              />
              <div
                onClick={() => setIsOpenPost(true)}
                className="flex-1 text-zinc-400 text-sm px-4 py-2.5 rounded-xl cursor-pointer flex justify-between items-center"
              >
                <span>
                  Có gì mới, {currentUser?.name || currentUser?.username}?
                </span>
                <Button
                  size="sm"
                  className={`font-semibold text-sm px-4 rounded-lg border ${
                    theme === "dark"
                      ? "bg-white text-black border-white"
                      : "bg-black text-white border-black"
                  }`}
                >
                  Đăng
                </Button>
              </div>
            </div>
          )}

          {!token && (
            <div className="p-6 text-center border-b border-zinc-800">
              <p className="text-neutral-400 mb-3">{t("login_to_see_more")}</p>
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

          {isLoading ? (
            <div className="text-center pt-20 font-bold">Loading...</div>
          ) : error ? (
            <div className="text-red-500 text-center pt-20">
              Không thể tải bài viết.
            </div>
          ) : (
            <div>
              {posts.map((post) => (
                <div key={post.id}  className="border-b border-zinc-800">
                  <PostCard
                    post={post}
                    currentUserId={currentUser?.id}
                    onComment={() => setReplyPost(post)}
                    onEmbed={(p) => setEmbedPost(p)}
                  />
                </div>
              ))}
              <div
                ref={sentinelRef}
                className="h-12 flex items-center justify-center"
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
