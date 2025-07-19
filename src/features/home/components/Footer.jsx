import { Send } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-content-100 border-t border-content-200">
      <div className="mx-auto max-w-7xl px-6 py-12 md:flex md:items-center md:justify-between lg:px-8">
        <div className="flex justify-center space-x-6 md:order-2">
            <a href="https://t.me/rshorche" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary-600 transition-colors">
                <span className="sr-only">Telegram</span>
                <Send className="h-6 w-6" />
            </a>
        </div>
        <div className="mt-8 md:order-1 md:mt-0">
          <p className="text-center text-xs leading-5 text-gray-500">
            &copy; ۲۰۲۴ رهبرد ۳۶۰ | طراحی و توسعه توسط{" "}
            <a href="https://t.me/rshorche" target="_blank" rel="noopener noreferrer" className="font-semibold text-primary-600 hover:underline">
              رضا شورچه
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}