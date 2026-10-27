import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { followUser, unfollowUser } from "@/api/Threads";
import { formatTimeAgo } from "@/components/formatTimeAgo";
import InteractionBar from "@/components/post/InteractionBar";
import ShareMenu from "@/components/post/ShareMenu";
import PostMenu from "@/components/post/PostMenu";
import { isFollowedCached, setFollowed } from "@/utils/followCache";

export default function PostCard({
  post,
  currentUserId,
  onComment,
  onRepost,
  onEmbed,
  showFollow = true,
}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const token = localStorage.getItem("access_token");

  const [showShare, setShowShare] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [lightbox, setLightbox] = useState(null);

  const userId = post.user?.id ?? post.user_id;

  const isMe =
    currentUserId != null &&
    userId != null &&
    String(userId) === String(currentUserId);

  const [following, setFollowing] = useState(
    !!post.user?.is_following || isFollowedCached(userId),
  );

  useEffect(() => {
    setFollowing(!!post.user?.is_following || isFollowedCached(userId));
  }, [post.id, post.user?.is_following, userId]);

  const followMutation = useMutation({
    mutationFn: async (wantFollow) => {
      if (!token) throw new Error("Chưa đăng nhập");
      if (!userId) throw new Error("Không có user id");
      return wantFollow ? followUser(userId) : unfollowUser(userId);
    },
    onMutate: async (wantFollow) => {
      const prev = following;
      setFollowing(wantFollow);
      setFollowed(userId, wantFollow);
      return { prev };
    },
    onError: (err, _wantFollow, ctx) => {
      const msg = err?.response?.data?.message || "";
      if (/already following/i.test(msg)) {
        setFollowing(true);
        setFollowed(userId, true);
        return;
      }
      if (/not following/i.test(msg)) {
        setFollowing(false);
        setFollowed(userId, false);
        return;
      }
      if (ctx) {
        setFollowing(ctx.prev);
        setFollowed(userId, ctx.prev);
      }
      console.error(
        "Follow error:",
        err?.response?.status,
        err?.response?.data,
      );
      alert(msg || "Không thể cập nhật theo dõi");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["suggestions"] });
    },
  });

  const goDetail = () => {
    const username = post.user?.username;
    if (username && post.id) navigate(`/${username}/post/${post.id}`);
  };

  const goProfile = () => {
    const username = post.user?.username;
    if (username) navigate(`/${username}`);
  };

  return (
    <>
      <div
        className="flex px-4 py-5 gap-3 relative cursor-pointer hover:bg-neutral-900/10 transition"
        onClick={() => {
          setShowMenu(false);
          setShowShare(false);
          goDetail();
        }}
      >
        <div
          className="relative shrink-0 self-start"
          onClick={(e) => e.stopPropagation()}
        >
          <img
            className="w-10 h-10 rounded-full object-cover cursor-pointer"
            src={
              post.user?.avatar_url ||
              post.user?.avatar ||
              "/default-avatar.jpg"
            }
            alt=""
            onClick={goProfile}
          />

          {showFollow && token && !isMe && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                followMutation.mutate(!following);
              }}
              disabled={followMutation.isPending || !userId}
              title={following ? "Bỏ theo dõi" : "Theo dõi"}
              className={`absolute -bottom-1 right-0 w-4 h-4 rounded-full flex items-center justify-center border-2 border-black text-[10px] font-bold leading-none disabled:opacity-50 ${
                following
                  ? "bg-zinc-600 text-white hover:bg-zinc-500"
                  : "bg-blue-500 text-white hover:bg-blue-400"
              }`}
            >
              {following ? "✓" : "+"}
            </button>
          )}
        </div>

        <div className="flex flex-col flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex gap-2 items-baseline min-w-0">
              <h4
                className="line-clamp-1 text-[15px] font-semibold cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  goProfile();
                }}
              >
                {post.user?.name || post.user?.username}
              </h4>
              {post.user?.verified && (
                <i className="fa-solid fa-circle-check text-sky-500 text-xs" />
              )}
              <span className="text-sm text-neutral-500 shrink-0">
                {formatTimeAgo(post.created_at)}
              </span>
            </div>

            <div
              className="relative shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => {
                  setShowMenu((v) => !v);
                  setShowShare(false);
                }}
                className="px-1 py-0.5 cursor-pointer rounded-full hover:bg-neutral-800 text-neutral-500"
              >
                <i className="fa-solid fa-ellipsis" />
              </button>
              {showMenu && (
                <PostMenu
                  post={post}
                  currentUserId={currentUserId}
                  onClose={() => setShowMenu(false)}
                />
              )}
            </div>
          </div>

          <p className="text-[15px] whitespace-pre-wrap break-words mt-0.5">
            {post.content}
          </p>

          {post.media_urls?.length > 0 && (
            <div
              className="flex gap-2 mt-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {post.media_urls.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  className="max-h-80 rounded-xl object-cover cursor-zoom-in"
                  alt=""
                  onClick={() => setLightbox(url)}
                />
              ))}
            </div>
          )}

          {post.is_quote && post.original_post && (
            <div className="mt-2 border border-zinc-700 rounded-xl p-3 text-sm">
              <span className="font-semibold">
                {post.original_post.user?.username}
              </span>
              <p className="text-neutral-400 line-clamp-3">
                {post.original_post.content}
              </p>
            </div>
          )}

          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <InteractionBar
              post={post}
              onComment={onComment}
              onShare={() => {
                setShowShare((v) => !v);
                setShowMenu(false);
              }}
            />
            {showShare && (
              <ShareMenu
                post={post}
                onClose={() => setShowShare(false)}
                onEmbed={onEmbed}
              />
            )}
          </div>
        </div>
      </div>

      {lightbox && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            type="button"
            className="absolute top-4 right-4 text-white text-2xl p-2 hover:opacity-80"
            onClick={() => setLightbox(null)}
          >
            <i className="fa-solid fa-xmark" />
          </button>
          <img
            src={lightbox}
            alt=""
            className="max-h-[90vh] max-w-full object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
