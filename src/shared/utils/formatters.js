export const formatCurrency = (value, precision = 0) => {
  if (value == null || isNaN(Number(value))) return "-";
  const num = Number(value);
  return num.toLocaleString("fa-IR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: precision,
  });
};

export const formatDisplayNumber = (value, precision = 2, suffix = "") => {
  if (value == null || isNaN(Number(value))) return "-";
  const num = Number(value);
  const formatted = num.toLocaleString("fa-IR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: precision,
  });
  return `${formatted}${suffix}`;
};