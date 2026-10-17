import { getUserInfo, login } from "@/api/Threads";
import { Button } from "@/components/ui/button";
import { setUser } from "@/redux/slices/authSlice";
import { useTheme } from "@/store/theme";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router";
import z from "zod";

const loginSchema = z.object({
  login: z.string().min(1, "Tài khoản hoặc email là bắt buộc"),
  password: z.string().min(1, "Vui lòng nhập mật khẩu"),
});
export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const theme = useTheme((state) => state.theme);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const verifiedSuccess = location.state?.verified;
  const stateMessage = location.state?.message;

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
  });

  const loginMutation = useMutation({
    mutationFn: (formData) => login(formData.login, formData.password),
    onSuccess: async (res) => {
      const responseData = res.data || res;
      const { access_token, refresh_token } = responseData;

      if (access_token) localStorage.setItem("access_token", access_token);
      if (refresh_token) localStorage.setItem("refresh_token", refresh_token);

      try {
        const userRes = await getUserInfo();
        const userData = userRes?.data || userRes;
        dispatch(setUser(userData));
      } catch {
        if (responseData.user) dispatch(setUser(responseData.user));
      }

      navigate("/");
    },
    onError: (error) => {
      const responseData = error.response?.data;
      if (responseData?.errors) {
        Object.keys(responseData.errors).forEach((key) => {
          setError(key, {
            type: "server",
            message: responseData.errors[key][0] || responseData.errors[key],
          });
        });
      }
    },
  });

  const onSubmit = (data) => {
    loginMutation.mutate(data);
  };
  return (
    <div className="py-4 px-3 w-full max-w-md mx-auto">
      <h1 className="block text-center mb-4 text-xl font-bold">
        Đăng nhập Threads
      </h1>

      {verifiedSuccess && (
        <div className="bg-emerald-900/50 border border-emerald-500 text-emerald-200 p-3 rounded-lg text-sm mb-4">
          Đã xác minh tài khoản thành công. Vui lòng đăng nhập.
        </div>
      )}
      {stateMessage && !verifiedSuccess && (
        <div className="bg-emerald-900/50 border border-emerald-500 text-emerald-200 p-3 rounded-lg text-sm mb-4">
          {stateMessage}
        </div>
      )}

      {loginMutation.isError && (
        <div className="bg-rose-900/50 border border-rose-500 text-rose-200 p-3 rounded-lg text-sm mb-4">
          {loginMutation.error?.response?.data?.message ||
            "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin."}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <input
            type="text"
            {...register("login")}
            placeholder="Email hoặc username..."
            className="w-full border border-neutral-600 rounded-lg px-4 py-2 focus:outline-none bg-transparent"
          />
          {errors.login && (
            <p className="text-rose-500 text-xs mt-1">
              {errors.login?.message}
            </p>
          )}
        </div>

        <div>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              {...register("password")}
              placeholder="Mật khẩu..."
              className="w-full border border-neutral-600 rounded-lg pl-4 pr-10 py-2 focus:outline-none bg-transparent"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute inset-y-0 right-3 text-neutral-500 hover:text-neutral-300 cursor-pointer select-none"
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

        <div className="text-right">
          <Link
            to="/forgot-password"
            className="text-xs text-neutral-400 hover:underline"
          >
            Quên mật khẩu?
          </Link>
        </div>

        <Button
          type="submit"
          className={`w-full ${
            theme === "dark" ? "bg-white text-black" : "bg-black text-white"
          } font-semibold py-2 rounded-lg hover:opacity-90 transition disabled:opacity-50`}
          disabled={loginMutation.isPending}
        >
          {loginMutation.isPending ? "Đang xử lý..." : "Đăng nhập"}
        </Button>
      </form>

      {/* Link Đăng ký */}
      <div className="mt-6 text-center text-sm text-neutral-400">
        Chưa có tài khoản?{" "}
        <Link to="/register" className="hover:underline font-bold ">
          Đăng ký ngay
        </Link>
      </div>
    </div>
  );
}
