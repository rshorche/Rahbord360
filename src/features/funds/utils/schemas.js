import * as yup from "yup";

const emptyStringToUndefined = (value, originalValue) => {
  if (typeof originalValue === 'string' && originalValue.trim() === '') {
    return undefined;
  }
  return value;
};

export const fundTradeSchema = yup.object().shape({
  date: yup.date()
    .typeError("لطفا یک تاریخ معتبر انتخاب کنید.")
    .max(new Date(new Date().setHours(23, 59, 59, 999)), "تاریخ معامله نمی‌تواند در آینده باشد.")
    .required("تاریخ الزامی است"),

  symbol: yup.string().trim().required("انتخاب نماد صندوق الزامی است."),
  
  fund_type: yup.string().oneOf(['GOLD', 'EQUITY', 'FIXED_INCOME', 'OTHER'], "نوع صندوق نامعتبر است.").required("انتخاب نوع صندوق الزامی است."),
  
  trade_type: yup.string().oneOf(['buy', 'sell'], "نوع معامله نامعتبر است.").required("انتخاب نوع معامله الزامی است."),
  
  quantity: yup.number()
    .transform(emptyStringToUndefined)
    .positive("تعداد واحد باید مثبت باشد.")
    .required("تعداد واحد الزامی است."),
    
  price_per_unit: yup.number()
    .transform(emptyStringToUndefined)
    .positive("قیمت هر واحد باید مثبت باشد.")
    .required("قیمت هر واحد الزامی است."),
    
  commission: yup.number()
    .transform(emptyStringToUndefined)
    .min(0, "کارمزد نمی‌تواند منفی باشد.")
    .default(0),
    
  notes: yup.string().optional(),
});