import { useNavigate } from "react-router-dom";
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
    </div>
  );
}