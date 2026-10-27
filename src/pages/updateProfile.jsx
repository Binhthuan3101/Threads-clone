import { getUserInfo, updateProfile } from "@/api/Threads";
import { Button } from "@/components/ui/button";
import { setUser } from "@/redux/slices/authSlice";
import { useTheme } from "@/store/theme";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router";
import { z } from "zod";

const schema = z.object({
  name: z
    .string()
    .min(1, "Tên hiển thị là bắt buộc")
    .max(50, "Tối đa 50 ký tự"),
  username: z
    .string()
    .min(1, "Username là bắt buộc")
    .max(30, "Tối đa 30 ký tự"),
  bio: z.string().max(150, "Bio tối đa 150 ký tự").optional().or(z.literal("")),
});

export default function UpdateProfile() {
  const theme = useTheme((s) => s.theme);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const token = localStorage.getItem("access_token");

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");

  const { data: userData, isLoading } = useQuery({
    queryKey: ["currentUser"],
    queryFn: getUserInfo,
    enabled: !!token,
  });
  const currentUser = userData?.data || userData;

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isDirty },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: "", username: "", bio: "" },
  });

  useEffect(() => {
    if (!currentUser) return;
    reset({
      name: currentUser.name || "",
      username: currentUser.username || "",
      bio: currentUser.bio || "",
    });
    setAvatarPreview(currentUser.avatar_url || currentUser.avatar || null);
  }, [currentUser, reset]);

  useEffect(() => {
    return () => {
      if (avatarPreview?.startsWith("blob:")) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  const mutation = useMutation({
    mutationFn: async (data) => {
      const fd = new FormData();
      fd.append("_method", "PUT");
      fd.append("name", data.name?.trim() || "");
      fd.append("username", data.username?.trim() || "");
      fd.append("bio", data.bio?.trim() || "");

      if (avatarFile) {
        fd.append("avatar", avatarFile);
      }

      return updateProfile(fd);
    },

    onSuccess: async (res) => {
      setSuccessMsg("Cập nhật hồ sơ thành công");
      setAvatarFile(null);

      try {
        const fresh = await getUserInfo();
        const u = fresh?.data || fresh;
        dispatch(setUser(u));
        queryClient.setQueryData(["currentUser"], fresh);
        queryClient.invalidateQueries({ queryKey: ["currentUser"] });
        queryClient.invalidateQueries({ queryKey: ["profile"] });

        reset({
          name: u?.name || "",
          username: u?.username || "",
          bio: u?.bio || "",
        });
        setAvatarPreview(u?.avatar_url || u?.avatar || null);
      } catch {
        const u = res?.data || res;
        if (u) dispatch(setUser(u));
      }

      setTimeout(() => setSuccessMsg(""), 2500);
    },

    onError: (err) => {
      console.error("Update profile error:", err?.response?.data || err);
      const errs = err?.response?.data?.errors;
      if (errs) {
        Object.keys(errs).forEach((key) => {
          setError(key, {
            type: "server",
            message: Array.isArray(errs[key])
              ? errs[key][0]
              : String(errs[key]),
          });
        });
      } else {
        alert(
          err?.response?.data?.message || err?.message || "Cập nhật thất bại",
        );
      }
    },
  });

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Chỉ chọn file ảnh");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("Ảnh tối đa 5MB");
      return;
    }

    if (avatarPreview?.startsWith("blob:")) {
      URL.revokeObjectURL(avatarPreview);
    }

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    e.target.value = "";
  };

  if (!token) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-neutral-500">Đăng nhập để chỉnh sửa hồ sơ</p>
        <Link to="/login" className="font-bold underline">
          Đăng nhập
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center font-bold">
        Loading...
      </div>
    );
  }

  const inputCls =
    "w-full border border-neutral-600 rounded-xl px-4 py-2.5 bg-transparent focus:outline-none focus:border-neutral-400 text-sm";

  return (
    <div
      className={`h-screen w-full overflow-hidden flex flex-col ${
        theme === "dark" ? "bg-black text-white" : "bg-white text-black"
      }`}
    >
      <header className="fixed top-0 left-0 w-full h-14 backdrop-blur-3xl z-10 border-b border-zinc-800/50">
        <div className="h-full px-5 max-w-150 mx-auto grid grid-cols-[1fr_2fr_1fr] items-center gap-4">
          <button
            type="button"
            className="p-2 ml-5 rounded-full justify-self-start hover:bg-neutral-800"
            onClick={() => navigate(-1)}
          >
            <i className="fa-solid fa-arrow-left" />
          </button>
          <h1 className="font-bold text-center text-base">
            Chỉnh sửa trang cá nhân
          </h1>
          <div />
        </div>
      </header>

      <main className="flex-1 w-full max-w-150 mx-auto mt-14 h-[calc(100vh-3.5rem)] overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <form
          onSubmit={handleSubmit((d) => mutation.mutate(d))}
          className="px-4 py-6 space-y-6 pb-24"
        >
          {successMsg && (
            <div className="bg-emerald-900/50 border border-emerald-500 text-emerald-200 p-3 rounded-xl text-sm">
              {successMsg}
            </div>
          )}

          {/* Avatar */}
          <div className="flex flex-col items-center gap-3">
            <label className="relative block w-24 h-24 cursor-pointer group">
              <img
                src={avatarPreview || "/default-avatar.jpg"}
                className="w-full h-full rounded-full object-cover border border-zinc-700 group-hover:opacity-80 transition"
                alt="avatar"
              />
              <div className="absolute bottom-0 right-0 bg-zinc-800 text-white rounded-full border border-zinc-700 w-7 h-7 flex items-center justify-center">
                <i className="fa-solid fa-camera text-xs" />
              </div>
              <input
                type="file"
                accept="image/jpeg,.jpg,.jpeg"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </label>
            <label className="text-sm text-sky-500 font-semibold cursor-pointer hover:underline">
              Đổi ảnh đại diện
              <input
                type="file"
                accept="image/jpeg,.jpg,.jpeg"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </label>
          </div>

          <div>
            <label className="block text-xs text-neutral-500 mb-1.5 font-medium">
              Tên hiển thị
            </label>
            <input
              type="text"
              {...register("name")}
              className={inputCls}
              placeholder="Tên của bạn..."
            />
            {errors.name && (
              <p className="text-rose-500 text-xs mt-1">
                {errors.name.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs text-neutral-500 mb-1.5 font-medium">
              Username
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 text-sm">
                @
              </span>
              <input
                type="text"
                {...register("username")}
                className={`${inputCls} pl-8`}
                placeholder="username"
              />
            </div>
            {errors.username && (
              <p className="text-rose-500 text-xs mt-1">
                {errors.username.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs text-neutral-500 mb-1.5 font-medium">
              Tiểu sử
            </label>
            <textarea
              rows={3}
              {...register("bio")}
              className={`${inputCls} resize-none`}
              placeholder="Viết gì đó về bạn..."
            />
            {errors.bio && (
              <p className="text-rose-500 text-xs mt-1">{errors.bio.message}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={mutation.isPending || (!isDirty && !avatarFile)}
            className={`w-full py-2.5 rounded-xl font-bold text-sm disabled:opacity-40 ${
              theme === "dark"
                ? "bg-white text-black hover:bg-neutral-200"
                : "bg-black text-white hover:bg-neutral-800"
            }`}
          >
            {mutation.isPending ? "Đang lưu..." : "Lưu"}
          </Button>
        </form>
      </main>
    </div>
  );
}
