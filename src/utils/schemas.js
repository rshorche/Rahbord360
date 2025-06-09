import * as yup from "yup";

export const transactionSchema = yup.object().shape({
  date: yup
    .string()
    .required("تاریخ الزامی است")
    .matches(/^[\d۰-۹]{4}\/[\d۰-۹]{2}\/[\d۰-۹]{2}$/, "فرمت تاریخ نامعتبر است"),
  broker: yup.string().trim().required("نام کارگزاری الزامی است"),
  amount: yup
    .number()
    .typeError("مبلغ باید عدد باشد")
    .positive("مبلغ باید مثبت باشد")
    .required("مبلغ الزامی است"),
  type: yup
    .string()
    .oneOf(["deposit", "withdraw"], "نوع تراکنش نامعتبر است")
    .required("نوع تراکنش الزامی است"),
  description: yup.string().trim().optional(),
});
