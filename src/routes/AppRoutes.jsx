import { createBrowserRouter, RouterProvider } from "react-router-dom";
import DashboardLayout from "../shared/components/layout/DashboardLayout";
import TransactionsPage from "../features/transactions/pages/TransactionsPage";
import PortfolioPage from "../features/portfolio/pages/PortfolioPage";
import CoveredCallPage from "../features/covered-call/pages/CoveredCallPage";
import OptionsPage from "../features/options/pages/OptionsPage";
import FundsPage from "../features/funds/pages/FundsPage"; // <-- اضافه شد
import AuthLayout from "../shared/components/layout/AuthLayout";
import LoginPage from "../features/auth/pages/LoginPage";
import ProtectedRoute from "../shared/components/auth/ProtectedRoute";
import DashboardOverviewPage from "../features/dashboard/pages/DashboardOverviewPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <LoginPage />,
  },
  {
    path: "auth", 
    element: <AuthLayout />,
    children: [
      { path: "login", element: <LoginPage /> },
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
      { path: "funds", element: <FundsPage /> }, // <-- اضافه شد
    ],
  },
]);

export default function AppRoutes() {
  return <RouterProvider router={router} />;
}