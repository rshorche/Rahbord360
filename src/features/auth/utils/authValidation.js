import * as yup from "yup";

// اسکیمای مشترک برای ایمیل
const email = yup
  .string()
  .email("لطفاً یک ایمیل معتبر وارد کنید.")
  .required("ایمیل الزامی است.");

// اسکیمای مشترک برای رمز عبور
const password = yup
  .string()
  .min(6, "رمز عبور باید حداقل ۶ کاراکتر باشد.")
  .required("رمز عبور الزامی است.");

export const loginSchema = yup.object().shape({
  email,
  password,
});

export const signupSchema = yup.object().shape({
  email,
  password,
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password"), null], "رمزهای عبور باید مطابقت داشته باشند.")
    .required("تکرار رمز عبور الزامی است."),
});

export const forgotPasswordSchema = yup.object().shape({
  email,
});

// اسکیمای اضافه شده برای به‌روزرسانی رمز عبور
export const updatePasswordSchema = yup.object().shape({
  password, // استفاده مجدد از اسکیمای پسورد
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password"), null], "رمزهای عبور باید مطابقت داشته باشند.")
    .required("تکرار رمز عبور الزامی است."),
});