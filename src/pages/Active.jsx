import { useState } from "react";
import { Link } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getUserInfo,
  getFollowers,
  getFollowSuggestions,
  followUser,
  unfollowUser,
} from "@/api/Threads";
import { useTheme } from "@/store/theme";
import { Button } from "@/components/ui/button";
import { formatTimeAgo } from "@/components/formatTimeAgo";

const TABS = [
  { key: "all", label: "Tất cả" },
  { key: "follows", label: "Theo dõi" },
  { key: "replies", label: "Trả lời" },
  { key: "mentions", label: "Mentions" },
];

function ActivityRow({ user, type = "follow" }) {
  const queryClient = useQueryClient();
  const [following, setFollowing] = useState(!!user.is_following);

  const mutation = useMutation({
    mutationFn: async (wantFollow) => {
      if (!user?.id) throw new Error("Không có user id");
      return wantFollow ? followUser(user.id) : unfollowUser(user.id);
    },
    onMutate: async (wantFollow) => {
      const prev = following;
      setFollowing(wantFollow);
      return { prev };
    },
    onError: (err, _wantFollow, ctx) => {
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
      console.error(err?.response?.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myFollowers"] });
      queryClient.invalidateQueries({ queryKey: ["suggestions"] });
    },
  });

  const text =
    type === "follow"
      ? "đã theo dõi bạn"
      : type === "suggest"
        ? user.bio || "Gợi ý cho bạn"
        : "đã tương tác với bạn";

  return (
    <div className="flex items-center gap-3 px-4 py-3 hover:bg-neutral-900/40 transition">
      <Link to={`/${user.username}`} className="shrink-0">
        <img
          src={user.avatar_url || user.avatar || "/default-avatar.jpg"}
          alt=""
          className="w-11 h-11 rounded-full object-cover"
        />
      </Link>

      <div className="flex-1 min-w-0">
        <p className="text-sm leading-snug">
          <Link
            to={`/${user.username}`}
            className="font-semibold hover:underline"
          >
            {user.name || user.username}
          </Link>{" "}
          <span className="text-neutral-400">{text}</span>
        </p>
        {user.created_at && type === "follow" && (
          <p className="text-xs text-neutral-500 mt-0.5">
            {formatTimeAgo(user.created_at)}
          </p>
        )}
      </div>

      <Button
        size="sm"
        onClick={() => mutation.mutate(!following)}
        disabled={mutation.isPending}
        className={`shrink-0 rounded-xl text-xs font-bold px-4 h-8 ${
          following
            ? "bg-transparent border border-zinc-600 text-white hover:bg-neutral-800"
            : "bg-white text-black hover:bg-neutral-200"
        }`}
      >
        {following ? "Đang follow" : "Theo dõi"}
      </Button>
    </div>
  );
}

export default function Active() {
  const theme = useTheme((s) => s.theme);
  const [tab, setTab] = useState("all");
  const token = localStorage.getItem("access_token");
  const isDark = theme === "dark";

  const { data: userData, isLoading: loadingMe } = useQuery({
    queryKey: ["currentUser"],
    queryFn: getUserInfo,
    enabled: !!token,
  });
  const me = userData?.data || userData;

  // Chỉ gọi /users/{id}/followers — KHÔNG dùng /users/me/followers
  const {
    data: followersData,
    isLoading: loadingFollowers,
    error: followersError,
  } = useQuery({
    queryKey: ["myFollowers", me?.id],
    queryFn: () => getFollowers(me.id, 1, 30),
    enabled: !!token && !!me?.id && (tab === "all" || tab === "follows"),
  });

  const { data: suggestionsData, isLoading: loadingSuggestions } = useQuery({
    queryKey: ["suggestions"],
    queryFn: () => getFollowSuggestions(1, 15),
    enabled: !!token && (tab === "all" || tab === "follows"),
  });

  const followers = Array.isArray(followersData?.data)
    ? followersData.data
    : Array.isArray(followersData)
      ? followersData
      : [];

  const suggestions = Array.isArray(suggestionsData?.data)
    ? suggestionsData.data
    : Array.isArray(suggestionsData)
      ? suggestionsData
      : [];

  if (!token) {
    return (
      <div
        className={`min-h-screen flex flex-col items-center justify-center gap-4 ${
          isDark ? "bg-black text-white" : "bg-white text-black"
        }`}
      >
        <p className="text-neutral-400">Đăng nhập để xem hoạt động</p>
        <Link to="/login" className="font-bold underline">
          Đăng nhập
        </Link>
      </div>
    );
  }

  return (
    <div
      className={`h-screen w-full overflow-hidden flex flex-col ${
        isDark ? "bg-black text-white" : "bg-white text-black"
      }`}
    >
      <header className="fixed top-0 left-0 w-full h-14 backdrop-blur-3xl z-10 border-b border-zinc-800/50">
        <div className="h-full px-5 max-w-150 mx-auto flex items-center">
          <h1 className="font-bold text-lg">Hoạt động</h1>
        </div>
      </header>

      <main className="flex-1 w-full max-w-150 mx-auto border-t border-x border-zinc-700 rounded-t-xl mt-14 h-[calc(100vh-3.5rem)] overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex gap-1 px-2 pt-2 border-b border-zinc-800 sticky top-0 bg-black/80 backdrop-blur z-10">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition ${
                tab === t.key
                  ? "bg-neutral-800 text-white"
                  : "text-neutral-500 hover:text-white"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="pb-24 md:pb-6">
          {(tab === "all" || tab === "follows") && (
            <>
              <section>
                <h2 className="px-4 pt-4 pb-2 text-xs font-bold text-neutral-500 uppercase tracking-wide">
                  Người theo dõi bạn
                </h2>

                {(loadingMe || loadingFollowers) && (
                  <p className="text-center py-8 text-sm text-neutral-500">
                    Đang tải...
                  </p>
                )}

                {followersError && (
                  <p className="text-center py-6 text-sm text-red-400 px-4">
                    Không tải được danh sách theo dõi.
                  </p>
                )}

                {!loadingMe &&
                  !loadingFollowers &&
                  !followersError &&
                  followers.length === 0 && (
                    <p className="text-center py-8 text-sm text-neutral-500">
                      Chưa có ai theo dõi bạn
                    </p>
                  )}

                {followers.map((u) => (
                  <ActivityRow key={u.id} user={u} type="follow" />
                ))}
              </section>

              <section>
                <h2 className="px-4 pt-4 pb-2 text-xs font-bold text-neutral-500 uppercase tracking-wide">
                  Gợi ý theo dõi
                </h2>

                {loadingSuggestions && (
                  <p className="text-center py-6 text-sm text-neutral-500">
                    Đang tải...
                  </p>
                )}

                {!loadingSuggestions &&
                  suggestions.map((u) => (
                    <ActivityRow key={u.id} user={u} type="suggest" />
                  ))}
              </section>
            </>
          )}

          {(tab === "replies" || tab === "mentions") && (
            <div className="text-center py-20 px-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-neutral-800 flex items-center justify-center">
                <i className="fa-regular fa-heart text-2xl text-neutral-500" />
              </div>
              <p className="font-semibold mb-1">Chưa có hoạt động</p>
              <p className="text-sm text-neutral-500">
                Khi có người trả lời hoặc mention bạn, sẽ hiện ở đây.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}