import * as yup from "yup";

const emptyStringToUndefined = (value, originalValue) => {
  if (typeof originalValue === 'string' && originalValue.trim() === '') {
    return undefined;
  }
  return value;
};

export const optionsTradeSchema = yup.object().shape({
    underlying_symbol: yup.string().required("انتخاب نماد پایه الزامی است."),
    option_symbol: yup.string().required("انتخاب نماد آپشن الزامی است."),
    option_type: yup.string().oneOf(['call', 'put']).required("انتخاب نوع اختیار الزامی است."),
    trade_type: yup.string().oneOf(['buy_to_open', 'sell_to_open', 'buy_to_close', 'sell_to_close']).required("انتخاب نوع معامله الزامی است."),
    trade_date: yup.date().required("تاریخ معامله الزامی است."),
    expiration_date: yup.date()
        .required("تاریخ سررسید الزامی است.")
        .min(yup.ref('trade_date'), "تاریخ سررسید باید بعد از تاریخ معامله باشد."),
    strike_price: yup.number().transform(emptyStringToUndefined).positive("قیمت اعمال باید مثبت باشد.").required("قیمت اعمال الزامی است."),
    contracts_count: yup.number().transform(emptyStringToUndefined).integer("تعداد قرارداد باید عدد صحیح باشد.").positive("تعداد قرارداد باید مثبت باشد.").required("تعداد قرارداد الزامی است."),
    premium: yup.number().transform(emptyStringToUndefined).positive("پرمیوم باید مثبت باشد.").required("پرمیوم دریافتی/پرداختی الزامی است."),
    commission: yup.number().transform(emptyStringToUndefined).min(0, "کارمزد نمی‌تواند منفی باشد.").default(0),
    notes: yup.string().optional(),
});