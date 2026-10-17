import { Link } from "react-router";

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-100vh h-screen w-full text-center px-4 bg-black select-none">
      <h1 className="text-8xl md:text-9xl font-extrabold text-neutral-800 tracking-widest animate-pulse">
        404
      </h1>

      <h2 className="mt-4 text-xl md:text-2xl font-bold text-white">
        Trang này không tồn tại
      </h2>

      <p className="mt-2 text-sm md:text-base text-neutral-500 max-w-md">
        Có vẻ như liên kết đã bị hỏng hoặc trang web đã bị gỡ bỏ. Hãy quay lại
        trang chủ để tiếp tục khám phá.
      </p>

      <div className="mt-8">
        <Link
          to="/"
          className="inline-flex items-center justify-center px-6 py-3 text-sm font-semibold text-black bg-white rounded-xl hover:bg-neutral-200 active:scale-95 transition-all duration-200 shadow-lg"
        >
          <i className="fa-solid fa-house mr-2 text-xs"></i>
          Quay lại trang chủ
        </Link>
      </div>
    </div>
  );
}
