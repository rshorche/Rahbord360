import { Navigate } from "react-router-dom";
import useSession from "../../../features/auth/hooks/useSession";

export default function ProtectedRoute({ children }) {
  const { session, sessionLoading } = useSession();

  if (sessionLoading) {
    // در حین بارگذاری وضعیت کاربر، می‌توان یک اسپینر یا صفحه لودینگ نمایش داد
    return <div>Loading...</div>;
  }

  if (!session) {
    // اگر کاربر لاگین نکرده باشد، به صفحه ورود هدایت می‌شود
    return <Navigate to="/auth/login" replace />;
  }

  // اگر کاربر لاگین کرده باشد، محتوای اصلی نمایش داده می‌شود
  return children;
}