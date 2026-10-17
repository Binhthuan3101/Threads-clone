import { useState } from "react";

export default function CreateFeed({ isOpen, isClose }) {
  const [feedName, setFeedName] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = () => {
    console.log("Dữ liệu gửi đi:", {
      name: feedName,
      description: description,
      isPublic: isPublic,
    });
    isClose();
  };

  return (
    <div
      onClick={isClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg mx-4 rounded-xl border border-zinc-800 bg-[#1c1c1c] text-white shadow-2xl overflow-hidden"
      >
        <div className="grid grid-cols-3 items-center border-b border-zinc-800 px-4 py-3">
          <button
            onClick={isClose}
            className="text-left text-neutral-400 hover:text-white transition-colors text-sm"
          >
            Hủy
          </button>
          <h2 className="font-bold text-center text-base whitespace-nowrap">
            Tạo bảng feed
          </h2>
          <div className="text-right"></div>
        </div>

        <div className="p-3 space-y-2 h-120 bg-black">
          <div className="border border-neutral-600 bg-neutral-900 rounded-3xl overflow-hidden">
            <div className="p-4  border-b border-neutral-600/50">
              <input
                type="text"
                value={feedName}
                onChange={(e) => setFeedName(e.target.value)}
                placeholder="Tên bảng feed"
                className="w-full bg-inherit py-1 text-base placeholder-neutral-500 text-white focus:outline-none"
              />
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="text-xs w-full focus:outline-none text-neutral-500 mt-1"
                placeholder="Hãy mô tả ngắn gọn"
              />
            </div>

            <div className="p-4 bg-neutral-900/40">
              <h4 className="font-semibold text-sm mb-1">
                Bảng feed công khai
              </h4>

              <label
                htmlFor="public-toggle"
                className="flex items-center justify-between gap-4 cursor-pointer select-none"
              >
                <p className="text-xs text-neutral-400 leading-relaxed max-w-[80%]">
                  Khi cài đặt này bật, bất kỳ ai cũng có thể nhìn thấy và chia
                  sẻ bảng feed này. Bảng feed và các trang cá nhân trên đó có
                  thể được gợi ý để người khác theo dõi.
                </p>

                <input
                  type="checkbox"
                  id="public-toggle"
                  checked={isPublic}
                  onChange={() => setIsPublic(!isPublic)}
                  className="sr-only peer "
                />

                <div
                  className="relative w-11 h-6 min-w-[44px] rounded-full bg-[#333639] transition-colors duration-200 
                  peer-checked:bg-white
                  after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
                  after:bg-[#1c1c1c] after:rounded-full after:h-5 after:w-5 
                  after:transition-all duration-200
                  peer-checked:after:translate-x-full"
                ></div>
              </label>
            </div>
          </div>
          <h4 className="font-bold mt-3 mb-2">Trong bảng feed này</h4>
          <button className="p-3 bg-neutral-900 w-full rounded-xl flex gap-3 items-center justify-start">
            <span className="w-fit bg-black px-2 py-1.5 cursor-pointer rounded-full">
              <i className="fa-solid fa-plus"></i>
            </span>
            <span className="font-bold">Thêm chủ đề hoặc trang cá nhân</span>
          </button>
        </div>
        <div className="py-2 px-4 flex items-center justify-end">
          <button
            onClick={handleSubmit}
            className="px-3 py-1 bg-white rounded-lg text-black font-bold"
          >
            Xong
          </button>
        </div>
      </div>
    </div>
  );
}
