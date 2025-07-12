import { useState, useCallback, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Menu, Home, BarChart2, Briefcase, ShieldCheck, Zap, Gem } from "lucide-react"; // <-- Gem اضافه شد
import { cn } from "../../utils/cn";
import Sidebar from "../Sidebar";
import useAllSymbolsStore from "../../store/useAllSymbolsStore";
import usePriceHistoryStore from "../../store/usePriceHistoryStore";
import useStockTradesStore from "../../../features/portfolio/store/useStockTradesStore";
import useTransactionStore from "../../../features/transactions/store/useTransactionStore";
import useCoveredCallStore from "../../../features/covered-call/store/useCoveredCallStore";
import useOptionsStore from "../../../features/options/store/useOptionsStore";
import useFundTradesStore from "../../../features/funds/store/useFundTradesStore"; // <-- اضافه شد

export default function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // ... (کالکشن تمام fetch ها)
  const { fetchAllSymbolsForSearch } = useAllSymbolsStore();
  const { fetchAllSymbolsFromDB } = usePriceHistoryStore();
  const { fetchActions } = useStockTradesStore();
  const { fetchTransactions } = useTransactionStore();
  const { fetchPositions: fetchCoveredCallPositions } = useCoveredCallStore();
  const { fetchPositions: fetchOptionsPositions } = useOptionsStore();
  const { fetchTrades: fetchFundTrades } = useFundTradesStore(); // <-- اضافه شد

  useEffect(() => {
    fetchAllSymbolsForSearch();
    fetchAllSymbolsFromDB();
    fetchActions();
    fetchTransactions();
    fetchCoveredCallPositions();
    fetchOptionsPositions();
    fetchFundTrades(); // <-- اضافه شد
  }, [fetchAllSymbolsForSearch, fetchAllSymbolsFromDB, fetchActions, fetchTransactions, fetchCoveredCallPositions, fetchOptionsPositions, fetchFundTrades]);


  const openSidebar = useCallback(() => setIsSidebarOpen(true), []);
  const closeSidebar = useCallback(() => {
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  }, []);
  const toggleCollapsed = useCallback(() => setIsCollapsed((prev) => !prev),[]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
        setIsCollapsed(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const navigationLinks = [
    { to: "/dashboard", label: "خلاصه داشبورد", icon: <Home size={24} />, end: true },
    { to: "/dashboard/transactions", label: "تراکنش‌ها", icon: <BarChart2 size={24} /> },
    { to: "/dashboard/portfolio", label: "پورتفولیو", icon: <Briefcase size={24} /> },
    { to: "/dashboard/covered-calls", label: "کاورد کال", icon: <ShieldCheck size={24} /> },
    { to: "/dashboard/options", label: "اختیار معامله", icon: <Zap size={24} /> },
    { to: "/dashboard/funds", label: "صندوق‌ها", icon: <Gem size={24} /> }, // <-- اضافه شد
  ];

  return (
    <div className={cn("relative min-h-screen bg-gray-100 flex", "lg:flex-row")}>
      <Sidebar
        isOpen={isSidebarOpen}
        closeSidebar={closeSidebar}
        navLinks={navigationLinks}
        brandName="راهبرد ۳۶۰"
        isCollapsed={isCollapsed}
        toggleCollapsed={toggleCollapsed}
      />
      <main className={cn("flex-1 transition-all duration-300 ease-in-out p-4 sm:p-6")}>
        <Outlet />
      </main>
      <button
        onClick={openSidebar}
        className={cn(
          "fixed top-4 right-4 z-40 p-2 bg-white/90 backdrop-blur-sm rounded-full",
          "text-gray-700 hover:bg-gray-200 shadow-lg lg:hidden",
          { "hidden": isSidebarOpen }
        )}
        aria-label="باز کردن سایدبار"
      >
        <Menu size={24} />
      </button>
      {isSidebarOpen && window.innerWidth < 1024 && (
        <div
          onClick={closeSidebar}
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm lg:hidden"
          aria-hidden="true"
        ></div>
      )}
    </div>
  );
}