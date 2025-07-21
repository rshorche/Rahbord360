import { useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import AuthForm from "../components/AuthForm";
import useAuthStore from "../store/useAuthStore";
import { showSuccessToast } from "../../../shared/utils/notifications";

export default function LoginPage() {
  const { logIn, isLoading } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.message) {
      showSuccessToast(location.state.message);
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, navigate, location.pathname]);

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
      <div className="text-center text-sm text-content-600 mt-6 space-y-2">
        <p>
          حساب کاربری ندارید؟
          <Link to="/auth/signup" className="font-medium text-primary-600 hover:underline">
            ثبت نام کنید
          </Link>
        </p>
        <p>
          <Link to="/auth/forgot-password" className="font-medium text-sm text-content-500 hover:underline">
            رمز عبور خود را فراموش کرده‌اید؟
          </Link>
        </p>
      </div>
    </div>
  );
}