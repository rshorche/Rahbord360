import { motion } from "framer-motion";
import { ShieldCheck, BarChart3, Layers, Package } from "lucide-react";

const features = [
  {
    name: "پرتفوی هوشمند سهام",
    description: "با محاسبات دقیق سود و زیان، میانگین خرید و بازدهی سالانه، دیدی کامل به سهام خود داشته باشید.",
    icon: BarChart3,
  },
  {
    name: "استراتژی کاورد کال",
    description: "بازدهی استراتژی‌های خود را بسنجید و سهام درگیر به عنوان ضمانت را به سادگی مدیریت کنید.",
    icon: ShieldCheck,
  },
  {
    name: "تحلیل اختیار معامله",
    description: "پوزیشن‌های خرید و فروش خود را به صورت تجمیع شده (Net Position) و با قیمت سر به سر دقیق تحلیل کنید.",
    icon: Layers,
  },
  {
    name: "مدیریت صندوق‌ها",
    description: "عملکرد صندوق‌های سرمایه‌گذاری طلا، سهامی و درآمد ثابت خود را در کنار سایر دارایی‌ها مقایسه کنید.",
    icon: Package,
  },
];

const cardVariants = {
  offscreen: {
    y: 50,
    opacity: 0,
  },
  onscreen: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      bounce: 0.4,
      duration: 0.8,
    },
  },
};

export default function FeaturesSection() {
  return (
    <div className="bg-content-50 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.5 }}
            className="text-base font-semibold leading-7 text-primary-600"
          >
            یکپارچه و قدرتمند
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl"
          >
            تمام آنچه برای مدیریت سبد خود نیاز دارید
          </motion.p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <motion.dl
            className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4"
            initial="offscreen"
            whileInView="onscreen"
            viewport={{ once: true, amount: 0.2 }}
            transition={{ staggerChildren: 0.2 }}
          >
            {features.map((feature) => (
              <motion.div
                key={feature.name}
                variants={cardVariants}
                className="flex flex-col items-center text-center p-6 bg-white rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-600 text-white">
                  <feature.icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <dt className="mt-4 text-lg font-semibold leading-7 text-gray-900">{feature.name}</dt>
                <dd className="mt-1 flex-auto text-sm leading-7 text-gray-600">{feature.description}</dd>
              </motion.div>
            ))}
          </motion.dl>
        </div>
      </div>
    </div>
  );
}