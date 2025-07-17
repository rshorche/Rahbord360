import { memo } from "react";
import Button from "../../../shared/components/ui/Button";
import { Eye } from "lucide-react";

const FundActionsRenderer = ({ data, onOpenDetails }) => {
  return (
    <div className="flex items-center justify-center h-full">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onOpenDetails(data)}
        title="مشاهده جزئیات"
        className="h-8 w-8 text-content-600 hover:bg-primary-100"
      >
        <Eye size={18} />
      </Button>
    </div>
  );
};

export default memo(FundActionsRenderer);