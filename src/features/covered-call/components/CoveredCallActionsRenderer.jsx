import { memo } from "react";
import Button from "../../../shared/components/ui/Button";
import { Settings } from "lucide-react";

/**
 * کامپوننت دکمه "عملیات" برای هر ردیف در جدول کاورد کال
 * @param {object} props
 * @param {object} props.data - داده‌های کامل مربوط به ردیف فعلی جدول
 * @param {function(data: object): void} props.onOpenActionsModal - تابعی که با کلیک روی دکمه فراخوانی شده و مودال عملیات را باز می‌کند
 */
const CoveredCallActionsRenderer = ({ data, onOpenActionsModal }) => {
  return (
    <div className="flex items-center justify-center h-full">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onOpenActionsModal(data)}
        title="مدیریت و عملیات"
        className="h-8 w-8 text-content-600 hover:bg-content-100"
      >
        <Settings size={16} />
      </Button>
    </div>
  );
};

// استفاده از React.memo برای جلوگیری از رندرهای غیرضروری در جدول
export default memo(CoveredCallActionsRenderer);