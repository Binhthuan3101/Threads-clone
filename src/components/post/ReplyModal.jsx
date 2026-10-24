import { createReply, getReplies } from "@/api/Threads";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Button } from "../ui/button";
import { formatTimeAgo } from "../formatTimeAgo";
import PostCard from "@/pages/HomePage/PostCard";

export default function ReplyModal({
  post,
  user,
  isOpen,
  onClose,
  onComment,
  onRespost,
  onShare,
}) {
  const queryClient = useQueryClient();
  const { register, handleSubmit, watch, reset } = useForm({
    defaultValues: { content: "" },
  });

  const content = watch("content");

  const { data: repliesData, isLoading: isLoadingReplies } = useQuery({
    queryKey: ["replies", post?.id],
    queryFn: () => getReplies(post.id, 1, 20),
    enabled: !!post?.id && isOpen,
  });

  const replies = repliesData?.data || repliesData || [];

  const mutation = useMutation({
    mutationFn: (data) =>
      createReply(post.id, { content: data.content.trim() }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["replies", post.id] });
      queryClient.invalidateQueries({ queryKey: ["singlePost", post.id] });
      reset();
    },
    onError: (err) => {
      alert(err?.response?.data?.message || "Gửi trả lời thất bại");
    },
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-xs"
        onClick={onClose}
      ></div>
      <div className="relative w-full bg-neutral-900 max-w-lg max-h-[90vh] border border-zinc-600 rounded-2xl z-10 flex flex-col shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-700">
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-neutral-500"
          >
            Hủy
          </button>
          <h2 className="font-bold text-sm">Trả lời</h2>
          <div className="w-10"></div>
        </div>

        <div className="flex-1 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex-1 min-w-0 ">
            <div className="p-3">
              <PostCard post={post} currentUserId={user.id} />
            </div>
          </div>
  
          <div className="border-y  py-3">
            <div className="flex px-4 items-center justify-between ">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold">
                  <i className="fa-solid fa-up-down"></i>
                </span>
                <span className="text-sm  font-bold">Hàng đầu </span>
                <span className="text-neutral-700 text-xs">
                  <i className="fa-solid fa-angle-down"></i>
                </span>
              </div>
  
              <div className="text-neutral-600 text-sm flex items-center gap-2">
                <span>Xem hoạt động</span>
                <span>
                  <i className="fa-solid fa-angle-right"></i>
                </span>
              </div>
            </div>
  
            <div className="px-3 py-2">
              <form
                onSubmit={handleSubmit((d) => mutation.mutate(d))}
                className="p-2 flex gap-3 border rounded-full items-center"
              >
                <img
                  src={user?.avatar_url || "/default-avatar.jpg"}
                  alt="avatar"
                  className="w-7 h-7 object-cover rounded-full"
                />
                <div className="flex-1 flex items-center gap-3">
                  <textarea
                    placeholder={`Reply to ${post.user?.username || "user"}...`}
                    {...register("content")}
                    rows={1}
                    className="flex-1 text-sm placeholder:text-zinc-500 focus:outline-none resize-none bg-transparent pt-0.5 leading-relaxed [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                  />
  
                  <div className="flex items-center gap-3 text-zinc-500 text-lg shrink-0">
                    <i className="fa-regular fa-image cursor-pointer hover:text-white transition" />
                    <i className="fa-regular fa-face-smile cursor-pointer hover:text-white transition" />
                    <i className="fa-solid fa-location-dot cursor-pointer hover:text-white transition" />
                    <Button
                      type="submit"
                      disabled={!content?.trim() || mutation.isPending}
                      className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold transition ${
                        content?.trim()
                          ? "bg-white text-black hover:opacity-90"
                          : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                      }`}
                    >
                      <i className="fa-solid fa-arrow-up"></i>
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </div>
          {replies.length === 0 && (
            <div className="flex min-h-[40vh] items-center justify-center">
              Không có trả lời nào
            </div>
          )}
  
          <div className="h-64 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {replies.map((rep) => (
              <div key={rep.id} className="px-4 py-2 border-b border-neutral-800">
                <PostCard post={rep} onComment={onComment} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
