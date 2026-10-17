import { useState } from "react";
import { formatTimeAgo } from "@/components/formatTimeAgo";
import InteractionBar from "@/components/post/InteractionBar";
import ShareMenu from "@/components/post/ShareMenu";
import PostMenu from "@/components/post/PostMenu";

export default function PostCard({
  post,
  currentUserId,
  onComment,
  onRepost,
  onEmbed,
}) {
  const [showShare, setShowShare] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div
      className="flex px-4 py-5  gap-3 relative"
      onClick={() => {
        setShowMenu(false);
        setShowShare(false);
      }}
    >
      <img
        className="w-10 h-10 rounded-full object-cover shrink-0"
        src={post.user?.avatar_url || "/default-avatar.jpg"}
        alt=""
      />

      <div className="flex flex-col flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex gap-2 items-baseline min-w-0">
            <h4 className="line-clamp-1 text-[15px] font-semibold">
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
          <div className="flex gap-2 mt-2 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {post.media_urls.map((url, i) => (
              <img
                key={i}
                src={url}
                className="max-h-80 rounded-xl object-cover"
                alt=""
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
            onRepost={onRepost}
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
  );
}
