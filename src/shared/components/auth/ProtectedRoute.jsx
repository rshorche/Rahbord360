import { Navigate } from "react-router-dom";
import useAuthStore from "../../../features/auth/store/useAuthStore";
import LoadingSpinner from "../ui/LoadingSpinner";

export default function ProtectedRoute({ children }) {
  // Read session state DIRECTLY from the central store
  const { session, sessionLoading } = useAuthStore();

  if (sessionLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner text="در حال بررسی وضعیت ورود..." />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/auth/login" replace />;
  }

  return children;
}