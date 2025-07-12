import * as yup from "yup";

const emptyStringToUndefined = (value, originalValue) => {
  if (typeof originalValue === 'string' && originalValue.trim() === '') {
    return undefined;
  }
  return value;
};

export const coveredCallSchema = yup.object().shape({
    underlying_symbol: yup.string().required("انتخاب نماد پایه الزامی است."),
    option_symbol: yup.string().required("انتخاب نماد آپشن الزامی است."),
    trade_date: yup.date().required("تاریخ معامله الزامی است."),
    expiration_date: yup.date()
        .required("تاریخ سررسید الزامی است.")
        .min(yup.ref('trade_date'), "تاریخ سررسید باید بعد از تاریخ معامله باشد."),
    strike_price: yup.number().transform(emptyStringToUndefined).positive("قیمت اعمال باید مثبت باشد.").required("قیمت اعمال الزامی است."),
    contracts_count: yup.number().transform(emptyStringToUndefined).integer("تعداد قرارداد باید عدد صحیح باشد.").positive("تعداد قرارداد باید مثبت باشد.").required("تعداد قرارداد الزامی است."),
    shares_per_contract: yup.number().transform(emptyStringToUndefined).integer().positive().default(1000).required(),
    premium_per_share: yup.number().transform(emptyStringToUndefined).positive("پرمیوم باید مثبت باشد.").required("پرمیوم دریافتی الزامی است."),
    commission: yup.number().transform(emptyStringToUndefined).min(0, "کارمزد نمی‌تواند منفی باشد.").default(0),
    underlying_cost_basis: yup.number().transform(emptyStringToUndefined).positive("قیمت سر به سر سهم پایه الزامی است.").required("قیمت سر به سر سهم پایه الزامی است."),
    notes: yup.string().optional(),
});

export const manageCoveredCallSchema = yup.object().shape({
    closing_date: yup.date().required("تاریخ الزامی است."),
    status: yup.string().oneOf(['CLOSED', 'ASSIGNED', 'EXPIRED']).required(),
    contracts_count: yup.number().transform(emptyStringToUndefined).integer("تعداد باید عدد صحیح باشد.").positive("تعداد قرارداد باید مثبت باشد.").required("تعداد قرارداد الزامی است."),
    closing_price_per_share: yup.number().transform(emptyStringToUndefined).when("status", {
        is: 'CLOSED',
        then: (schema) => schema.min(0, "قیمت نمی‌تواند منفی باشد.").required("قیمت بستن الزامی است."),
        otherwise: (schema) => schema.optional()
    }),
    closing_commission: yup.number().transform(emptyStringToUndefined).min(0, "کارمزد نمی‌تواند منفی باشد.").default(0),
});