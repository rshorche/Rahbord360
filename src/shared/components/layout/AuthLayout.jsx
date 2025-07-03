import { Outlet, Navigate } from "react-router-dom";
import useSession from "../../../features/auth/hooks/useSession";

export default function AuthLayout() {
  const { session, sessionLoading } = useSession();

  if (sessionLoading) {
    return <div>Loading...</div>;
  }

  if (session) {
    // اگر کاربر لاگین کرده بود، او را به داشبورد بفرست
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-content-100">
      <main className="w-full max-w-md mx-auto p-6">
        <Outlet />
      </main>
    </div>
  );
}