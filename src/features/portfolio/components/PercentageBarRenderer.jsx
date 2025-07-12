import { cn } from "../../../shared/utils/cn";

const PercentageBarRenderer = (props) => {
  const value = props.value || 0;
  const displayValue = `${Number(value).toLocaleString('fa-IR', { maximumFractionDigits: 1 })}%`;

  return (
    <div className="w-full h-full flex items-center relative" title={displayValue}>
      <div
        className={cn(
          "h-full transition-all duration-300",
          value > 0 ? 'bg-primary-200' : 'bg-content-200'
        )}
        style={{ width: `${Math.min(value, 100)}%` }}
      />
      <span className="absolute right-2 left-2 text-center text-xs font-semibold text-content-800">
        {displayValue}
      </span>
    </div>
  );
};

export default PercentageBarRenderer;