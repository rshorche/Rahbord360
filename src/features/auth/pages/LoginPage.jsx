import { Link, useNavigate } from "react-router-dom";
import AuthForm from "../components/AuthForm";
import useAuthStore from "../store/useAuthStore";

export default function LoginPage() {
  const { logIn, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleLogin = async (data) => {
    const success = await logIn(data);
    if (success) {
      navigate("/dashboard");
    }
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl w-full">
      <h2 className="text-2xl font-bold text-center text-content-800 mb-6">
        ورود به حساب کاربری
      </h2>
      <AuthForm onSubmit={handleLogin} isLoading={isLoading} />
      <div className="text-sm text-center mt-4">
        <Link
          to="/auth/forgot-password"
          className="font-medium text-content-500 hover:text-primary-600"
        >
          فراموشی رمز عبور؟
        </Link>
      </div>
      <p className="text-center text-sm text-content-600 mt-6">
        حساب کاربری ندارید؟{" "}
        <Link to="/auth/signup" className="font-medium text-primary-600 hover:underline">
          ثبت نام کنید
        </Link>
      </p>
    </div>
  );
}