import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createPost, getUserInfo } from "../api/Threads";
import { Button } from "./ui/button";
import { useForm } from "react-hook-form";
import { useTheme } from "@/store/theme";

export default function CreatePostFeed({
  isOpen,
  isClose,
  user,
  tab = "for_you",
}) {
  const queryClient = useQueryClient();
  const [mediaFiles, setMediaFiles] = useState([]);
  const [mediaPreviews, setMediaPreviews] = useState([]);
  const theme = useTheme((state) => state.theme);
  const { register, handleSubmit, reset, watch } = useForm({
    defaultValues: {
      content: "",
      topicName: "",
    },
  });

  const contentValue = watch("content");
  const token = localStorage.getItem("access_token");

  const { data: userData } = useQuery({
    queryKey: ["currentUser"],
    queryFn: getUserInfo,
    enabled: !user && !!token,
  });

  const currentUser = user || userData?.data || userData;

  const handleClose = (force = false) => {
    if (!force && createPostMutation.isPending) return;

    mediaPreviews.forEach((url) => URL.revokeObjectURL(url));

    setMediaFiles([]);
    setMediaPreviews([]);

    reset();
    isClose();
  };

  const createPostMutation = useMutation({
    mutationFn: async (data) => {
      const formData = new FormData();

      formData.append("content", data.content?.trim() || "");

      if (data.topicName?.trim()) {
        formData.append("topic_name", data.topicName.trim());
      }

      if (mediaFiles.length > 0) {
        mediaFiles.forEach((file) => {
          formData.append("media[]", file);
        });
      }

      return await createPost(formData);
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["posts", tab],
      });
      handleClose(true);
    },

    onError: (err) => {
      console.error("Đăng bài thất bại:", err);
      console.error("Response data từ Server:", err?.response?.data);
      alert(
        err?.response?.data?.message || "Đăng bài thất bại. Vui lòng thử lại!",
      );
    },
  });

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        handleClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, createPostMutation.isPending, mediaPreviews]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);

    if (!files.length) return;

    setMediaFiles((prev) => [...prev, ...files]);

    const newPreviews = files.map((file) => URL.createObjectURL(file));

    setMediaPreviews((prev) => [...prev, ...newPreviews]);

    e.target.value = "";
  };

  const handleRemoveImage = (index) => {
    URL.revokeObjectURL(mediaPreviews[index]);

    setMediaFiles((prev) => prev.filter((_, i) => i !== index));
    setMediaPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = (data) => {
    if (!data.content?.trim() && mediaFiles.length === 0) {
      return;
    }

    createPostMutation.mutate(data);
  };

  if (!isOpen) return null;

  const isSubmitDisabled =
    (!contentValue?.trim() && mediaFiles.length === 0) ||
    createPostMutation.isPending;

  return (
    <div className="fixed inset-0 z-50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="absolute inset-0" onClick={handleClose} />

      <div className={`relative ${theme==="dark"?"bg-black text-white":"bg-white text-black"} w-full max-w-xl border border-neutral-600 rounded-2xl shadow-2xl overflow-hidden z-10`}>
        <div className="px-4 py-3 border-b border-neutral-700 flex items-center justify-between">
          <button
            type="button"
            onClick={handleClose}
            disabled={createPostMutation.isPending}
            className="font-medium  text-sm hover:opacity-80 transition-opacity cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Hủy
          </button>

          <h2 className="font-bold text-base ">Thread mới</h2>

          <div className="flex items-center gap-3 ">
            <button type="button">
              <i className="fa-regular fa-file-lines text-lg"></i>
            </button>

            <button type="button">
              <i className="fa-solid fa-ellipsis text-lg"></i>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-3">
          <div className="flex gap-3">
            <div className="flex flex-col items-center">
              <img
                src={
                  currentUser?.avatar ||
                  currentUser?.avatar_url ||
                  "/default-avatar.jpg"
                }
                alt="Avatar"
                className="w-10 h-10 rounded-full object-cover border border-zinc-800"
              />

              <div className="w-0.5 flex-1 bg-zinc-800 my-2 min-h-12" />

              <div className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center">
                <i className="fa-solid fa-user text-xs text-zinc-500"></i>
              </div>
            </div>

            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-1.5 text-sm">
                <span className="font-bold ">
                  {currentUser?.username || currentUser?.name || "nguoidung"}
                </span>

                <i className="fa-solid fa-chevron-right text-xs text-zinc-500"></i>

                <input
                  type="text"
                  placeholder="Cộng đồng hoặc chủ đề"
                  {...register("topicName")}
                  disabled={createPostMutation.isPending}
                  className="bg-transparent text-slate-200 placeholder:text-zinc-400 text-sm focus:outline-none flex-1 disabled:opacity-50"
                />
              </div>

              <textarea
                rows={3}
                placeholder="Có gì mới?"
                {...register("content")}
                disabled={createPostMutation.isPending}
                className="w-full bg-transparent text-zinc-500 placeholder:text-zinc-500 text-sm focus:outline-none resize-none disabled:opacity-50"
              />

              {mediaPreviews.length > 0 && (
                <div className="flex gap-2 overflow-x-auto py-2">
                  {mediaPreviews.map((src, index) => (
                    <div key={index} className="relative group flex-shrink-0">
                      <img
                        src={src}
                        alt="Preview"
                        className="w-20 h-20 rounded-xl object-cover border border-zinc-800"
                      />

                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        disabled={createPostMutation.isPending}
                        className="absolute -top-1.5 -right-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shadow-md disabled:opacity-50"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-3 text-zinc-400 pt-1">
                <label
                  className={`cursor-pointer ${
                    createPostMutation.isPending
                      ? "opacity-50 pointer-events-none"
                      : ""
                  }`}
                >
                  <i className="fa-regular fa-image text-lg"></i>

                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={createPostMutation.isPending}
                  />
                </label>

                <button
                  type="button"
                  disabled={createPostMutation.isPending}
                  className="text-xs font-semibold px-1.5 py-0.5 rounded border border-zinc-700 disabled:opacity-50"
                >
                  GIF
                </button>

                <button
                  type="button"
                  disabled={createPostMutation.isPending}
                  className="disabled:opacity-50"
                >
                  <i className="fa-regular fa-face-smile text-lg"></i>
                </button>

                <button
                  type="button"
                  disabled={createPostMutation.isPending}
                  className="disabled:opacity-50"
                >
                  <i className="fa-regular fa-note-sticky text-lg"></i>
                </button>

                <button
                  type="button"
                  disabled={createPostMutation.isPending}
                  className="disabled:opacity-50"
                >
                  <i className="fa-solid fa-list-ul text-lg"></i>
                </button>

                <button
                  type="button"
                  disabled={createPostMutation.isPending}
                  className="disabled:opacity-50"
                >
                  <i className="fa-solid fa-align-left text-lg"></i>
                </button>

                <button
                  type="button"
                  disabled={createPostMutation.isPending}
                  className="disabled:opacity-50"
                >
                  <i className="fa-solid fa-location-dot text-lg"></i>
                </button>

                <button
                  type="button"
                  disabled={createPostMutation.isPending}
                  className="disabled:opacity-50"
                >
                  <i className="fa-solid fa-music text-lg"></i>
                </button>
              </div>

              <div className="pt-2">
                <span className="text-zinc-300 text-sm font-medium">
                  Thêm vào thread
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-between">
            <button
              type="button"
              disabled={createPostMutation.isPending}
              className="flex items-center gap-2 text-zinc-400 text-sm font-medium disabled:opacity-50"
            >
              <i className="fa-solid fa-sliders text-base"></i>
              <span>Lựa chọn về bài viết</span>
            </button>

            <Button
              type="submit"
              disabled={isSubmitDisabled}
              className={`px-5 py-1.5 rounded-xl text-sm font-bold transition-all ${
                !isSubmitDisabled
                  ? `${theme==="dark"?"bg-white text-black":"bg-black text-white"}  hover:bg-zinc-200`
                  : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
              }`}
            >
              {createPostMutation.isPending ? "Đang đăng..." : "Đăng"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
