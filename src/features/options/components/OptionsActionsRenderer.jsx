import { memo } from "react";
import Button from "../../../shared/components/ui/Button";
import { Settings } from "lucide-react";

const OptionsActionsRenderer = ({ data, onOpenActionsModal }) => {
  return (
    <div className="flex items-center justify-center h-full">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onOpenActionsModal(data)}
        title="عملیات"
        className="h-8 w-8 text-content-600 hover:bg-content-100"
      >
        <Settings size={16} />
      </Button>
    </div>
  );
};

export default memo(OptionsActionsRenderer);