import { createBrowserRouter, RouterProvider } from "react-router-dom";
import MainLayout from "../shared/components/layout/MainLayout";
import DashboardLayout from "../shared/components/layout/DashboardLayout";
import HomePage from "../features/home/pages/HomePage";
import NotFoundPage from "../shared/pages/NotFoundPage";
import TransactionsPage from "../features/transactions/pages/TransactionsPage";
import DashboardOverviewPage from "../features/dashboard/pages/DashboardOverviewPage";
import PortfolioPage from "../features/portfolio/pages/PortfolioPage";

const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      { path: "/", element: <HomePage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
  {
    path: "dashboard",
    element: <DashboardLayout />,
    children: [
      { index: true, element: <DashboardOverviewPage /> },
      { path: "transactions", element: <TransactionsPage /> },
      { path: "portfolio", element: <PortfolioPage /> },

      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);

export default function AppRoutes() {
  return <RouterProvider router={router} />;
}
