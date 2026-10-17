import { likePost } from "@/api/Threads";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

export default function InteractionBar({ post, onComment, onRepost, onShare }) {
  const queryClient = useQueryClient();
  const [liked, setLiked] = useState(!!post.is_liked);
  const [likesCount, setLikesCount] = useState(post.likes_count || 0);

  const likeMutation = useMutation({
    mutationFn: () => likePost(post.id),
    onMutate: async () => {
      const prev = { liked, likesCount };
      setLiked((v) => !v);
      setLikesCount((c) => (liked ? Math.max(0, c - 1) : c + 1));
      return prev;
    },
    onError: (_err, _vars, context) => {
      if (context) {
        setLiked(context.liked);
        setLikesCount(context.likesCount);
      }
      alert("Không thể cập nhật like. Vui lòng thử lại.");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
  const iconCls = "h-5 w-5 transition-colors";

  return (
    <div className="flex gap-5 items-center mt-3">
      <button
        type="button"
        onClick={() => likeMutation.mutate()}
        className="flex gap-1.5 items-center group"
        disabled={likeMutation.isPending}
      >
        <svg
          viewBox="0 0 24 24"
          className={`h-5 w-5 transition-colors ${
            liked
              ? "text-red-500 fill-red-500"
              : "text-neutral-500 group-hover:text-red-400"
          }`}
          fill={liked ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
        <span className="text-sm text-neutral-500">{likesCount || "0"}</span>
      </button>

      <button
        type="button"
        onClick={onComment}
        className="flex gap-1.5 items-center group"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="1em"
          height="1em"
          aria-label="Reply"
          className="stroke-[2px] transition-colors h-4.5 w-4.5 text-threads-icon-action group-hover:text-threads-icon-action"
          viewBox="0 0 24 24"
          fill="currentColor"
          style={{
            "--x-fill": "currentColor",
            "--x-height": "18",
            "--x-width": "18",
          }}
        >
          <path
            fill="currentColor"
            fillRule="evenodd"
            d="M12 3a9 9 0 0 0 0 18c1.414 0 2.75-.325 3.937-.904a1 1 0 0 1 .614-.086l4.206.752-.764-4.17a1 1 0 0 1 .086-.621C20.67 14.774 21 13.427 21 12a9 9 0 0 0-9-9M1 12C1 5.925 5.925 1 12 1s11 4.925 11 11c0 1.62-.351 3.162-.982 4.549l.966 5.27a1 1 0 0 1-1.16 1.165l-5.312-.95C15.134 22.656 13.606 23 12 23 5.925 23 1 18.075 1 12"
            clipRule="evenodd"
          ></path>
        </svg>
        <span className="text-sm text-neutral-500">
          {post.replies_count || "0"}
        </span>
      </button>

      <button
        type="button"
        onClick={onRepost}
        className="flex gap-1.5 items-center group"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="1em"
          height="1em"
          aria-label="Repost"
          className="stroke-[2px] transition-colors h-4.5 w-4.5 text-threads-icon-action group-hover:text-threads-icon-action"
          viewBox="0 0 24 24"
          fill="currentColor"
          style={{
            "--x-fill": "currentColor",
            "--x-height": "18",
            "--x-width": "18",
          }}
        >
          <path
            fill="currentColor"
            d="M4.516 6.999a8.99 8.99 0 0 1 7.483-4 9 9 0 0 1 8.294 5.498 1 1 0 0 0 1.842-.78A11 11 0 0 0 11.999 1C8.279 1 4.99 2.848 3 5.674V3a1 1 0 1 0-2 0v5a1 1 0 0 0 1 1h5a1 1 0 0 0 0-2zM2.396 14.971a1 1 0 0 1 1.31.532A9 9 0 0 0 12 21 8.99 8.99 0 0 0 19.483 17h-2.484a1 1 0 1 1 0-2h5a1 1 0 0 1 1 1v5a1 1 0 1 1-2 0v-2.675A10.99 10.99 0 0 1 12 23a11 11 0 0 1-10.135-6.718 1 1 0 0 1 .532-1.31"
          ></path>
        </svg>
        <span className="text-sm text-neutral-500">
          {post.reposts_and_quotes_count || "0"}
        </span>
      </button>

      <button
        type="button"
        onClick={onShare}
        className="flex gap-1.5 items-center group"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="1em"
          height="1em"
          aria-label="Share"
          className="stroke-[2px] transition-colors h-4.5 w-4.5 text-threads-icon-action group-hover:text-threads-icon-action"
          viewBox="0 0 24 24"
          fill="currentColor"
          style={{
            "--x-fill": "currentColor",
            "--x-height": "18",
            "--x-width": "18",
          }}
        >
          <path
            fill="currentColor"
            fillRule="evenodd"
            d="M7.247 1.499C4.183-.187.6 2.643 1.53 6.014L3.182 12 1.53 17.986c-.93 3.37 2.653 6.201 5.717 4.515l13.578-7.468c2.39-1.315 2.39-4.75 0-6.066zM3.458 5.482c-.46-1.666 1.311-3.064 2.825-2.231L19.86 10.72q.213.117.365.28H4.98zM4.981 13l-1.523 5.518c-.46 1.665 1.311 3.064 2.825 2.231l13.577-7.468q.213-.118.365-.281z"
            clipRule="evenodd"
          ></path>
        </svg>
      </button>
    </div>
  );
}
