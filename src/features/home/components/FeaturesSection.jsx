import { motion } from 'framer-motion'
import { BarChart3, ShieldCheck, Layers, Package } from 'lucide-react'

const features = [
  {
    name: 'پرتفوی هوشمند سهام',
    description: 'با محاسبات دقیق سود و زیان، میانگین خرید و بازدهی سالانه، دیدی کامل به سهام خود داشته باشید.',
    icon: BarChart3,
    color: 'text-sky-500',
    bgColor: 'bg-sky-50',
  },
  {
    name: 'استراتژی کاورد کال',
    description: 'بازدهی استراتژی‌های خود را بسنجید و سهام درگیر به عنوان ضمانت را به سادگی مدیریت کنید.',
    icon: ShieldCheck,
    color: 'text-green-500',
    bgColor: 'bg-green-50',
  },
  {
    name: 'تحلیل اختیار معامله',
    description: 'پوزیشن‌های خرید و فروش خود را به صورت تجمیع شده (Net Position) و با قیمت سر به سر دقیق تحلیل کنید.',
    icon: Layers,
    color: 'text-purple-500',
    bgColor: 'bg-purple-50',
  },
  {
    name: 'مدیریت جامع دارایی‌ها',
    description: 'عملکرد صندوق‌های سرمایه‌گذاری طلا، سهامی و درآمد ثابت خود را در کنار سایر دارایی‌ها مقایسه کنید.',
    icon: Package,
    color: 'text-amber-500',
    bgColor: 'bg-amber-50',
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: 'easeOut' } },
}

export default function FeaturesSection() {
  return (
    <div id="features" className="bg-white py-24 sm:py-32 scroll-mt-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          className="mx-auto max-w-2xl lg:text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <h2 className="text-base font-semibold leading-7 text-primary-600">یکپارچه و قدرتمند</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            تمام آنچه برای مدیریت سبد خود نیاز دارید
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            رهبرد ۳۶۰ با ارائه ابزارهای تحلیلی دقیق و داشبوردی یکپارچه، پیچیدگی‌های مدیریت سرمایه را از بین می‌برد.
          </p>
        </motion.div>
        <motion.div
          className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <dl className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {features.map((feature) => (
              <motion.div
                key={feature.name}
                variants={itemVariants}
                className="flex items-start gap-x-6 rounded-2xl bg-gray-50 p-6 shadow-sm ring-1 ring-gray-900/5 hover:shadow-lg transition-shadow"
              >
                <div className={`flex h-12 w-12 flex-none items-center justify-center rounded-lg ${feature.bgColor}`}>
                  <feature.icon className={`h-8 w-8 ${feature.color}`} aria-hidden="true" />
                </div>
                <div>
                  <dt className="text-lg font-semibold text-gray-900">{feature.name}</dt>
                  <dd className="mt-1 text-base leading-7 text-gray-600">{feature.description}</dd>
                </div>
              </motion.div>
            ))}
          </dl>
        </motion.div>
      </div>
    </div>
  )
}