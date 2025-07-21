import { useState, useCallback, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Menu, Home, BarChart2, Briefcase, ShieldCheck, Zap, Gem } from "lucide-react";
import { cn } from "../../utils/cn";
import Sidebar from "../Sidebar";

export default function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const openSidebar = useCallback(() => setIsSidebarOpen(true), []);
  const closeSidebar = useCallback(() => {
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  }, []);
  const toggleCollapsed = useCallback(() => setIsCollapsed((prev) => !prev),[]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
        setIsCollapsed(false); // --- THIS LINE FIXES THE BUG ---
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
    { to: "/dashboard/funds", label: "صندوق‌ها", icon: <Gem size={24} /> },
  ];

  return (
    <div className="relative min-h-screen bg-gray-100">
      <div className="relative mx-auto flex max-w-[90rem]">
        <Sidebar
          isOpen={isSidebarOpen}
          closeSidebar={closeSidebar}
          navLinks={navigationLinks}
          isCollapsed={isCollapsed}
          toggleCollapsed={toggleCollapsed}
        />
        <main className={cn("flex-1 transition-all duration-300 ease-in-out p-4 sm:p-6")}>
          <Outlet />
        </main>
      </div>

      <button
        onClick={openSidebar}
        className={cn(
          "fixed top-4 right-4 z-40 p-2 bg-white/90 backdrop-blur-sm rounded-full",
          "text-gray-700 hover:bg-gray-200 shadow-lg md:hidden",
          { "hidden": isSidebarOpen }
        )}
        aria-label="باز کردن سایدبار"
      >
        <Menu size={24} />
      </button>
      {isSidebarOpen && window.innerWidth < 768 && (
        <div
          onClick={closeSidebar}
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm md:hidden"
          aria-hidden="true"
        ></div>
      )}
    </div>
  );
}