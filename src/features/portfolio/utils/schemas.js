import * as yup from "yup";

const dateRegex = /^[\d۰-۹]{4}\/[\d۰-۹]{2}\/[\d۰-۹]{2}$/;

export const baseStockTradeSchema = yup.object().shape({
  date: yup
    .string()
    .required("تاریخ الزامی است.")
    .matches(dateRegex, "فرمت تاریخ نامعتبر است (مثال: ۱۴۰۲/۰۱/۰۱)."),
  symbol: yup.string().trim().required("نماد سهم الزامی است."),
  notes: yup.string().trim().optional(),
});

export const buySellSchema = baseStockTradeSchema.shape({
  type: yup
    .string()
    .oneOf(["buy", "sell"], "نوع معامله نامعتبر است.")
    .required("نوع معامله الزامی است."),
  quantity: yup
    .number()
    .typeError("تعداد باید عدد باشد.")
    .integer("تعداد باید عدد صحیح باشد.")
    .moreThan(0, "تعداد باید بزرگتر از صفر باشد.")
    .required("تعداد الزامی است."),
  price: yup
    .number()
    .typeError("قیمت باید عدد باشد.")
    .positive("قیمت باید مثبت باشد.")
    .required("قیمت الزامی است."),
  commission: yup
    .number()
    .typeError("کارمزد باید عدد باشد.")
    .min(0, "کارمزد نمی‌تواند منفی باشد.")
    .required("کارمزد الزامی است."),
});

export const dividendSchema = baseStockTradeSchema.shape({
  type: yup.string().oneOf(["dividend"]).required(),
  amount: yup
    .number()
    .typeError("مبلغ سود باید عدد باشد.")
    .positive("مبلغ سود باید مثبت باشد.")
    .required("مبلغ سود نقدی الزامی است."),
});

export const bonusSchema = baseStockTradeSchema.shape({
  type: yup.string().oneOf(["bonus"]).required(),
  quantity: yup
    .number()
    .typeError("تعداد سهام جایزه باید عدد باشد.")
    .integer("تعداد سهام جایزه باید عدد صحیح باشد.")
    .moreThan(0, "تعداد سهام جایزه باید بزرگتر از صفر باشد.")
    .required("تعداد سهام جایزه الزامی است."),
});

export const rightsIssueSchema = baseStockTradeSchema.shape({
  outcome: yup
    .string()
    .oneOf(["exercise", "sell"], "نتیجه حق تقدم نامعتبر است.")
    .required("نتیجه حق تقدم الزامی است."),
  quantity: yup.number().when("outcome", {
    is: "exercise",
    then: (schema) =>
      schema
        .typeError("تعداد سهام خریداری شده باید عدد باشد.")
        .integer("تعداد سهام خریداری شده باید عدد صحیح باشد.")
        .moreThan(0, "تعداد سهام خریداری شده باید بزرگتر از صفر باشد.")
        .required("تعداد سهام خریداری شده الزامی است."),
    otherwise: (schema) => schema.optional(),
  }),
  price: yup.number().when("outcome", {
    is: "exercise",
    then: (schema) =>
      schema
        .typeError("قیمت پذیره‌نویسی باید عدد باشد.")
        .positive("قیمت پذیره‌نویسی باید مثبت باشد.")
        .required("قیمت پذیره‌نویسی الزامی است."),
    otherwise: (schema) => schema.optional(),
  }),
  commission: yup.number().when("outcome", {
    is: "exercise",
    then: (schema) =>
      schema
        .typeError("کارمزد باید عدد باشد.")
        .min(0, "کارمزد نمی‌تواند منفی باشد.")
        .required("کارمزد الزامی است."),
    otherwise: (schema) => schema.optional(),
  }),
  amount: yup.number().when("outcome", {
    is: "sell",
    then: (schema) =>
      schema
        .typeError("مبلغ فروش حق تقدم باید عدد باشد.")
        .positive("مبلغ فروش حق تقدم باید مثبت باشد.")
        .required("مبلغ فروش حق تقدم الزامی است."),
    otherwise: (schema) => schema.optional(),
  }),
});

export const revaluationSchema = baseStockTradeSchema.shape({
  type: yup.string().oneOf(["revaluation"]).required(),
  revaluation_percentage: yup
    .number()
    .typeError("درصد افزایش سرمایه باید عدد باشد.")
    .positive("درصد افزایش سرمایه باید مثبت باشد.")
    .max(1000, "درصد افزایش سرمایه بیش از حد مجاز است (حداکثر ۱۰۰۰٪).")
    .required("درصد افزایش سرمایه الزامی است."),
});

export const premiumSchema = baseStockTradeSchema.shape({
  type: yup.string().oneOf(["premium"]).required(),
  premium_type: yup
    .string()
    .oneOf(["cash_payment", "bonus_shares"], "نوع صرف سهام نامعتبر است.")
    .required("نوع صرف سهام الزامی است."),
  amount: yup.number().when("premium_type", {
    is: "cash_payment",
    then: (schema) =>
      schema
        .typeError("مبلغ پرداختی باید عدد باشد.")
        .positive("مبلغ پرداختی باید مثبت باشد.")
        .required("مبلغ پرداختی الزامی است."),
    otherwise: (schema) => schema.optional(),
  }),
  quantity: yup.number().when("premium_type", {
    is: "bonus_shares",
    then: (schema) =>
      schema
        .typeError("تعداد سهام جایزه باید عدد باشد.")
        .integer("تعداد سهام جایزه باید عدد صحیح باشد.")
        .moreThan(0, "تعداد سهام جایزه باید بزرگتر از صفر باشد.")
        .required("تعداد سهام جایزه الزامی است."),
    otherwise: (schema) => schema.optional(),
  }),
});
