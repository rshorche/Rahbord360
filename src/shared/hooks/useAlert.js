// shared/hooks/useAlert.js
import Swal from "sweetalert2";

export const useAlert = () => {
  const showSuccess = (title, text) => {
    Swal.fire({
      icon: "success",
      title: title || "موفق!",
      text: text,
      timer: 1500,
      toast: true,
      position: "top-end",
      showConfirmButton: false,
    });
  };

  const showError = (title, text) => {
    Swal.fire({
      icon: "error",
      title: title || "خطا!",
      text: text || "مشکلی در عملیات رخ داد.",
    });
  };

  const showConfirm = async (title, text) => {
    const result = await Swal.fire({
      title: title || "آیا مطمئن هستید؟",
      text: text,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "بله، انجام بده!",
      cancelButtonText: "لغو",
    });
    return result.isConfirmed;
  };

  return { showSuccess, showError, showConfirm };
};
