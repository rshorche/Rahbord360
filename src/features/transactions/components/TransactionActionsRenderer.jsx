// src/features/transactions/components/TransactionActionsRenderer.jsx
import React from "react";
import Button from "../../../shared/components/ui/Button"; // مسیر صحیح کامپوننت Button
import { Edit, Trash2 } from "lucide-react";

const TransactionActionsRenderer = ({ data, onEdit, onDelete }) => (
  <div className="flex items-center justify-center h-full space-x-1 rtl:space-x-reverse">
    <Button
      variant="ghost"
      size="icon"
      onClick={() => onEdit(data)}
      title="ویرایش"
      className="h-8 w-8 shadow-none text-blue-600 hover:bg-blue-100">
      <Edit size={16} />
    </Button>
    <Button
      variant="ghost"
      size="icon"
      onClick={() => onDelete(data.id)}
      title="حذف"
      className="h-8 w-8 shadow-none text-danger-600 hover:bg-danger-100">
      <Trash2 size={16} />
    </Button>
  </div>
);

export default TransactionActionsRenderer;
