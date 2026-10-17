import { useParams, Link } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { request } from "@/api/axiosApi";
import { followUser, unfollowUser, getUserInfo } from "@/api/Threads";
import { useTheme } from "@/store/theme";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

async function getUserByUsername(username) {
  // Thử vài path phổ biến của API F8
  try {
    const res = await request.get(`/users/${username}`);
    return res.data;
  } catch {
    const res = await request.get(`/users/username/${username}`);
    return res.data;
  }
}

export default function Profile() {
  const { username } = useParams();
  const theme = useTheme((s) => s.theme);
  const queryClient = useQueryClient();
  const token = localStorage.getItem("access_token");

  const { data: meData } = useQuery({
    queryKey: ["currentUser"],
    queryFn: getUserInfo,
    enabled: !!token,
  });
  const me = meData?.data || meData;

  const { data, isLoading, error } = useQuery({
    queryKey: ["profile", username],
    queryFn: () => getUserByUsername(username),
    enabled: !!username,
    retry: 1,
  });

  const user = data?.data || data;
  const [following, setFollowing] = useState(false);

  useEffect(() => {
    if (user) setFollowing(!!user.is_following);
  }, [user]);

  const followMutation = useMutation({
    mutationFn: () =>
      following ? unfollowUser(user.id) : followUser(user.id),
    onMutate: () => setFollowing((v) => !v),
    onError: () => setFollowing((v) => !v),
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: ["profile", username] }),
  });

  const isMe = me?.username === username || me?.id === user?.id;

  return (
    <div
      className={`h-screen w-full overflow-hidden flex flex-col ${
        theme === "dark" ? "bg-black text-white" : "bg-white text-black"
      }`}
    >
      <header className="fixed top-0 left-0 w-full h-14 backdrop-blur-3xl z-10 border-b border-zinc-800/50">
        <div className="h-full px-5 max-w-150 mx-auto flex items-center gap-4">
          <Link to="/search" className="p-2 rounded-full hover:bg-neutral-800">
            <i className="fa-solid fa-arrow-left" />
          </Link>
          <div>
            <h1 className="font-bold text-base leading-tight">
              {user?.name || username}
            </h1>
            {user?.username && (
              <p className="text-xs text-neutral-500">@{user.username}</p>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-150 mx-auto mt-14 h-[calc(100vh-3.5rem)] overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {isLoading && (
          <div className="text-center pt-20 text-neutral-500">Loading...</div>
        )}

        {error && (
          <div className="text-center pt-20 space-y-3">
            <p className="text-red-400 text-sm">Không tải được trang cá nhân.</p>
            <p className="text-neutral-500 text-xs">
              API có thể chưa hỗ trợ xem profile theo username.
            </p>
            <Link to="/search" className="text-sm underline text-sky-500">
              Quay lại tìm kiếm
            </Link>
          </div>
        )}

        {user && !error && (
          <div className="px-4 py-6">
            <div className="flex items-start justify-between gap-4">
              <img
                src={user.avatar_url || "/default-avatar.jpg"}
                alt=""
                className="w-20 h-20 rounded-full object-cover"
              />
              {!isMe && token && (
                <Button
                  onClick={() => followMutation.mutate()}
                  disabled={followMutation.isPending}
                  className={`rounded-xl font-semibold px-5 ${
                    following
                      ? "bg-transparent border border-zinc-600"
                      : "bg-white text-black"
                  }`}
                >
                  {following ? "Đang theo dõi" : "Theo dõi"}
                </Button>
              )}
            </div>

            <div className="mt-4">
              <div className="flex items-center gap-1">
                <h2 className="text-xl font-bold">
                  {user.name || user.username}
                </h2>
                {user.verified && (
                  <i className="fa-solid fa-circle-check text-sky-500" />
                )}
              </div>
              <p className="text-neutral-500">@{user.username}</p>
              {user.bio && (
                <p className="mt-2 text-sm text-neutral-300">{user.bio}</p>
              )}
              <p className="mt-2 text-sm text-neutral-500">
                <span className="text-white font-semibold">
                  {user.followers_count ?? 0}
                </span>{" "}
                người theo dõi
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}