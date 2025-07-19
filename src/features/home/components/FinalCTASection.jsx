import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function FinalCTASection() {
  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl py-24 sm:px-6 sm:py-32 lg:px-8">
        <motion.div
          className="relative isolate overflow-hidden bg-primary-900 px-6 pt-16 shadow-2xl sm:rounded-3xl sm:px-16 md:pt-24 lg:flex lg:gap-x-20 lg:px-24 lg:pt-0"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8 }}
        >
          <svg
            viewBox="0 0 1024 1024"
            className="absolute left-1/2 top-1/2 -z-10 h-[64rem] w-[64rem] -translate-y-1/2 [mask-image:radial-gradient(closest-side,white,transparent)] sm:left-full sm:-ml-80 lg:left-1/2 lg:ml-0 lg:-translate-x-1/2 lg:translate-y-0"
            aria-hidden="true"
          >
            <circle cx={512} cy={512} r={512} fill="url(#gradient-cta)" fillOpacity="0.7" />
            <defs>
              <radialGradient id="gradient-cta">
                <stop stopColor="#7775D6" />
                <stop offset={1} stopColor="#E935C1" />
              </radialGradient>
            </defs>
          </svg>
          <div className="mx-auto max-w-md text-center lg:mx-0 lg:flex-auto lg:py-32 lg:text-right">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              آینده سرمایه‌گذاری خود را امروز بسازید.
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-300">
              به جمع سرمایه‌گذاران هوشمندی بپیوندید که با ابزار دقیق، بهترین نتایج را می‌گیرند.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6 lg:justify-end">
              <Link
                to="/auth/signup"
                className="rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                همین حالا شروع کنید
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}