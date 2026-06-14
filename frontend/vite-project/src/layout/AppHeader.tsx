import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { useSidebar } from "../context/SidebarContext";
import { ThemeToggleButton } from "../components/common/ThemeToggleButton";
import NotificationDropdown from "../components/header/NotificationDropdown";
import UserDropdown from "../components/header/UserDropdown";
import logoObraIntegrada from "../assets/logo-obra-integrada.png";

const AppHeader: React.FC = () => {
  const { toggleSidebar, toggleMobileSidebar, isExpanded, isMobileOpen } = useSidebar();
  const isMenuOpen = isExpanded || isMobileOpen;

  const handleToggle = () => {
    if (window.innerWidth >= 1024) {
      toggleSidebar();
    } else {
      toggleMobileSidebar();
    }
  };

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <header className="sticky top-0 flex w-full bg-white dark:bg-gray-950 border-b border-slate-200 dark:border-transparent z-40 transition-colors duration-200 ease-in-out">
      <div className="flex flex-col items-center justify-between grow lg:flex-row lg:px-6">
        <div className="flex items-center justify-between w-full gap-2 px-3 py-3 sm:gap-4 lg:justify-normal lg:px-0 lg:py-4">
          <button
            className="relative flex items-center justify-center w-10 h-10 text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all duration-300 active:scale-95"
            onClick={handleToggle}
            aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}
          >
            {/* Hamburger Icon */}
            <svg 
              className={`w-6 h-6 absolute transition-all duration-300 transform ${
                isMenuOpen ? "opacity-0 rotate-90 scale-50" : "opacity-100 rotate-0 scale-100"
              }`} 
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>

            {/* Close Icon (X) */}
            <svg 
              className={`w-6 h-6 absolute transition-all duration-300 transform ${
                isMenuOpen ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-50 pointer-events-none"
              }`} 
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <Link to="/" className="lg:hidden">
            <img src={logoObraIntegrada} alt="Logo" className="w-8 h-8 object-contain" />
          </Link>

          <div className="hidden lg:block ml-4">
            <form onSubmit={(e) => e.preventDefault()}>
              <div className="relative group">
                <span className="absolute -translate-y-1/2 left-4 top-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
                </span>
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Pesquisar..."
                  className="h-10 w-60 rounded-xl border-transparent bg-slate-100 dark:bg-gray-900 py-2 pl-12 pr-10 text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-gray-950 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                />
              </div>
            </form>
          </div>
        </div>

        <div className="flex items-center justify-end w-full gap-2 px-3 py-3 sm:gap-4 lg:w-auto lg:px-0 lg:py-4">
          <div className="flex items-center gap-1 sm:gap-2 p-1 bg-slate-100/50 dark:bg-gray-900 rounded-xl transition-colors duration-200">
            <ThemeToggleButton />
            <div className="w-px h-4 bg-slate-200 dark:bg-gray-800 mx-1"></div>
            <NotificationDropdown />
            <UserDropdown />
          </div>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
