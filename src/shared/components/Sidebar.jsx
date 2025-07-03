import React from "react";
import { NavLink, Link } from "react-router-dom";
import { X, ChevronRight, ChevronLeft, LogOut } from "lucide-react"; // LogOut اینجا اضافه شده
import { cn } from "../utils/cn";
import logoIcon from "../../../public/images/logo.webp";
import useAuthStore from "../../features/auth/store/useAuthStore"; // این خط import اصلی است که باید اضافه شود

export default function Sidebar({
  isOpen,
  closeSidebar,
  navLinks,
  brandName,
  isCollapsed,
  toggleCollapsed,
  onTransitionEnd,
}) {
  const { logOut } = useAuthStore(); // این خط از قبل باید اضافه شده باشد

  const handleAsideTransitionEnd = (e) => {
    if (e.propertyName === "transform" && !isOpen && onTransitionEnd) {
      onTransitionEnd();
    }
  };

  return (
    <aside
      className={cn(
        "fixed inset-y-0 right-0 z-50 bg-white shadow-xl transform overflow-hidden",
        isOpen ? "translate-x-0" : "translate-x-full",
        "lg:relative lg:translate-x-0 lg:flex lg:flex-col",
        "transition-all duration-300 ease-in-out",
        "w-64 max-w-full sm:max-w-64 min-w-16",
        isCollapsed ? "lg:w-20" : "lg:w-64"
      )}
      onTransitionEnd={handleAsideTransitionEnd}
    >
      <div className="flex items-center justify-between px-4 h-16 border-b border-gray-200 relative">
        {!isCollapsed ? (
          <Link
            to="/"
            className="flex items-center text-xl font-bold text-gray-800 whitespace-nowrap h-full"
          >
            {brandName}
          </Link>
        ) : (
          <Link to="/" className="w-12 h-12 flex items-center justify-center">
            <img
              src={logoIcon}
              alt="Logo"
              className="w-full h-full object-contain"
            />
          </Link>
        )}
        <button
          onClick={closeSidebar}
          className="lg:hidden p-2 rounded-full text-gray-500 hover:bg-gray-100 absolute left-4 top-1/2 -translate-y-1/2"
          aria-label="بستن سایدبار"
        >
          <X size={24} />
        </button>
      </div>

      <nav className="flex-grow p-4">
        <ul>
          {navLinks.map((link) => (
            <li key={link.to} className="mb-2">
              <NavLink
                to={link.to}
                end={link.end}
                onClick={closeSidebar}
                className={({ isActive }) =>
                  cn(
                    "flex items-center p-3 rounded-lg text-gray-700 hover:bg-blue-100 hover:text-blue-700 w-full",
                    isActive
                      ? "bg-primary-500 text-white hover:bg-primary-600 hover:text-white"
                      : "",
                    isCollapsed
                      ? "flex-col justify-center items-center gap-y-1"
                      : ""
                  )
                }
              >
                {link.icon && (
                  <span className={cn(isCollapsed ? "" : "ml-3")}>
                    {React.cloneElement(link.icon, {
                      size: isCollapsed ? 20 : 24,
                    })}
                  </span>
                )}
                <span
                  className={cn(
                    "font-medium whitespace-nowrap",
                    isCollapsed ? "opacity-0 delay-0" : "opacity-100 delay-150",
                    "transition-opacity duration-200 ease-in-out",
                    isCollapsed && "sr-only",
                    isCollapsed && "hidden"
                  )}
                >
                  {link.label}
                </span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* بخش خروج */}
      <div className="p-4 mt-auto">
        <button
          onClick={logOut}
          className="flex items-center p-3 rounded-lg text-content-600 hover:bg-danger-100 hover:text-danger-700 w-full"
        >
          <LogOut size={24} className={cn(isCollapsed ? "" : "ml-3")} />
          <span
             className={cn(
              "font-medium whitespace-nowrap",
              isCollapsed ? "opacity-0 delay-0" : "opacity-100 delay-150",
              "transition-opacity duration-200 ease-in-out",
              isCollapsed && "sr-only",
              isCollapsed && "hidden"
            )}
          >
            خروج
          </span>
        </button>
      </div>

      <div className="p-4 border-t border-gray-200 hidden lg:flex justify-end">
        <button
          onClick={toggleCollapsed}
          className="p-2 rounded-full text-white bg-primary-500 hover:bg-primary-600 focus:outline-none"
          aria-label={isCollapsed ? "باز کردن سایدبار" : "جمع کردن سایدبار"}
        >
          {isCollapsed ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
      </div>
    </aside>
  );
}