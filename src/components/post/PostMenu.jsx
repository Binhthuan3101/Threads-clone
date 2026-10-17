import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { savePost, hidePost, deletePost } from "@/api/Threads";
import copy from "copy-to-clipboard";

export default function PostMenu({ post, currentUserId, onClose }) {
  const queryClient = useQueryClient();
  const [saved, setSaved] = useState(!!post.is_saved);
  const isOwner = currentUserId && post.user_id === currentUserId;

  const saveMutation = useMutation({
    mutationFn: () => savePost(post.id),
    onMutate: () => setSaved((v) => !v),
    onError: () => {
      setSaved((v) => !v);
      alert("Không thể lưu bài viết");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["savedPosts"] });
      onClose?.();
    },
  });

  const hideMutation = useMutation({
    mutationFn: () => hidePost(post.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      onClose?.();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deletePost(post.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      onClose?.();
    },
  });

  const url = `${window.location.origin}/${post.user?.username}/post/${post.id}`;
  const itemCls =
    "w-full text-left px-3 py-2.5 text-sm rounded-lg hover:bg-neutral-800 transition";

  return (
    <div
      className="absolute top-8 right-0 z-50 w-56 rounded-xl bg-neutral-900 border border-zinc-700 shadow-xl p-1"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        className={itemCls}
        onClick={() => saveMutation.mutate()}
        disabled={saveMutation.isPending}
      >
        {saved ? "Bỏ lưu" : "Lưu"}
      </button>

      <button
        type="button"
        className={itemCls}
        onClick={() => {
          copy(url);
          onClose?.();
        }}
      >
        Sao chép liên kết
      </button>

      <button type="button" className={itemCls} onClick={() => hideMutation.mutate()}>
        Không quan tâm
      </button>

      {isOwner && (
        <button
          type="button"
          className={`${itemCls} text-red-500`}
          onClick={() => {
            if (window.confirm("Xóa bài viết này?")) deleteMutation.mutate();
          }}
        >
          Xóa
        </button>
      )}
    </div>
  );
}