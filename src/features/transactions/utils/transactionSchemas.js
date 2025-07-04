import * as yup from "yup";

export const transactionSchema = yup.object().shape({
  // این خط اصلاح شد
  date: yup.date().typeError("لطفا یک تاریخ معتبر انتخاب کنید.").required("تاریخ الزامی است"),
    
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