import * as yup from "yup";

const emptyStringToUndefined = (value, originalValue) => {
  if (typeof originalValue === 'string' && originalValue.trim() === '') {
    return undefined;
  }
  return value;
};

const baseActionSchema = yup.object().shape({
  date: yup.date().typeError("لطفا یک تاریخ معتبر انتخاب کنید.").required("تاریخ الزامی است"),
  symbol: yup.string().trim().required("انتخاب نماد الزامی است."),
  notes: yup.string().trim().optional(),
});

export const buySellSchema = baseActionSchema.shape({
  type: yup.string().oneOf(["buy", "sell"]).required(),
  quantity: yup.number().transform(emptyStringToUndefined).typeError("تعداد باید عدد باشد.").positive("تعداد باید بزرگتر از صفر باشد.").required("تعداد الزامی است."),
  price: yup.number().transform(emptyStringToUndefined).typeError("قیمت باید عدد باشد.").positive("قیمت باید مثبت باشد.").required("قیمت الزامی است."),
  commission: yup.number().transform(emptyStringToUndefined).typeError("کارمزد باید عدد باشد.").min(0, "کارمزد نمی‌تواند منفی باشد.").default(0),
});

export const dividendSchema = baseActionSchema.shape({
    type: yup.string().oneOf(["dividend"]).required(),
    amount: yup.number().transform(emptyStringToUndefined).typeError("مبلغ سود باید عدد باشد.").positive("مبلغ سود باید مثبت باشد.").required("مبلغ سود نقدی الزامی است."),
});

export const bonusSchema = baseActionSchema.shape({
    type: yup.string().oneOf(["bonus"]).required(),
    quantity: yup.number().transform(emptyStringToUndefined).typeError("تعداد سهام باید عدد باشد.").integer("تعداد سهام باید عدد صحیح باشد.").positive("تعداد سهام باید بزرگتر از صفر باشد.").required("تعداد سهام جایزه الزامی است."),
});

export const rightsIssueSchema = baseActionSchema.shape({
    date: yup.date().typeError("لطفا یک تاریخ معتبر انتخاب کنید.").required("تاریخ الزامی است"),
    symbol: yup.string().trim().required("انتخاب نماد الزامی است."),
    outcome: yup.string().oneOf(["exercise", "sell"]).required("انتخاب نتیجه الزامی است."),
    quantity: yup.number().transform(emptyStringToUndefined).when("outcome", { is: "exercise", then: (schema) => schema.typeError("تعداد باید عدد باشد.").positive("تعداد باید بزرگتر از صفر باشد.").required("تعداد الزامی است."), otherwise: (schema) => schema.optional().nullable(), }),
    price: yup.number().transform(emptyStringToUndefined).when("outcome", { is: "exercise", then: (schema) => schema.typeError("قیمت باید عدد باشد.").positive("قیمت باید مثبت باشد.").required("قیمت الزامی است."), otherwise: (schema) => schema.optional().nullable(), }),
    commission: yup.number().transform(emptyStringToUndefined).when("outcome", { is: "exercise", then: (schema) => schema.typeError("کارمزد باید عدد باشد.").min(0, "کارمزد نمی‌تواند منفی باشد.").default(0), otherwise: (schema) => schema.optional().nullable(), }),
    amount: yup.number().transform(emptyStringToUndefined).when("outcome", { is: "sell", then: (schema) => schema.typeError("مبلغ باید عدد باشد.").positive("مبلغ باید مثبت باشد.").required("مبلغ فروش الزامی است."), otherwise: (schema) => schema.optional().nullable(), }),
    notes: yup.string().trim().optional(),
});

export const revaluationSchema = baseActionSchema.shape({
    type: yup.string().oneOf(["revaluation"]).required(),
    revaluation_percentage: yup.number().transform(emptyStringToUndefined).typeError("درصد باید عدد باشد.").positive("درصد باید مثبت باشد.").required("درصد افزایش سرمایه الزامی است."),
});

export const premiumSchema = baseActionSchema.shape({
    type: yup.string().oneOf(["premium"]).required(),
    premium_type: yup.string().oneOf(["cash_payment", "bonus_shares"]).required("انتخاب نوع صرف سهام الزامی است."),
    amount: yup.number().transform(emptyStringToUndefined).when("premium_type", { is: "cash_payment", then: (schema) => schema.typeError("مبلغ باید عدد باشد.").positive("مبلغ باید مثبت باشد.").required("مبلغ دریافتی الزامی است."), otherwise: (schema) => schema.optional().nullable(), }),
    quantity: yup.number().transform(emptyStringToUndefined).when("premium_type", { is: "bonus_shares", then: (schema) => schema.typeError("تعداد باید عدد باشد.").positive("تعداد باید بزرگتر از صفر باشد.").required("تعداد سهام جایزه الزامی است."), otherwise: (schema) => schema.optional().nullable(), }),
});