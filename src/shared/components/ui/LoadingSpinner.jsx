import { Loader2 } from "lucide-react";
import { cn } from "../../utils/cn";

export default function LoadingSpinner({ size = 48, className, text }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 p-4">
      <Loader2
        className={cn("animate-spin text-primary-500", className)}
        size={size}
        aria-label="در حال بارگذاری"
      />
      {text && (
        <p className="text-content-600 text-lg animate-pulse">{text}</p>
      )}
    </div>
  );
}