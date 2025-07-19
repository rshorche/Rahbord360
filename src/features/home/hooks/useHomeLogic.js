import { useState, useEffect } from "react";
import useAuthStore from "../../auth/store/useAuthStore";

export const useHomeLogic = () => {
  const { session } = useAuthStore();
  const [isScrolled, setIsScrolled] = useState(false);

  const userEmailName = session?.user?.email?.split('@')[0];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return {
    session,
    userEmailName,
    isScrolled,
  };
};