import copy from "copy-to-clipboard";

export default function EmbedModal({ post, onClose }) {
  if (!post) return null;

  const embedPath = `/${post.user?.username}/post/${post.id}/embed`;
  const embedUrl = `${window.location.origin}${embedPath}`;
  const code = `<iframe src="${embedUrl}" width="100%" height="400" frameborder="0"></iframe>`;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-neutral-900 border border-zinc-700 rounded-2xl p-4 z-10 space-y-4 text-white">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-base">Embed post</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full hover:bg-neutral-800"
          >
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        <iframe
          title="embed-preview"
          src={embedPath}
          className="w-full h-80 rounded-xl bg-white border border-zinc-700"
        />

        <textarea
          readOnly
          value={code}
          className="w-full h-24 text-xs bg-black border border-zinc-700 rounded-lg p-2 font-mono text-neutral-300 focus:outline-none resize-none"
        />

        <button
          type="button"
          className="w-full py-2.5 rounded-xl bg-white text-black font-bold text-sm hover:bg-neutral-200 transition"
          onClick={() => {
            copy(code);
            alert("Đã copy embed code");
          }}
        >
          Copy
        </button>
      </div>
    </div>
  );
}