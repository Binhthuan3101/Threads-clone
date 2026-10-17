import { resetPassword, validateResetToken } from "@/api/Threads";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/store/theme";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useSearchParams } from "react-router";
import z from "zod";

const ResetPasswordSchema = z
  .object({
    password: z.string().min(8, "Mật khẩu tối thiểu 8 ký tự"),
    password_confirmation: z.string().min(1, "Vui lòng xác nhận mật khẩu"),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Mật khẩu xác nhận không trùng khớp",
    path: ["password_confirmation"],
  });

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const theme = useTheme((s) => s.theme);
  const token = searchParams.get("token") || "";

  const {
    data: tokenData,
    isLoading: checkingToken,
    isError: tokenInvalid,
  } = useQuery({
    queryKey: ["validateResetToken", token],
    queryFn: () => validateResetToken(token),
    enabled: !!token,
    retry: false,
  });

  const isTokenValid = tokenData?.data?.valid === true;

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(ResetPasswordSchema),
    mode: "onChange",
  });

  const resetMutation = useMutation({
    mutationFn: (formData) =>
      resetPassword({
        token,
        password: formData.password,
        password_confirmation: formData.password_confirmation,
      }),
    onSuccess: () => {
      navigate("/login", {
        state: {
          message: "Tạo mật khẩu mới thành công, vui lòng đăng nhập",
        },
      });
    },
    onError: (error) => {
      const responseData = error.response?.data;
      if (responseData?.errors) {
        Object.keys(responseData.errors).forEach((key) => {
          setError(key, {
            type: "server",
            message: responseData.errors[key][0],
          });
        });
      }
    },
  });

  if (!token || tokenInvalid || (tokenData && !isTokenValid)) {
    return (
      <div className="py-8 px-4 w-full text-center">
        <h1 className="text-xl font-bold mb-4">Đặt lại mật khẩu</h1>
        <div className="p-4 bg-rose-900/50 text-rose-200 rounded-lg border border-rose-500 space-y-4">
          <p className="text-sm">Liên kết đã hết hạn hoặc không hợp lệ.</p>
          <Button
            onClick={() => navigate("/login")}
            className={`w-full ${theme === "dark" ? "bg-white text-black" : "bg-black text-white"}`}
          >
            Đi tới trang đăng nhập
          </Button>
        </div>
      </div>
    );
  }

  if (checkingToken) {
    return (
      <div className="py-8 text-center animate-pulse">Đang kiểm tra liên kết...</div>
    );
  }

  return (
    <div className="py-4 px-3 w-full">
      <h1 className="block text-center mb-2 text-xl font-bold">Tạo mật khẩu mới</h1>
      <p className="text-center text-sm text-neutral-400 mb-6">
        Nhập mật khẩu mới của bạn bên dưới.
      </p>

      {resetMutation.isError && (
        <div className="bg-rose-900/50 border border-rose-500 text-rose-200 p-3 rounded-lg text-sm mb-4">
          {resetMutation.error?.response?.data?.message ||
            "Có lỗi xảy ra hoặc liên kết đã hết hạn."}
        </div>
      )}

      <form onSubmit={handleSubmit((d) => resetMutation.mutate(d))} className="space-y-4">
        <div>
          <input
            type="password"
            {...register("password")}
            placeholder="Mật khẩu mới..."
            className="w-full border border-neutral-600 rounded-lg px-4 py-2 focus:outline-none bg-transparent"
          />
          {errors.password && (
            <p className="text-rose-500 text-xs mt-1">{errors.password.message}</p>
          )}
        </div>
        <div>
          <input
            type="password"
            {...register("password_confirmation")}
            placeholder="Xác nhận mật khẩu..."
            className="w-full border border-neutral-600 rounded-lg px-4 py-2 focus:outline-none bg-transparent"
          />
          {errors.password_confirmation && (
            <p className="text-rose-500 text-xs mt-1">
              {errors.password_confirmation.message}
            </p>
          )}
        </div>
        <Button
          disabled={resetMutation.isPending}
          type="submit"
          className={`w-full ${theme === "dark" ? "bg-white text-black" : "bg-black text-white"}`}
        >
          {resetMutation.isPending ? "Đang xử lý..." : "Đặt lại mật khẩu"}
        </Button>
      </form>
      <div className="mt-6 text-center text-sm text-neutral-400">
        Quay lại{" "}
        <Link className="hover:underline font-bold" to="/login">
          Đăng nhập
        </Link>
      </div>
    </div>
  );
}