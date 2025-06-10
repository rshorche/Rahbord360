// src/shared/utils/notifications.js
import Swal from "sweetalert2"; // SweetAlert2 فقط در اینجا ایمپورت می‌شود

/**
 * نمایش یک پیام موفقیت به صورت Toast.
 * @param {string} text - متن پیام موفقیت.
 */
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

/**
 * نمایش یک پیام خطا به صورت Alert.
 * @param {string} [text="مشکلی در ذخیره‌سازی اطلاعات رخ داد."] - متن پیام خطا.
 */
export const showErrorAlert = (
  text = "مشکلی در ذخیره‌سازی اطلاعات رخ داد."
) => {
  Swal.fire({
    icon: "error",
    title: "خطا!",
    text: text,
  });
};

/**
 * نمایش یک پنجره تاییدیه به کاربر.
 * @param {string} title - عنوان پنجره تاییدیه.
 * @param {string} text - متن اصلی پیام تاییدیه.
 * @returns {Promise<boolean>} - اگر کاربر تایید کند، true برمی‌گرداند.
 */
export const showConfirmAlert = async (title, text) => {
  const result = await Swal.fire({
    title: title,
    text: text,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#6b7280",
    confirmButtonText: "بله، حذف کن!",
    cancelButtonText: "لغو",
  });
  return result.isConfirmed;
};
