import { Link } from "react-router-dom"; 
export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-100px)] text-center p-4">
      <h1 className="text-6xl font-bold text-danger-600">404</h1>
      <p className="text-2xl font-semibold text-content-800 mt-4">
        صفحه پیدا نشد!
      </p>
      <p className="text-content-600 mt-2">
        متاسفانه صفحه‌ای که دنبال آن بودید، وجود ندارد.
      </p>
      <Link to="/" className="mt-6 text-primary-600 hover:underline">
        بازگشت به صفحه اصلی
      </Link>
    </div>
  );
}
