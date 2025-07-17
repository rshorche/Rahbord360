import Swal from 'sweetalert2';

export const showSuccessToast = (title) => {
  Swal.fire({
    icon: 'success',
    title: title,
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
  });
};

export const showErrorAlert = (title, text = '') => {
  Swal.fire({
    icon: 'error',
    title: title,
    text: text,
    confirmButtonText: 'متوجه شدم',
  });
};

// --- این تابع را اضافه کنید ---
export const showInfoAlert = (title, text = '') => {
  Swal.fire({
    icon: 'info',
    title: title,
    text: text,
    confirmButtonText: 'باشه',
  });
};

export const showConfirmAlert = async (title, text) => {
    const result = await Swal.fire({
        title: title,
        text: text,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'بله، حذف کن!',
        cancelButtonText: 'انصراف'
    });
    return result.isConfirmed;
};