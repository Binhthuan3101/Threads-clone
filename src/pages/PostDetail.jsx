import { useParams, Link } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { getSinglePost, getUserInfo } from "@/api/Threads";
import { useTheme } from "@/store/theme";
import PostCard from "@/pages/HomePage/PostCard";
import { useState } from "react";
import ReplyModal from "@/components/post/ReplyModal";
import EmbedModal from "@/components/post/EmbedModal";

export default function PostDetail() {
  const { username, postId } = useParams();
  const theme = useTheme((s) => s.theme);
  const token = localStorage.getItem("access_token");
  const [replyPost, setReplyPost] = useState(null);
  const [embedPost, setEmbedPost] = useState(null);

  const { data: userData } = useQuery({
    queryKey: ["currentUser"],
    queryFn: getUserInfo,
    enabled: !!token,
  });
  const currentUser = userData?.data || userData;

  const { data, isLoading, error } = useQuery({
    queryKey: ["post", postId],
    queryFn: () => getSinglePost(postId),
    enabled: !!postId,
  });

  const post = data?.data || data;

  return (
    <div
      className={`h-screen w-full overflow-hidden flex flex-col ${
        theme === "dark" ? "bg-black text-white" : "bg-white text-black"
      }`}
    >
      <header className="fixed top-0 left-0 w-full h-14 backdrop-blur-3xl z-10 border-b border-zinc-800/50">
        <div className="h-full px-5 max-w-150 mx-auto flex items-center gap-4">
          <Link to="/" className="p-2 rounded-full hover:bg-neutral-500 px-2 py-1.5">
            <i className="fa-solid fa-arrow-left" />
          </Link>
          <h1 className="font-bold text-base">Thread</h1>
        </div>
      </header>

      <main className="flex-1 w-full max-w-150 mx-auto border-t border-x border-zinc-700 rounded-t-xl mt-14 h-[calc(100vh-3.5rem)] overflow-y-auto">
        {isLoading && (
          <div className="text-center pt-20 font-bold">Loading...</div>
        )}

        {error && (
          <div className="text-center pt-20 space-y-2">
            <p className="text-red-400 text-sm">Không tìm thấy bài viết.</p>
            <Link to="/" className="text-sky-500 text-sm underline">
              Về trang chủ
            </Link>
          </div>
        )}

        {post && !error && (
          <PostCard
            post={post}
            currentUserId={currentUser?.id}
            onComment={() => setReplyPost(post)}
            onEmbed={(p) => setEmbedPost(p)}
          />
        )}
      </main>

      {replyPost && (
        <ReplyModal
          post={replyPost}
          user={currentUser}
          isOpen={!!replyPost}
          onClose={() => setReplyPost(null)}
        />
      )}
      {embedPost && (
        <EmbedModal post={embedPost} onClose={() => setEmbedPost(null)} />
      )}
    </div>
  );
}