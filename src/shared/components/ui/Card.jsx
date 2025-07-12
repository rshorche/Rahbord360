import { cn } from "../../utils/cn";
import { formatCurrency } from "../../utils/formatters";

const Card = ({
  color = "default",
  title,
  amount,
  icon,
  className,
}) => {
  const cardColorStyles = {
    primary: "bg-primary-50 border-primary-500",
    success: "bg-success-50 border-success-500",
    danger: "bg-danger-50 border-danger-500",
    default: "bg-white border-content-200",
  };

  return (
    <div
      className={cn(
        "p-4 rounded-xl border-l-4 flex items-center gap-4 transition-all duration-300 shadow-sm hover:shadow-md",
        cardColorStyles[color] || cardColorStyles.default,
        className
      )}>
      {icon && (
        <div className="flex-shrink-0 p-3 bg-white/60 rounded-full">
          {icon}
        </div>
      )}
      <div className="flex-grow">
        <h3 className="text-sm font-medium text-content-600">
          {title}
        </h3>
        {amount !== undefined && (
          <p className="text-2xl font-bold text-content-800">
            {formatCurrency(amount)}
            <span className="text-xs font-normal text-content-500 mr-1">
              تومان
            </span>
          </p>
        )}
      </div>
    </div>
  );
};

export default Card;