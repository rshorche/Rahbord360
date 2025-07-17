import { createBrowserRouter, RouterProvider } from "react-router-dom";
import DashboardLayout from "../shared/components/layout/DashboardLayout";
import TransactionsPage from "../features/transactions/pages/TransactionsPage";
import PortfolioPage from "../features/portfolio/pages/PortfolioPage";
import CoveredCallPage from "../features/covered-call/pages/CoveredCallPage";
import OptionsPage from "../features/options/pages/OptionsPage";
import FundsPage from "../features/funds/pages/FundsPage";
import AuthLayout from "../shared/components/layout/AuthLayout";
import LoginPage from "../features/auth/pages/LoginPage";
import SignupPage from "../features/auth/pages/SignupPage";
import ForgotPasswordPage from "../features/auth/pages/ForgotPasswordPage";
import UpdatePasswordPage from "../features/auth/pages/UpdatePasswordPage";
import ProtectedRoute from "../shared/components/auth/ProtectedRoute";
import DashboardOverviewPage from "../features/dashboard/pages/DashboardOverviewPage";
import HomePage from "../features/home/pages/HomePage";
import NotFoundPage from "../shared/pages/NotFoundPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
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
      { path: "options", element: <OptionsPage /> },
      { path: "funds", element: <FundsPage /> },
    ],
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);

export default function AppRoutes() {
  return <RouterProvider router={router} />;
}