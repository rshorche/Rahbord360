import Button from "../../../shared/components/ui/Button";
import { Edit, Trash2 } from "lucide-react";

const TransactionActionsRenderer = ({ data, onEdit, onDelete }) => (
  <div className="flex items-center justify-center h-full space-x-1 rtl:space-x-reverse">
    <Button
      variant="ghost"
      size="icon"
      onClick={() => onEdit(data)} // با کلیک، تابع onEdit با داده‌های کامل ردیف فراخوانی می‌شود
      title="ویرایش"
      className="h-8 w-8 shadow-none text-primary-600 hover:bg-primary-100"
    >
      <Edit size={16} />
    </Button>
    <Button
      variant="ghost"
      size="icon"
      onClick={() => onDelete(data.id)} // با کلیک، تابع onDelete با شناسه ردیف فراخوانی می‌شود
      title="حذف"
      className="h-8 w-8 shadow-none text-danger-600 hover:bg-danger-100"
    >
      <Trash2 size={16} />
    </Button>
  </div>
);

export default TransactionActionsRenderer;