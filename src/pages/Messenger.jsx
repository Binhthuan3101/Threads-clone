import { Link } from "react-router";

export default function Messenger() {
  return (
    <div className="w-full">
      <div className="grid grid-cols-1 px-5 py-1 md:grid-cols-[240px_1fr_3fr] items-center justify-center">
        <Link
          to="/"
          className="text-xl md:text-2xl hidden lg:block font-bold italic"
        >
          <span>
            <i className="fa-brands fa-threads"></i>
          </span>
          <span>threads</span>
        </Link>
        <div className="flex items-center justify-between p-2">
          <h3 className="pl-5 md:pl-0 text-base md:text-lg font-bold">
            Tin nhắn
          </h3>
          <button className="flex items-center justify-center text-lg font-bold">
            <i className="fa-regular fa-pen-to-square"></i>
          </button>
        </div>
        <div className="hidden md:block">View</div>
      </div>
    </div>
  );
}
