import { Link, useNavigate } from "react-router-dom";
import AuthForm from "../components/AuthForm";
import useAuthStore from "../store/useAuthStore";

export default function SignupPage() {
  const { signUp, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleSignup = async (data) => {
    const success = await signUp(data);
    if (success) {
      navigate("/auth/login");
    }
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl w-full">
      <h2 className="text-2xl font-bold text-center text-content-800 mb-6">
        ایجاد حساب کاربری جدید
      </h2>
      <AuthForm onSubmit={handleSignup} isSignup={true} isLoading={isLoading} />
      <p className="text-center text-sm text-content-600 mt-6">
        قبلاً ثبت نام کرده‌اید؟{" "}
        <Link to="/auth/login" className="font-medium text-primary-600 hover:underline">
          وارد شوید
        </Link>
      </p>
    </div>
  );
}