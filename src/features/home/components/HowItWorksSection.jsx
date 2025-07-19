import { motion } from "framer-motion";
import { GanttChartSquare, BrainCircuit, TrendingUp } from "lucide-react";

const steps = [
  {
    name: "۱. ثبت معاملات",
    description: "تمام معاملات سهام، صندوق و اختیار خود را به سادگی و با جزئیات کامل در سیستم ثبت کنید.",
    icon: GanttChartSquare,
  },
  {
    name: "۲. تحلیل هوشمند",
    description: "پورتفوی خود را با نمودارهای پیشرفته و معیارهای حرفه‌ای مانند بازدهی سالانه تحلیل کنید.",
    icon: BrainCircuit,
  },
  {
    name: "۳. رشد سرمایه",
    description: "با دیدی کامل، تصمیمات بهتری بگیرید و شاهد رشد سرمایه خود در داشبورد یکپارچه باشید.",
    icon: TrendingUp,
  },
];

const sectionVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { y: 30, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.7,
      ease: "easeOut",
    },
  },
};

export default function HowItWorksSection() {
  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.5 }}
            className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl"
          >
            تنها در ۳ قدم ساده، کنترل سبد خود را به دست بگیرید
          </motion.p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <motion.dl
            className="grid grid-cols-1 gap-x-8 gap-y-16 text-center lg:grid-cols-3"
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            {steps.map((step) => (
              <motion.div key={step.name} variants={itemVariants} className="flex flex-col">
                <dt className="text-base leading-7 text-gray-600">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-600 text-white mx-auto">
                    <step.icon size={24} />
                  </div>
                  <span className="mt-6 block font-semibold text-gray-900 text-lg">{step.name}</span>
                </dt>
                <dd className="mt-1 flex-auto text-base leading-7 text-gray-600">{step.description}</dd>
              </motion.div>
            ))}
          </motion.dl>
        </div>
      </div>
    </div>
  );
}