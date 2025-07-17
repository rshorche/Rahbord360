import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-content-50 text-center p-4">
      <div className="max-w-md w-full">
        <svg
          className="w-full h-auto"
          viewBox="0 0 150 70"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M 10 60 L 30 40 L 45 50 L 60 30 L 75 45 L 90 20"
            stroke="#22c55e"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="path-animation"
          />
          <path
            d="M 90 20 Q 95 10, 100 20 T 110 20"
            stroke="#ef4444"
            strokeWidth="2"
            fill="none"
            strokeDasharray="3 3"
            className="path-animation-fall"
          />
          <path
            d="M 110 20 L 115 60"
            stroke="#ef4444"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            className="path-animation-fall"
          />
          <circle
            cx="115"
            cy="65"
            r="2"
            fill="#ef4444"
            className="path-animation-fall"
          />
          <style>
            {`
              .path-animation {
                stroke-dasharray: 200;
                stroke-dashoffset: 200;
                animation: draw 2s ease-in-out forwards;
              }
              .path-animation-fall {
                opacity: 0;
                animation: fall 1s ease-in forwards 1.5s;
              }
              @keyframes draw {
                to {
                  stroke-dashoffset: 0;
                }
              }
              @keyframes fall {
                to {
                  opacity: 1;
                }
              }
            `}
          </style>
        </svg>

        <h1 className="mt-8 text-6xl font-bold text-primary-600">۴۰۴</h1>
        <p className="mt-4 text-2xl font-semibold text-content-800">
          صفحه پیدا نشد!
        </p>
        <p className="mt-2 text-content-600">
          متاسفانه صفحه‌ای که به دنبال آن بودید، شاید در نوسانات بازار گم شده
          است.
        </p>
        <Link to="/dashboard">
          <button className="mt-8 inline-flex items-center justify-center px-6 py-3 font-medium text-white bg-primary-600 rounded-lg shadow-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all">
            <ArrowLeft className="ml-2" size={20} />
            بازگشت به داشبورد
          </button>
        </Link>
      </div>
    </div>
  );
}