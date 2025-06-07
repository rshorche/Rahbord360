// src/components/common/Button.jsx
import { cn } from "../../utils/cn";

const Button = ({
  variant = "primary",
  size = "default",
  className,
  children,
  icon,
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center gap-x-2 whitespace-nowrap rounded-full text-sm font-medium outline-none shadow-sm hover:shadow-md hover:-translate-y-px transition-all duration-300 ease-in-out disabled:opacity-60 disabled:pointer-events-none ";

  const variants = {
    primary: "bg-gradient-to-r from-primary-400 to-primary-500 text-white",
    danger: "bg-gradient-to-r from-danger-500 to-danger-600 text-white",
    success: "bg-gradient-to-r from-success-500 to-success-600 text-white",

    "primary-light":
      "bg-gradient-to-r from-primary-100 to-primary-200 text-primary-700",
    "danger-light":
      "bg-gradient-to-r from-danger-100 to-danger-200 text-danger-800",
    "success-light":
      "bg-gradient-to-r from-success-100 to-success-200 text-success-800",

    outline:
      "border border-content-300 bg-white text-content-600 hover:bg-content-100 hover:text-content-800",
    ghost: "text-content-600 hover:bg-content-100 hover:text-content-800",
  };

  const sizes = {
    default: "h-10 px-4 py-2",
    sm: "h-9 px-3",
    lg: "h-11 px-8",
    icon: "h-10 w-10",
  };

  const combinedClasses = cn(
    baseStyles,
    variants[variant] || variants.primary,
    sizes[size] || sizes.default,
    className
  );

  return (
    <button className={combinedClasses} {...props}>
      {icon}
      {children}
    </button>
  );
};

export default Button;
