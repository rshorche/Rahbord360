import { createBrowserRouter, RouterProvider } from "react-router-dom";
import MainLayout from "../shared/components/layout/MainLayout";
import DashboardLayout from "../shared/components/layout/DashboardLayout";
import HomePage from "../features/home/pages/HomePage";
import NotFoundPage from "../shared/pages/NotFoundPage";
import TransactionsPage from "../features/transactions/pages/TransactionsPage";
import DashboardOverviewPage from "../features/dashboard/pages/DashboardOverviewPage";
import PortfolioPage from "../features/portfolio/pages/PortfolioPage";
import AuthLayout from "../shared/components/layout/AuthLayout";
import LoginPage from "../features/auth/pages/LoginPage";
import SignupPage from "../features/auth/pages/ SignupPage";
import ForgotPasswordPage from "../features/auth/pages/ ForgotPasswordPage";
import UpdatePasswordPage from "../features/auth/pages/UpdatePasswordPage";
import ProtectedRoute from "../shared/components/auth/ProtectedRoute";
import CoveredCallPage from "../features/covered-call/pages/CoveredCallPage";

const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      { path: "/", element: <HomePage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
    {
    path: "auth", 
    element: <AuthLayout />,
    children: [
      { path: "login", element: <LoginPage /> },
      { path: "signup", element: <SignupPage /> },
            { path: "forgot-password", element: <ForgotPasswordPage /> },
                  { path: "update-password", element: <UpdatePasswordPage /> },
    ],
  },

  {
    path: "dashboard",
    element:  (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <DashboardOverviewPage /> },
      { path: "transactions", element: <TransactionsPage /> },
      { path: "portfolio", element: <PortfolioPage /> },
      { path: "covered-calls", element: <CoveredCallPage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);

export default function AppRoutes() {
  return <RouterProvider router={router} />;
}
