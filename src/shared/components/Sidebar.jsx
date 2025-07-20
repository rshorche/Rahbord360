import React from "react";
import { NavLink, Link } from "react-router-dom";
import { X, LogOut, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../utils/cn";
import useAuthStore from "../../features/auth/store/useAuthStore";
import Button from "./ui/Button";

export default function Sidebar({
  isOpen,
  closeSidebar,
  navLinks,
  brandName,
  isCollapsed,
  toggleCollapsed,
}) {
  const { logOut } = useAuthStore();

  return (
    <aside
      className={cn(
        "fixed inset-y-0 right-0 z-50 bg-white shadow-xl transform",
        "flex flex-col",
        "transition-all duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "translate-x-full",
        "md:sticky md:top-0 md:h-screen md:translate-x-0",
        // --- YOUR CORRECTED CODE ---
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      <div className="flex items-center justify-between px-4 h-16 border-b border-gray-200 flex-shrink-0">
        <Link to="/dashboard" className={cn("transition-opacity duration-200", isCollapsed ? "opacity-0" : "opacity-100")}>
            <span className="text-xl font-bold text-gray-800 whitespace-nowrap">{brandName}</span>
        </Link>
        <button
          onClick={closeSidebar}
          className="md:hidden p-2 rounded-full text-gray-500 hover:bg-gray-100"
        >
          <X size={24} />
        </button>
      </div>

      <nav className="flex-grow p-2 overflow-y-auto">
        <ul>
          {navLinks.map((link) => (
            <li key={link.to} className="mb-2">
              <NavLink
                to={link.to}
                end={link.end}
                onClick={closeSidebar}
                className={({ isActive }) =>
                  cn(
                    "flex items-center p-3 rounded-lg text-content-600 hover:bg-primary-100/50 w-full transition-colors",
                    isActive && "bg-gradient-to-r from-primary-400 to-primary-500 text-white shadow-md",
                    isCollapsed ? "justify-center" : ""
                  )
                }
                title={isCollapsed ? link.label : ""}
              >
                {link.icon && <span className={!isCollapsed ? "ml-3" : ""}>{link.icon}</span>}
                <span className={cn("whitespace-nowrap transition-all duration-200", isCollapsed ? "sr-only opacity-0" : "opacity-100")}>
                  {link.label}
                </span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-2 mt-auto flex-shrink-0">
        <button
          onClick={logOut}
          className={cn(
            "flex items-center p-3 rounded-lg text-content-600 hover:bg-danger-100 hover:text-danger-700 w-full transition-colors",
            isCollapsed ? "justify-center" : ""
          )}
          title={isCollapsed ? "خروج" : ""}
        >
          <LogOut size={24} className={!isCollapsed ? "ml-3" : ""} />
          <span className={cn("font-medium whitespace-nowrap", isCollapsed ? "sr-only" : "")}>خروج</span>
        </button>
      </div>

      <div className="p-4 border-t border-gray-200 hidden md:flex justify-end flex-shrink-0">
        <Button
          variant="outline"
          size="icon"
          onClick={toggleCollapsed}
          className="h-9 w-9"
          title={isCollapsed ? "باز کردن سایدبار" : "جمع کردن سایدبار"}
        >
          {isCollapsed ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </Button>
      </div>
    </aside>
  );
}