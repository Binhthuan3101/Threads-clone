import { useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { getSinglePost } from "@/api/Threads";
import PostCard from "@/pages/HomePage/PostCard";

export default function Embed() {
  const { postId } = useParams();

  const { data, isLoading, error } = useQuery({
    queryKey: ["embedPost", postId],
    queryFn: () => getSinglePost(postId),
    enabled: !!postId,
  });

  const post = data?.data || data;

  if (isLoading) {
    return (
      <div className="p-8 text-center text-sm text-neutral-500">Loading...</div>
    );
  }

  if (error || !post) {
    return (
      <div className="p-8 text-center text-sm text-red-500">
        Không tải được bài viết.
      </div>
    );
  }

  return (
    <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
      <PostCard post={post} />
      <div className="px-4 py-3 border-t border-zinc-100">
        <a
          href={`/${post.user?.username}/post/${post.id}`}
          target="_blank"
          rel="noreferrer"
          className="text-sm text-sky-600 hover:underline"
        >
          View on Threads
        </a>
      </div>
    </div>
  );
}