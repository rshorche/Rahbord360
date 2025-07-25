import { motion } from 'framer-motion'

export default function TestimonialSection() {
  return (
    <div id="testimonials" className="relative isolate bg-white py-24 sm:py-32 scroll-mt-20">
      <div
        className="absolute inset-x-0 top-1/2 -z-10 -translate-y-1/2 transform-gpu overflow-hidden opacity-30 blur-3xl"
        aria-hidden="true"
      >
        <div
          className="ml-[max(50%,38rem)] aspect-[1313/771] w-[82.0625rem] bg-gradient-to-tr from-[#8b5cf6] to-[#0ea5e9]"
          style={{
            clipPath:
              'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
          }}
        />
      </div>
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          className="mx-auto grid max-w-2xl grid-cols-1 lg:mx-0 lg:max-w-none lg:grid-cols-2 lg:items-center lg:gap-y-16"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1, ease: 'easeOut' }}
        >
          <div className="max-w-xl lg:max-w-lg">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              صدای کاربرانی که به ما اعتماد کردند
            </h2>
            <p className="mt-4 text-lg leading-8 text-gray-600">
              ما به ارائه ابزاری قدرتمند و در عین حال ساده افتخار می‌کنیم که به سرمایه‌گذاران کمک می‌کند با دیدی بازتر تصمیم بگیرند.
            </p>
          </div>
          <figure className="mt-10 lg:mt-0">
            <blockquote className="text-center text-xl font-semibold leading-8 text-gray-900 sm:text-2xl sm:leading-9">
              <p>
                "این دقیقاً همان ابزاری بود که برای مدیریت یکپارچه سبد سهام و مشتقه خودم نیاز داشتم. داشبورد تحلیلی و محاسبات دقیق آن، تصمیم‌گیری را برای من بسیار ساده‌تر کرده است."
              </p>
            </blockquote>
            <figcaption className="mt-10">
              <img
                className="mx-auto h-12 w-12 rounded-full"
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                alt="تصویر پروفایل مشتری"
              />
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
      </div>
    </div>
  )
}