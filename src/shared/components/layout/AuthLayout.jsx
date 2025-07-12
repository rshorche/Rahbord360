import { Outlet, Navigate } from "react-router-dom";
import useAuthStore from "../../../features/auth/store/useAuthStore";
import LoadingSpinner from "../ui/LoadingSpinner";

export default function AuthLayout() {
  const { session, sessionLoading } = useAuthStore();

  if (sessionLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-content-100">
        <LoadingSpinner />
      </div>
    );
  }

  if (session) {
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