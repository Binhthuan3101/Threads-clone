import { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router";
import { verifyEmail } from "@/api/Threads";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/store/theme";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const theme = useTheme((state) => state.theme);

  const [status, setStatus] = useState("loading");
  const token = searchParams.get("token");
  
  const isCalledRef = useRef(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!token) {
      setStatus("expired");
      return;
    }

    if (isCalledRef.current) return;
    isCalledRef.current = true;

    verifyEmail(token)
      .then(() => {
        setStatus("success");
        timerRef.current = setTimeout(() => {
          navigate("/login", { state: { verified: true } });
        }, 1500);
      })
      .catch((err) => {
        console.error("Xác minh email thất bại:", err);
        const statusCode = err.response?.status;
        
        if (statusCode === 504 || statusCode === 502 || statusCode === 500) {
          setStatus("server_error");
        } else {
          setStatus("expired");
        }
      });

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [token, navigate]);

  const buttonClassName = `w-full ${
    theme === "dark" ? "bg-white text-black hover:bg-neutral-200" : "bg-black text-white hover:bg-neutral-800"
  } font-semibold py-2 rounded-lg transition`;

  return (
    <div className="py-8 px-4 w-full max-w-md mx-auto text-center">
      <h1 className="text-xl font-bold mb-4">Xác thực tài khoản</h1>

      {status === "loading" && (
        <div className="p-4 bg-neutral-800/50 text-neutral-300 rounded-lg border border-neutral-700 animate-pulse">
          <p className="font-medium">Đang xác minh...</p>
        </div>
      )}

      {status === "success" && (
        <div className="p-4 bg-emerald-900/50 text-emerald-200 rounded-lg border border-emerald-500">
          <p className="font-medium">Xác thực tài khoản thành công!</p>
          <p className="text-xs text-emerald-300/80 mt-1">
            Đang chuyển hướng sang trang đăng nhập...
          </p>
        </div>
      )}

      {status === "expired" && (
        <div className="p-4 bg-rose-900/50 text-rose-200 rounded-lg border border-rose-500 space-y-4">
          <p className="text-sm font-medium">
            Liên kết đã hết hạn hoặc không hợp lệ.
          </p>
          <Button onClick={() => navigate("/login")} className={buttonClassName}>
            Đi tới trang đăng nhập
          </Button>
        </div>
      )}

      {status === "server_error" && (
        <div className="p-4 bg-amber-900/50 text-amber-200 rounded-lg border border-amber-500 space-y-4">
          <p className="text-sm font-medium">
            Máy chủ F8 đang bận hoặc quá tải (504 Gateway Timeout).
          </p>
          <p className="text-xs text-amber-300/80">
            Vui lòng đợi vài phút và tải lại trang.
          </p>
          <Button onClick={() => window.location.reload()} className={buttonClassName}>
            Thử lại
          </Button>
        </div>
      )}
    </div>
  );
}
