import Button from "../../../shared/components/ui/Button";
import { Eye } from "lucide-react";

export default function DetailsActionRenderer({ data, onViewDetails }) {
  return (
    <div className="flex items-center justify-center h-full">
      <Button
        className="p-1.5 h-8 w-8 rounded-md"
        variant="ghost"
        onClick={() => onViewDetails(data)}>
        <Eye size={18} />
      </Button>
    </div>
  );
}
