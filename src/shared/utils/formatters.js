import clsx from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const formatCurrency = (value) => {
  if (value == null || isNaN(Number(value))) return "-";
  return Number(value).toLocaleString("fa-IR");
};

export const formatDisplayNumber = (value, precision = 0, suffix = "") => {
  if (value == null || isNaN(Number(value))) return "-";
  const num = Number(value);
  const formatted = num.toLocaleString("fa-IR", {
    minimumFractionDigits: precision,
    maximumFractionDigits: precision,
  });
  return `${formatted}${suffix}`;
};
