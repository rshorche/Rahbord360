import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Zap } from "lucide-react";
import useAuthStore from "../../auth/store/useAuthStore";
import { cn } from "../../../shared/utils/cn"; 

export default function Header() {
  const { session } = useAuthStore();
  const userEmailName = session?.user?.email?.split('@')[0];
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <header className={cn("fixed inset-x-0 top-0 z-50 transition-all duration-300", isScrolled ? "bg-white/80 backdrop-blur-lg shadow-sm" : "")}>
      <nav className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8" aria-label="Global">
        <div className="flex lg:flex-1">
          <Link to="/" className="-m-1.5 p-1.5 flex items-center">
            <Zap className="h-8 w-auto text-primary-600" />
            <span className="ml-2 font-bold text-xl text-content-800">رهبرد ۳۶۰</span>
          </Link>
        </div>
        <div className="flex lg:flex-1 justify-end">
          {session ? (
            <Link to="/dashboard" className="rounded-md bg-primary-50 px-3.5 py-2.5 text-sm font-semibold text-primary-600 shadow-sm hover:bg-primary-100 transition-all">
              {userEmailName}
            </Link>
          ) : (
            <Link to="/auth/login" className="text-sm font-semibold leading-6 text-content-900 hover:text-primary-600 transition-colors">
              ورود <span aria-hidden="true">&rarr;</span>
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}