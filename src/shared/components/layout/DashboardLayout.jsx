import { useState, useEffect, useCallback } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Menu, Home, BarChart2 } from "lucide-react";
import { cn } from "../../utils/cn";
import Sidebar from "../Sidebar";

export default function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const location = useLocation();

  const openSidebar = useCallback(() => {
    setIsSidebarOpen(true);
  }, []);

  const closeSidebar = useCallback(() => {
    setIsSidebarOpen(false);
    setIsCollapsed(false);
  }, []);

  const toggleCollapsed = useCallback(
    () => setIsCollapsed((prev) => !prev),
    []
  );

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
        setIsCollapsed(false);
      }
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    if (window.innerWidth < 1024) {
      setTimeout(() => closeSidebar(), 50);
    }

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [location.pathname, closeSidebar]);

  const navigationLinks = [
    {
      to: "/dashboard",
      label: "خلاصه داشبورد",
      icon: <Home size={24} />,
      end: true,
    },
    {
      to: "/dashboard/transactions",
      label: "تراکنش‌ها",
      icon: <BarChart2 size={24} />,
      end: true,
    },
  ];

  return (
    <div
      className={cn(
        "relative min-h-screen bg-gray-100 flex flex-col",
        "lg:flex-row overflow-hidden"
      )}>
      <Sidebar
        isOpen={isSidebarOpen}
        closeSidebar={closeSidebar}
        navLinks={navigationLinks}
        brandName="راهبورد 360"
        isCollapsed={isCollapsed}
        toggleCollapsed={toggleCollapsed}
      />

      <main
        className={cn(
          "flex-1 transition-all duration-300 ease-in-out",
          "pt-4 sm:pt-6 lg:pt-6",
          "px-4 sm:px-6 pb-6"
        )}>
        <Outlet />
      </main>

      {!isSidebarOpen && window.innerWidth < 1024 && (
        <button
          onClick={openSidebar}
          className={cn(
            "fixed top-4 right-4 z-40 p-2 bg-white/90 backdrop-blur-sm rounded-full",
            "text-gray-700 hover:bg-gray-200 focus:outline-none focus:bg-gray-200 shadow-lg",
            "transition-all lg:hidden"
          )}
          aria-label="باز کردن سایدبار">
          <Menu size={24} />
        </button>
      )}

      {isSidebarOpen && window.innerWidth < 1024 && (
        <div
          onClick={closeSidebar}
          className={cn(
            "fixed inset-0 z-20 bg-black/40 backdrop-blur-xs lg:hidden"
          )}
          aria-hidden="true"></div>
      )}
    </div>
  );
}
