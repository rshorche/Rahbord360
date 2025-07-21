import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BarChart, CheckCircle, PieChart } from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: "easeOut" } },
};

const mockUiVariants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { type: "spring", stiffness: 100, damping: 15, delay: 0.5 },
  },
};

export default function HeroSection() {
  return (
    <div className="relative bg-white py-24 sm:py-32">
      <div
        className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
        aria-hidden="true"
      >
        <div
          className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#8b5cf6] to-[#0ea5e9] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
          style={{
            clipPath:
              "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
          }}
        />
      </div>
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:mx-0 lg:grid lg:max-w-none lg:grid-cols-2 lg:gap-x-16 lg:gap-y-6 xl:grid-cols-12 xl:gap-x-8">
          <motion.div
            className="text-center lg:text-right xl:col-span-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.h1
              variants={itemVariants}
              className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-6xl"
            >
              پرتفوی خود را هوشمندانه مدیریت کنید
            </motion.h1>
            <motion.p
              variants={itemVariants}
              className="mt-6 text-lg leading-8 text-gray-600"
            >
              با رهبرد ۳۶۰، تمام دارایی‌های بورسی خود را در یک داشبورد
              یکپارچه رصد کرده، استراتژی‌ها را بسنجید و با دیدی کامل، بهترین
              تصمیمات را برای رشد سرمایه خود بگیرید.
            </motion.p>
            <motion.div
              variants={itemVariants}
              className="mt-10 flex items-center justify-center gap-x-6 lg:justify-start"
            >
              <Link
                to="/auth/signup"
                className="rounded-md bg-primary-600 px-5 py-3 text-base font-semibold text-white shadow-lg hover:bg-primary-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 transition-all transform hover:scale-105"
              >
                شروع رایگان
              </Link>
              <a
                href="#how-it-works"
                className="text-base font-semibold leading-7 text-gray-900"
              >
                بیشتر بدانید <span aria-hidden="true">→</span>
              </a>
            </motion.div>
          </motion.div>

          <motion.div
            className="mt-14 flex justify-center lg:mt-0 xl:col-span-6"
            variants={mockUiVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-gray-900/10">
              <div className="flex items-center justify-between">
                <p className="text-lg font-semibold text-gray-800">
                  خلاصه داشبورد
                </p>
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-green-400 to-blue-500" />
              </div>
              <div className="mt-6 space-y-4">
                <div className="flex items-center gap-x-4 rounded-lg bg-gray-50 p-4">
                  <PieChart className="h-8 w-8 flex-none text-primary-500" />
                  <div className="flex-auto">
                    <p className="font-semibold text-gray-700">ترکیب دارایی</p>
                    <div className="mt-2 h-2 w-full rounded-full bg-gray-200">
                      <div
                        className="h-2 rounded-full bg-primary-500"
                        style={{ width: "65%" }}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-x-4 rounded-lg bg-gray-50 p-4">
                  <BarChart className="h-8 w-8 flex-none text-yellow-500" />
                  <div className="flex-auto">
                    <p className="font-semibold text-gray-700">بازدهی کل</p>
                    <div className="mt-2 h-2 w-full rounded-full bg-gray-200">
                      <div
                        className="h-2 rounded-full bg-yellow-500"
                        style={{ width: "80%" }}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-x-4 rounded-lg bg-gray-50 p-4">
                  <CheckCircle className="h-8 w-8 flex-none text-green-500" />
                  <div className="flex-auto">
                    <p className="font-semibold text-gray-700">
                      وضعیت استراتژی‌ها
                    </p>
                    <div className="mt-2 h-2 w-full rounded-full bg-gray-200">
                      <div
                        className="h-2 rounded-full bg-green-500"
                        style={{ width: "95%" }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}