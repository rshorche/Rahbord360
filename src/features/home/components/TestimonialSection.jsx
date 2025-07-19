import { motion } from "framer-motion";
import { Quote } from "lucide-react";

export default function TestimonialSection() {
  return (
    <section className="relative isolate overflow-hidden bg-white px-6 py-24 sm:py-32 lg:px-8">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(45rem_50rem_at_top,theme(colors.indigo.100),white)] opacity-20" />
      <motion.div
        className="mx-auto max-w-2xl lg:max-w-4xl"
        initial={{ opacity: 0.5, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.7 }}
      >
        <Quote className="mx-auto h-12 w-12 text-gray-300" />
        <figure className="mt-10">
          <blockquote className="text-center text-xl font-semibold leading-8 text-gray-900 sm:text-2xl sm:leading-9">
            <p>
              "این دقیقاً همان ابزاری بود که برای مدیریت یکپارچه سبد سهام و مشتقه خودم نیاز داشتم. داشبورد تحلیلی و محاسبات دقیق آن، تصمیم‌گیری را برای من بسیار ساده‌تر کرده است."
            </p>
          </blockquote>
          <figcaption className="mt-10">
            <div className="mt-4 flex items-center justify-center space-x-3 text-base">
              <div className="font-semibold text-gray-900">یک فعال بازار سرمایه</div>
              <svg viewBox="0 0 2 2" width={3} height={3} aria-hidden="true" className="fill-gray-900">
                <circle cx={1} cy={1} r={1} />
              </svg>
              <div className="text-gray-600">مدیر سبد</div>
            </div>
          </figcaption>
        </figure>
      </motion.div>
    </section>
  );
}