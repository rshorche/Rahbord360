import { Send  } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gray-900">
      <div className="mx-auto max-w-7xl px-6 py-12 md:flex md:items-center md:justify-between lg:px-8">
          <div className="mt-8 flex justify-center space-x-6 space-x-reverse md:order-last md:mt-0">
          <a href="https://t.me/rshorche" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
            <span className="sr-only">Telegram</span>
            <Send className="h-6 w-6" />
          </a>
        </div>
        <div className="mt-8 md:mt-0">
          <p className="text-center text-xs leading-5 text-gray-400">
            &copy;  ۲۰۲۴ | طراحی و توسعه توسط 
            <a href="https://t.me/rshorche" target="_blank" rel="noopener noreferrer" className="font-semibold text-primary-400 hover:underline">
                ...رضا شورچه 
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}