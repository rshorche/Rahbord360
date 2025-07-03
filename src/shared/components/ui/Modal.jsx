import { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "../../utils/cn";
import LoadingSpinner from "./LoadingSpinner"; // 1. ایمپورت اسپینر

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  className,
  isLoading = false, // 2. پراپرتی جدید برای کنترل لودینگ
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-content-900/60 p-4 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className={cn(
          "relative bg-white rounded-xl shadow-2xl w-full max-w-lg mx-auto flex flex-col transform transition-all animate-scale-in",
          "focus:outline-none",
          className
        )}
        onClick={(e) => e.stopPropagation()}
        style={{ maxHeight: "90vh" }}
        role="document"
      >
        {/* 3. افزودن پوشش لودینگ */}
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 backdrop-blur-sm rounded-xl">
            <LoadingSpinner text="در حال پردازش..." />
          </div>
        )}

        <div className="flex-shrink-0 flex justify-between items-center p-4 sm:p-5 border-b border-content-200">
          <h3 id="modal-title" className="text-lg font-semibold text-content-main">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-content-500 hover:bg-content-100 hover:text-content-800 transition-colors"
            aria-label="بستن"
          >
            <X size={24} />
          </button>
        </div>

        <div className="overflow-y-auto p-4 sm:p-6 flex-grow">{children}</div>
      </div>
    </div>
  );
};

export default Modal;