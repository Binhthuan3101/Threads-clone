import { forgotPassword } from "@/api/Threads";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/store/theme";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Link } from "react-router";
import z from "zod";

const ForgotPasswordSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
});

export default function ForgotPassword() {
  const theme = useTheme((state) => state.theme);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(ForgotPasswordSchema),
    mode: "onChange",
  });

  const forgotMutation = useMutation({
    mutationFn: (data) => forgotPassword(data.email),
    onError: (error) => {
      const responseData = error.response?.data;
      if (responseData) {
        setError("email", {
          type: "server",
          message: responseData.errors.email[0],
        });
      }
    },
  });

  const onSubmit = (data) => {
    forgotMutation.mutate(data);
  };
  return (
    <div className="w-full py-4 px-3">
      <h1 className="block text-center text-xl font-bold mb-4">
        Quên mật khẩu
      </h1>
      <p className="text-center text-sm text-neutral-400 mb-6">
        Nhập địa chỉ email của bạn để nhận liên kết đặt lại mật khẩu.
      </p>

      {forgotMutation.isSuccess && (
        <div className="bg-emerald-900/50 border border-emerald-500 text-emerald-200 p-3 rounded-lg text-sm mb-4">
          Liên kết đặt lại mật khẩu đã được gửi tới email của bạn.
        </div>
      )}

      {forgotMutation.isError && (
        <div className="bg-rose-900/50 border border-rose-500 text-rose-200 p-3 rounded-lg text-sm mb-4">
          {forgotMutation.error?.response?.data?.message ||
            "Có lỗi xảy ra. Vui lòng thử lại sau."}
        </div>
      )}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <input
            type="email"
            {...register("email")}
            placeholder="Nhập email của bạn..."
            className="w-full border border-neutral-600 rounded-lg px-4 py-2 focus:outline-none bg-transparent"
          />
          {errors.email && (
            <p className="text-rose-500 text-xs mt-1">
              {errors.email?.message}
            </p>
          )}
        </div>
        <Button
          disabled={forgotMutation.isPending}
          type="submit"
          className={`w-full ${theme === "dark" ? "bg-white text-black" : "bg-black text-white"}`}
        >
          {forgotMutation.isPending ? "Đang gửi..." : "Gửi liên kết đặt lại"}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm text-neutral-400">
        Quay lại{" "}
        <Link to="/login" className="hover:underline font-bold">
          Đăng nhập
        </Link>
      </div>
    </div>
  );
}
