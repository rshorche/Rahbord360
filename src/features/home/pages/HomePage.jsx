import { Link } from "react-router-dom"; 

export default function HomePage() {
  return (
    <div className="p-4 sm:p-6 text-center">
      <h1 className="text-3xl font-bold text-content-800">
        به راهبرد 360 خوش آمدید!
      </h1>
      <p className="mt-4 text-lg text-content-700">
        ابزاری قدرتمند برای مدیریت و تحلیل معاملات بورسی شما.
      </p>
      <Link
        to="/dashboard" 
        className="mt-6 inline-block bg-primary-500 hover:bg-primary-600 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300">
        ورود به داشبورد
      </Link>
    </div>
  );
}
