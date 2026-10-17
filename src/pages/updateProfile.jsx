import { getUserInfo, updateProfile, uploadAvatar } from "@/api/Threads";
import { Button } from "@/components/ui/button";
import { setUser } from "@/redux/slices/authSlice";
import { useTheme } from "@/store/theme";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router";
import z from "zod";

const schema = z.object({
  name: z
    .string()
    .min(1, "Tên hiện thị là bắt buộc")
    .max(50, "Tối đa 50 ký tự"),
  username: z
    .string()
    .min(1, "Username là bắt buộc")
    .max(30, "Tối đa 30 ký tự"),
  bio: z.string().max(150, "Bio tối đa 150 ký tự"),
});

export default function UpdateProfile() {
  const theme = useTheme((state) => state.theme);
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
    defaultValues: {
      name: "",
      username: "",
      bio: "",
    },
  });

  useEffect(() => {
    if (currentUser) {
      reset({
        name: currentUser.name || "",
        username: currentUser.username || "",
        bio: currentUser.bio || "",
      });
      setAvatarPreview(currentUser.avatar_url || null);
    }
  }, [currentUser, reset]);

  const mutation = useMutation({
    mutationFn: async (formData) => {
      let avatarUrl = null;

      if (avatarFile) {
        const upLoadRes = await uploadAvatar(avatarFile);
        avatarUrl =
          upLoadRes?.avatar_url || upLoadRes?.data?.avatar_url || null;
      }
      const payload = {
        name: formData.name.trim(),
        username: formData.username.trim(),
        bio: formData.bio.trim() || "",
      };

      if (avatarUrl) {
        payload.avatar_url = avatarUrl;
      }
      return updateProfile(payload);
    },
    onSuccess: async (res) => {
      setSuccessMsg("Cập nhật hồ sơ thành công");
      setAvatarFile(null);

      try {
        const fresh = await getUserInfo();
        const u = fresh?.data || fresh;
        dispatch(setUser(u));
        queryClient.setQueryData(["currentData"], fresh);
        reset({
          name: u.name || "",
          username: u.username || "",
          bio: u.bio || "",
        });
      } catch {
        const u = res?.data || res;
        if (u) dispatch(setUser(u));
      }

      setTimeout(() => setSuccessMsg(""), 2500);
    },
    onError: (err) => {
      const errs = err?.response?.data?.errors;
      if (errs) {
        Object.keys(errs).forEach((key) => {
          setError(key, {
            type: "server",
            message: Array.isArray(errs[key]) ? errs[key][0] : errs[key],
          });
        });
      } else {
        alert(err?.response?.data?.message || "Cập nhật thất bại");
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
      alert("Ảnh tối thiểu 5MB");
      return;
    }

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const onSubmit = (data) => {
    mutation.mutate(data);
  };

  if (!token) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-neutral-600">Đăng nhập để chỉnh sửa hồ sơ</p>
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
      className={`h-screen w-full overflow-hidden flex flex-col ${theme === "dark" ? "bg-black text-white" : "bg-white text-black"}`}
    >
      <header className="fixed top-0 left-0 w-full h-14 backdrop-blur-3xl z-10 border-b border-zinc-800/50">
        <div className="h-full px-5 max-w-150 mx-auto grid grid-cols-[1fr_2fr_1fr] items-center gap-4">
          <button
            type="button"
            className="p-2 rounded-full justify-self-start hover:bg-neutral-800"
            onClick={() => navigate(-1)}
          >
            <i class="fa-solid fa-arrow-left"></i>
          </button>
          <h1 className="font-bold text-center text-base">Chỉnh sửa trang cá nhân</h1>
        </div>
      </header>

      <main className="flex-1 w-full max-w-150 mx-auto mt-14 h-[calc(100vh-3.5rem)] overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="px-4 py-6 space-y-6 pb-24"
        >
          {successMsg && (
            <div className="bg-emerald-900/50 border border-emerald-500 text-emerald-200 p-3 rounded-xl text-sm">
              {successMsg}
            </div>
          )}

          <div className="flex flex-col items-center gap-3">
            <div>
              <label className="relative block w-24 h-24 cursor-pointer group">
                <img
                  src={avatarPreview || "/default-avatar.jpg"}
                  className="w-full h-full rounded-full object-cover border border-zinc-700 transition group-hover:opacity-80"
                  alt="avatar"
                />
                <div className="absolute bottom-0 right-0 bg-zinc-800 text-white p-1.5 rounded-full border border-zinc-700 shadow-sm flex items-center justify-center w-7 h-7">
                  <i className="fa-solid fa-camera text-xs" />
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </label>
            </div>
            <label className="text-sm text-sky-500 font-semibold cursor-pointer hover:underline">
              Đổi ảnh đại diện
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </label>
          </div>

          <div>
            <label className="block text-xs text-neutral-500 mb-1.5 font-medium">
              Tên hiện thị
            </label>
            <input
              type="text"
              {...register("name")}
              placeholder="Tên của bạn..."
              className={inputCls}
            />
            {errors && (
              <p className="text-rose-500 text-xs mt-1">
                {errors.name?.message}
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
                placeholder="username"
                className={`${inputCls} pl-8`}
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
            className={`w-full py-2.5 rounded-xl font-bold text-sm ${
              theme==="dark"
                ? "bg-white text-black hover:bg-neutral-200"
                : "bg-black text-white hover:bg-neutral-800"
            } disabled:opacity-40`}
          >
            {mutation.isPending ? "Đang lưu..." : "Lưu"}
          </Button>
        </form>
      </main>
    </div>
  );
}
