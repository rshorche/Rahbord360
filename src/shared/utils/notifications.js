// src/utils/notifications.js
import Swal from "sweetalert2"; // SweetAlert2 باید نصب شده باشد

/**
 * نمایش یک پیام موفقیت به صورت Toast.
 * @param {string} text - متن پیام موفقیت.
 */
export const showSuccessToast = (text) => {
  Swal.fire({
    icon: "success",
    title: "موفق",
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
