import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  getUserByUsername,
  getUserInfo,
  getUserPosts,
  followUser,
  unfollowUser,
} from "@/api/Threads";
import { Button } from "@/components/ui/button";
import PostCard from "@/pages/HomePage/PostCard";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { useCallback } from "react";
import { useTheme } from "@/store/theme";

export default function Profile() {
  const { username } = useParams();
  const queryClient = useQueryClient();
  const token = localStorage.getItem("access_token");
  const theme = useTheme((s) => s.theme);
  const { data: meData } = useQuery({
    queryKey: ["currentUser"],
    queryFn: getUserInfo,
    enabled: !!token,
  });
  const me = meData?.data || meData;

  const {
    data: profileRes,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["profile", username],
    queryFn: () => getUserByUsername(username),
    enabled: !!username,
  });

  const profile = profileRes?.data || profileRes;

  const [following, setFollowing] = useState(!!profile?.is_following);

  useEffect(() => {
  if (profile) {
    setFollowing(!!profile.is_following);
  }
}, [profile?.id, profile?.is_following]);

  const isMe =
    me?.id != null &&
    profile?.id != null &&
    String(me.id) === String(profile.id);

  const followMutation = useMutation({
    mutationFn: async (wantFollow) => {
      if (!profile?.id) throw new Error("No user id");
      return wantFollow ? followUser(profile.id) : unfollowUser(profile.id);
    },
    onMutate: (wantFollow) => {
      const prev = following;
      setFollowing(wantFollow);
      return { prev };
    },
    onError: (err, _w, ctx) => {
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
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", username] });
    },
  });

  const {
    data: postsData,
    isLoading: loadingPosts,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["userPosts", profile?.id],
    queryFn: ({ pageParam = 1 }) => getUserPosts(profile.id, pageParam, 10),
    getNextPageParam: (last) => {
      const p = last?.pagination;
      if (!p) return undefined;
      return p.current_page < p.last_page ? p.current_page + 1 : undefined;
    },
    initialPageParam: 1,
    enabled: !!profile?.id,
  });

  const posts = postsData?.pages?.flatMap((p) => p.data || []) || [];

  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const sentinelRef = useInfiniteScroll(
    loadMore,
    !!hasNextPage,
    isFetchingNextPage,
  );

  if (isLoading) {
    return (
      <div className="pt-20 text-center text-neutral-500">Đang tải...</div>
    );
  }

  if (error || !profile) {
    return (
      <div className="pt-20 text-center">
        <p className="text-red-400 mb-2">Không tìm thấy người dùng</p>
        <p className="text-sm text-neutral-500">@{username}</p>
        <Link to="/" className="text-sm underline mt-4 inline-block">
          Về trang chủ
        </Link>
      </div>
    );
  }

  return (
    <div className="h-screen w-full overflow-hidden flex flex-col">
      <header className="fixed top-0 left-0 w-full h-14 backdrop-blur-3xl z-10 border-b border-zinc-800/40">
        <div className="h-full px-4 max-w-150 mx-auto flex items-center gap-3">
          <Link to="/" className="text-neutral-400 hover:text-white">
            <i className="fa-solid fa-arrow-left" />
          </Link>
          <div>
            <h1 className="font-bold text-sm leading-tight">
              {profile.name || profile.username}
            </h1>
            <p className="text-xs text-neutral-500">@{profile.username}</p>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-150 mx-auto border-x border-zinc-700 mt-14 h-[calc(100vh-3.5rem)] overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {/* Header profile */}
        <div className="px-4 pt-6 pb-4 border-b border-zinc-800">
          <div className="flex items-start justify-between gap-3">
            <img
              src={
                profile.avatar_url || profile.avatar || "/default-avatar.jpg"
              }
              alt=""
              className="w-16 h-16 rounded-full object-cover"
            />
            {!isMe && token && (
              <Button
                size="sm"
                onClick={() => followMutation.mutate(!following)}
                disabled={followMutation.isPending}
                className={`rounded-xl text-xs font-bold px-4 h-8 transition-all cursor-pointer ${
                  following
                    ? `bg-transparent border border-zinc-600 ${theme === "dark" ? "text-white" : "text-black"}`
                    : `${theme === "dark" ? "bg-white text-black hover:bg-neutral-200" : "bg-black text-white hover:bg-neutral-800"}` 
                }`}
              >
                {following ? "Đang theo dõi" : "Theo dõi"}
              </Button>
            )}
            {isMe && (
              <Link to="/account">
                <Button
                  size="sm"
                  className="rounded-xl text-xs font-bold px-4 h-8 border border-zinc-600 bg-transparent"
                >
                  Sửa hồ sơ
                </Button>
              </Link>
            )}
          </div>

          <h2 className="mt-3 font-bold text-lg flex items-center gap-1">
            {profile.name || profile.username}
            {profile.verified && (
              <i className="fa-solid fa-circle-check text-sky-500 text-sm" />
            )}
          </h2>
          <p className="text-sm text-neutral-500">@{profile.username}</p>
          {profile.bio && (
            <p className="text-sm mt-2 whitespace-pre-wrap">{profile.bio}</p>
          )}
          <p className="text-sm text-neutral-500 mt-2">
            <span className=" font-semibold">
              {profile.followers_count ?? 0}
            </span>{" "}
            người theo dõi
          </p>
        </div>

        {/* Posts */}
        {loadingPosts ? (
          <p className="text-center py-10 text-sm text-neutral-500">
            Đang tải bài viết...
          </p>
        ) : posts.length === 0 ? (
          <p className="text-center py-10 text-sm text-neutral-500">
            Chưa có bài viết
          </p>
        ) : (
          <div>
            {posts.map((post) => (
              <div key={post.id} className="border-b border-zinc-800">
                <PostCard
                  post={post}
                  currentUserId={me?.id}
                  showFollow={false}
                />
              </div>
            ))}
            <div ref={sentinelRef} className="h-10" />
          </div>
        )}
      </main>
    </div>
  );
}
