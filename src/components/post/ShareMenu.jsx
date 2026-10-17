import copy from "copy-to-clipboard";

export default function ShareMenu({ post, onClose, onEmbed }) {
  const url = `${window.location.origin}/${post.user?.username}/post/${post.id}`;

  const itemCls =
    "w-full text-left px-3 py-2.5 text-sm rounded-lg hover:bg-neutral-800 transition";

  return (
    <div
      className="absolute -bottom-20 right-0 z-50 w-52 rounded-xl bg-neutral-900/50 text-white border border-zinc-700 shadow-xl p-1"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        className={itemCls}
        onClick={() => {
          copy(url);
          onClose?.();
        }}
      >
        Copy link
      </button>

      <button
        type="button"
        className={itemCls}
        onClick={() => {
          onEmbed?.(post);
          onClose?.();
        }}
      >
        Get embed code
      </button>
    </div>
  );
}
