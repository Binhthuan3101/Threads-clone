import { useForm } from "react-hook-form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDebounce } from "@/hooks/useDebounce";
import { useEffect, useState } from "react";
import {
  registerAccount,
  validateEmail,
  validateUsername,
} from "@/api/Threads";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/store/theme";
import { Link } from "react-router";

const registerSchema = z
  .object({
    name: z.string().min(1, "Tên hiển thị là bắt buộc"),
    username: z.string().min(1, "Username là bắt buộc"),
    email: z.string().email("Email không hợp lệ"),
    password: z.string().min(8, "Mật khẩu tối thiểu 8 ký tự"),
    password_confirmation: z.string(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Mật khẩu xác nhận không trùng khớp",
    path: ["password_confirmation"],
  });

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const theme = useTheme((state) => state.theme);
  const {
    register,
    handleSubmit,
    watch,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const registerMutation = useMutation({
    mutationFn: (data) => registerAccount(data),
    onError: (error) => {
      const serverErrors = error?.response?.data?.errors;
      if (serverErrors) {
        Object.keys(serverErrors).forEach((key) => {
          setError(key, { type: "server", message: serverErrors[key][0] });
        });
      }
    },
  });

  const usernameVal = watch("username");
  const emailVal = watch("email");
  const debouncedUsername = useDebounce(usernameVal, 700);
  const debouncedEmail = useDebounce(emailVal, 700);

  useEffect(() => {
    if (debouncedUsername) {
      validateUsername(debouncedUsername)
        .then(() => clearErrors("username"))
        .catch((err) => {
          setError("username", {
            type: "manual",
            message: err.response?.data?.message || "Username đã tồn tại",
          });
        });
    }
  }, [debouncedUsername, setError, clearErrors]);

  useEffect(() => {
    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(debouncedEmail);
    if (debouncedEmail && isEmailValid) {
      validateEmail(debouncedEmail)
        .then(() => clearErrors("email"))
        .catch((err) => {
          setError("email", {
            type: "manual",
            message: err.response?.data?.message || "Email đã được sử dụng",
          });
        });
    }
  }, [debouncedEmail, setError, clearErrors]);

  const onSubmit = async (data) => {
    const payload = {
      ...data,
    };
    registerMutation.mutate(payload);
  };

  return (
    <div className="py-4 px-3 w-full">
      <h1 className="block text-center mb-4 text-xl font-bold">
        Đăng ký Threads
      </h1>

      {registerMutation.isSuccess && (
        <div className="bg-emerald-900/50 border border-emerald-500 text-emerald-200 p-3 rounded-lg text-sm mb-4">
          Chúng tôi đã gửi một liên kết xác thực tới email của bạn. Vui lòng
          kiểm tra email để xác thực tài khoản.
        </div>
      )}

      {registerMutation.isError && (
        <div className="bg-rose-900/50 border border-rose-500 text-rose-200 p-3 rounded-lg text-sm mb-4">
          {registerMutation.error?.response?.data?.message ||
            "Đăng ký thất bại. Vui lòng thử lại."}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <input
            type="text"
            {...register("name")}
            placeholder="Tên hiển thị..."
            className="w-full border border-neutral-700 rounded-lg px-4 py-2 focus:outline-none bg-transparent"
          />
          {errors.name && (
            <p className="text-rose-500 text-xs mt-1">{errors.name?.message}</p>
          )}
        </div>
        <div>
          <input
            type="text"
            {...register("username")}
            placeholder="Username..."
            className="w-full border border-neutral-700 rounded-lg px-4 py-2 focus:outline-none"
          />
          {errors.username && (
            <p className="text-rose-500 text-xs mt-1">
              {errors.username?.message}
            </p>
          )}
        </div>

        <div>
          <input
            type="email"
            {...register("email")}
            placeholder="Email..."
            className="w-full border border-neutral-600 rounded-lg px-4 py-2 focus:outline-none"
          />
          {errors.email && (
            <p className="text-rose-500 text-xs mt-1">
              {errors.email?.message}
            </p>
          )}
        </div>

        <div>
          <div className="relative w-full flex items-center">
            <input
              type={showPassword ? "text" : "password"}
              {...register("password")}
              placeholder="Password..."
              className="w-full border border-neutral-600 rounded-lg pl-4 pr-10 py-2 bg-transparent focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 text-neutral-500 hover:text-neutral-300 cursor-pointer select-none"
            >
              {showPassword ? (
                <i className="fa-solid fa-eye-slash text-sm"></i>
              ) : (
                <i className="fa-solid fa-eye text-sm"></i>
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-rose-500 text-xs mt-1">
              {errors.password?.message}
            </p>
          )}
        </div>

        <div>
          <div className="relative w-full flex items-center">
            <input
              type={showPasswordConfirm ? "text" : "password"}
              {...register("password_confirmation")}
              placeholder="Password confirm..."
              className="w-full border border-neutral-600 rounded-lg pl-4 pr-10 py-2 bg-transparent focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPasswordConfirm((prev) => !prev)}
              className="absolute right-3 text-neutral-500 hover:text-neutral-300 cursor-pointer select-none"
            >
              {showPassword ? (
                <i className="fa-solid fa-eye-slash text-sm"></i>
              ) : (
                <i className="fa-solid fa-eye text-sm"></i>
              )}
            </button>
          </div>
          {errors.password_confirmation && (
            <p className="text-rose-500 text-xs mt-1">
              {errors.password_confirmation?.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          className={`w-full ${theme === "dark" ? "bg-white text-black" : "bg-black text-white"} font-semibold py-2 rounded-lg hover:opacity-90 transition disabled:opacity-50`}
          disabled={registerMutation.isPending}
        >
          {registerMutation.isPending ? "Đang xử lý..." : "Đăng ký"}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm text-neutral-400">
        Đã có tài khoản?{" "}
        <Link to="/login" className="hover:underline font-bold">
          Đăng nhập
        </Link>
      </div>
    </div>
  );
}
