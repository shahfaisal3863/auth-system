
import { useEffect } from "react";

function Toast({ message, type = "success", onClose }) {
  useEffect(() => {
    if (!message) return;

    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;

  const isError = type === "error";

  return (
    <div
      className={`fixed right-5 top-5 z-50 flex max-w-sm items-center gap-3 rounded-xl border px-5 py-4 shadow-2xl ${
        isError
          ? "border-red-500/30 bg-red-950 text-red-200"
          : "border-emerald-500/30 bg-emerald-950 text-emerald-200"
      }`}
    >
      <span className="text-xl">
        {isError ? "✕" : "✓"}
      </span>

      <p className="flex-1 text-sm font-medium">{message}</p>

      <button
        type="button"
        onClick={onClose}
        className="text-lg opacity-70 hover:opacity-100"
      >
        ×
      </button>
    </div>
  );
}

export default Toast;
