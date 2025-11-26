import { Link, NavLink } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';

export default function Header() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    window.location.href = '/login';
  };

  const navItems = [
    { path: '/', label: 'ড্যাশবোর্ড', icon: 'fa-home' },
    { path: '/groups', label: 'গ্রুপ', icon: 'fa-layer-group' },
    { path: '/members', label: 'সদস্য', icon: 'fa-users' },
    { path: '/tasks', label: 'টাস্ক', icon: 'fa-tasks' },
    { path: '/evaluations', label: 'মূল্যায়ন', icon: 'fa-chart-line', adminOnly: true },
    { path: '/ranking', label: 'র্যাঙ্কিং', icon: 'fa-trophy' },
    { path: '/statistics', label: 'পরিসংখ্যান', icon: 'fa-chart-bar' },
    { path: '/student-filter', label: 'ফিল্টার', icon: 'fa-filter' },
    { path: '/analysis', label: 'অ্যানালাইসিস', icon: 'fa-chart-pie' },
    { path: '/settings', label: 'সেটিংস', icon: 'fa-cog' },
  ];

  const isAdmin = user?.role === 'super-admin' || user?.role === 'admin';

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="flex items-center justify-between px-4 py-3 h-16">
        <Link to="/" className="flex items-center space-x-3">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
            স্মার্ট ইভ্যালুয়েটর
          </h1>
          <span className="text-xs font-semibold text-blue-800 bg-blue-100 dark:text-blue-200 dark:bg-blue-900/50 px-2 py-0.5 rounded-full">
            v2.0
          </span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          {navItems.map((item) => {
            if (item.adminOnly && !isAdmin) return null;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300'
                      : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`
                }
              >
                <i className={`fa ${item.icon} mr-2`}></i>
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="flex items-center space-x-4">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{user?.displayName}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{user?.role}</p>
          </div>

          <button
            onClick={handleLogout}
            className="btn btn-danger text-sm"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
