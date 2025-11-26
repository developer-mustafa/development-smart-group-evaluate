import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function Sidebar({ isOpen }) {
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  const { sidebar } = useSelector((state) => state.settings);

  const isActive = (path) => location.pathname === path;

  // Filter and sort links based on settings
  const publicLinks = Object.entries(sidebar)
    .filter(([_, config]) => config.visible && config.type === 'public')
    .map(([path, config]) => ({ path, ...config }));

  const privateLinks = Object.entries(sidebar)
    .filter(([_, config]) => config.visible && config.type === 'private')
    .map(([path, config]) => ({ path, ...config }));

  const getLinkClass = (link, active) => {
    const baseClass = "nav-btn w-full flex items-center space-x-3 p-3 rounded-lg transition-colors focus:outline-none focus:ring-1 mb-1";
    // Default color if not specified (though it should be in settings)
    const color = link.color || 'gray'; 
    // Handle dynamic class names safely or use inline styles if needed, but Tailwind classes need to be full strings usually.
    // Assuming the colors are standard Tailwind colors used in the settings.
    const colorClass = `hover:bg-${color}-100 dark:hover:bg-${color}-900/50 focus:ring-${color}-400`;
    const activeClass = active 
      ? `bg-${color}-100 dark:bg-${color}-900/50 text-${color}-700 dark:text-${color}-200 font-semibold` 
      : "text-gray-700 dark:text-gray-200";
    
    return `${baseClass} ${colorClass} ${activeClass}`;
  };

  // Helper to render icon box
  const renderIcon = (link) => (
    <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-${link.color || 'gray'}-50 dark:bg-${link.color || 'gray'}-900/30 text-${link.color || 'gray'}-500 dark:text-${link.color || 'gray'}-400`}>
      <i className={`${link.icon} text-sm`} aria-hidden="true"></i>
    </div>
  );

  return (
    <aside
      className={`fixed top-[60px] left-0 bottom-0 w-64 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg shadow-xl z-30 transform transition-transform duration-300 ease-in-out sidebar-scrollbar overflow-y-auto border-r border-gray-200/50 dark:border-gray-700/50 ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}
    >
      <nav className="p-4 space-y-1">
        {/* Public Links */}
        <div className="space-y-1">
          {publicLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={getLinkClass(link, isActive(link.path))}
            >
              {renderIcon(link)}
              <span className="flex-1 text-left text-sm">{link.label}</span>
            </Link>
          ))}
        </div>

        {/* Private Links Divider - Show if user is logged in AND there are visible private links */}
        {user && privateLinks.length > 0 && (
          <>
            <div className="py-4 flex items-center">
              <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
              <span className="flex-shrink-0 mx-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Private</span>
              <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
            </div>
            
            <div className="space-y-1">
              {privateLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={getLinkClass(link, isActive(link.path))}
                >
                  {renderIcon(link)}
                  <span className="flex-1 text-left text-sm">{link.label}</span>
                </Link>
              ))}
            </div>
          </>
        )}
      </nav>
    </aside>
  );
}
