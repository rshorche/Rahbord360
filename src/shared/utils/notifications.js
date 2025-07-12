import Swal from "sweetalert2";

export const showSuccessToast = (text) => {
  Swal.fire({
    icon: "success",
    text: text,
    timer: 1500,
    toast: true,
    position: "top-end",
    showConfirmButton: false,
  });
};

export const showErrorAlert = (title, htmlContent) => {
  const defaultText = "مشکلی در ذخیره‌سازی اطلاعات رخ داد.";
  Swal.fire({
    icon: "error",
    title: title || "خطا!",
    html: htmlContent || defaultText, 
  });
};

export const showConfirmAlert = async (title, text) => {
  const result = await Swal.fire({
    title: title,
    text: text,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#6b7280",
    confirmButtonText: "بله، مطمئنم!",
    cancelButtonText: "لغو",
  });
  return result.isConfirmed;
};