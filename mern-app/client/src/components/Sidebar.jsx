import { Link, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';
import { useSidebar } from '../contexts/SidebarContext';
import { useTheme } from '../contexts/ThemeContext';
import { useState, useEffect } from 'react';

export default function Sidebar() {
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { sidebar } = useSelector((state) => state.settings);
  const { isCollapsed, setIsCollapsed } = useSidebar();
  const { theme, toggleTheme, isDark } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile screen
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    dispatch(logout());
    window.location.href = '/login';
  };

  // Filter and sort links based on settings
  const publicLinks = Object.entries(sidebar)
    .filter(([_, config]) => config.visible && config.type === 'public')
    .map(([path, config]) => ({ path, ...config }));

  const privateLinks = Object.entries(sidebar)
    .filter(([_, config]) => config.visible && config.type === 'private')
    .map(([path, config]) => ({ path, ...config }));

  const isAdmin = user?.role === 'admin' || user?.role === 'super-admin';
  const visiblePrivateLinks = isAdmin ? privateLinks : [];

  const getLinkClass = (active) => {
    const baseClass = "nav-btn w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden";
    return active
      ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/30"
      : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:shadow-sm";
  };


  const renderLink = (link, index) => {
    return (
      <Link
        key={link.path}
        to={link.path}
        className={getLinkClass(isActive(link.path))}
        title={isCollapsed && !isMobile ? link.label : ''}
      >
      {/* Icon Container - Fixed width for perfect alignment */}
      <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
        <i className={`${link.icon || 'fas fa-circle'} text-base ${isActive(link.path) ? 'text-white' : 'text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400'} transition-colors`}></i>
      </div>
      
      {/* Label - Hidden when collapsed on desktop */}
      {(!isCollapsed || isMobile) && (
        <>
          <span className="flex-1 text-[13px] font-medium text-left truncate leading-6">
            {link.label}
          </span>
          
          {/* Active Indicator */}
          {isActive(link.path) && (
            <div className="w-1.5 h-6 bg-white rounded-full shadow-md flex-shrink-0"></div>
          )}
        </>
      )}
      
      {/* Tooltip for collapsed state */}
      {isCollapsed && !isMobile && (
        <div className="absolute left-full ml-3 px-3 py-2 bg-gray-900 dark:bg-gray-700 text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap z-50 shadow-lg">
          {link.label}
          <div className="absolute right-full top-1/2 -translate-y-1/2 border-[5px] border-transparent border-r-gray-900 dark:border-r-gray-700"></div>
        </div>
      )}
    </Link>
  );
};


  return (
    <>
      {/* Mobile Menu Button */}
      {isMobile && (
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="fixed top-4 left-4 z-50 lg:hidden p-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all"
          aria-label="Toggle menu"
        >
          <i className={`fas ${isMobileMenuOpen ? 'fa-times' : 'fa-bars'} text-gray-700 dark:text-gray-200 text-lg`}></i>
        </button>
      )}

      {/* Overlay for mobile */}
      {isMobile && isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-50 transition-all duration-300 ease-in-out
          ${isMobile 
            ? `left-0 w-72 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}` 
            : `${isCollapsed ? 'w-20' : 'w-72'}`
          }`}
      >
        <div className="h-full flex flex-col">
          {/* Header Section */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
            {(!isCollapsed || isMobile) && (
              <Link to="/" className="flex items-center gap-3 group">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                  <i className="fas fa-graduation-cap text-white text-base"></i>
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-base font-bold bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent truncate">
                    স্মার্ট ইভ্যালুয়েটর
                  </h1>
                  <span className="text-[10px] text-gray-500 dark:text-gray-400">v2.0 React</span>
                </div>
              </Link>
            )}
            
            {!isMobile && (
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex-shrink-0"
                title={isCollapsed ? 'প্রসারিত করুন' : 'সংকুচিত করুন'}
                aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                <i className={`fas ${isCollapsed ? 'fa-angle-double-right' : 'fa-angle-double-left'} text-gray-600 dark:text-gray-300`}></i>
              </button>
            )}
          </div>

          {/* User Profile Section */}
          {user && (
            <div className={`p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0 ${isCollapsed && !isMobile ? 'px-2' : ''}`}>
              <div className={`flex items-center gap-3 ${isCollapsed && !isMobile ? 'justify-center' : ''}`}>
                <div className="relative flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-base shadow-lg ring-2 ring-white dark:ring-gray-800">
                    {user.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
                </div>
                {(!isCollapsed || isMobile) && (
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <p className="text-[13px] font-semibold text-gray-900 dark:text-white truncate leading-tight">
                      {user.name}
                    </p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 capitalize truncate leading-tight mt-0.5">
                      {user.role === 'super-admin' ? 'Super Admin' : user.role}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto p-3 space-y-1 sidebar-scrollbar">
            {/* Public Links */}
            <div className="space-y-1">
              {publicLinks.map((link, idx) => renderLink(link, idx))}
            </div>

            {/* Private Links Section */}
            {isAdmin && visiblePrivateLinks.length > 0 && (
              <>
                {/* Divider */}
                <div className={`py-3 ${isCollapsed && !isMobile ? 'px-0' : 'px-2'}`}>
                  {isCollapsed && !isMobile ? (
                    <div className="h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent"></div>
                  ) : (
                    <div className="flex items-center gap-2.5">
                      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600"></div>
                      <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                        <i className="fas fa-lock text-[8px]"></i>
                        <span>Private</span>
                      </span>
                      <div className="h-px flex-1 bg-gradient-to-r via-gray-300 dark:via-gray-600 to-transparent"></div>
                    </div>
                  )}
                </div>

                {/* Private Links */}
                <div className="space-y-1">
                  {visiblePrivateLinks.map((link, idx) => renderLink(link, idx))}
                </div>
              </>
            )}
          </nav>

          {/* Footer Section - Theme Toggle & Logout */}
          {user && (
            <div className="p-3 border-t border-gray-200 dark:border-gray-700 flex-shrink-0 space-y-2">
              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:shadow-sm ${
                  isCollapsed && !isMobile ? 'justify-center' : ''
                }`}
                title={isCollapsed && !isMobile ? (isDark ? 'লাইট মোড' : 'ডার্ক মোড') : ''}
                aria-label="Toggle theme"
              >
                <div className="relative w-5 h-5 flex items-center justify-center">
                  {/* Sun Icon - visible in dark mode */}
                  <i className={`fas fa-sun absolute transition-all duration-300 ${
                    isDark 
                      ? 'opacity-100 rotate-0 scale-100' 
                      : 'opacity-0 rotate-90 scale-0'
                  }`}></i>
                  {/* Moon Icon - visible in light mode */}
                  <i className={`fas fa-moon absolute transition-all duration-300 ${
                    !isDark 
                      ? 'opacity-100 rotate-0 scale-100' 
                      : 'opacity-0 -rotate-90 scale-0'
                  }`}></i>
                </div>
                {(!isCollapsed || isMobile) && (
                  <span className="text-sm font-medium">
                    {isDark ? 'লাইট মোড' : 'ডার্ক মোড'}
                  </span>
                )}
              </button>
              
              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:shadow-sm ${
                  isCollapsed && !isMobile ? 'justify-center' : ''
                }`}
                title={isCollapsed && !isMobile ? 'লগআউট' : ''}
              >
                <i className="fas fa-sign-out-alt text-base"></i>
                {(!isCollapsed || isMobile) && <span className="text-sm font-medium">লগআউট</span>}
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
