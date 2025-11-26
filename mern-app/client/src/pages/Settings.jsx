import { useSelector, useDispatch } from 'react-redux';
import { toggleSidebarVisibility, toggleSidebarType, toggleDashboardSection } from '../store/settingsSlice';

export default function Settings() {
  const dispatch = useDispatch();
  const { sidebar, dashboardSections } = useSelector((state) => state.settings);
  const { user } = useSelector((state) => state.auth);

  if (!user || (user.type !== 'admin' && user.type !== 'super-admin')) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-red-500 font-bold">আপনার এই পেজটি দেখার অনুমতি নেই।</div>
      </div>
    );
  }

  const handleSidebarVisibility = (path, visible) => {
    dispatch(toggleSidebarVisibility({ path, visible }));
  };

  const handleSidebarType = (path) => {
    dispatch(toggleSidebarType({ path }));
  };

  const handleDashboardSection = (section, visible) => {
    dispatch(toggleDashboardSection({ section, visible }));
  };

  const dashboardToggles = [
    { key: 'hero', title: 'হিরো সেকশন', subtitle: 'স্বাগতম বার্তা এবং স্কোর কার্ড', icon: 'fa-star', color: 'indigo' },
    { key: 'stats', title: 'পরিসংখ্যান গ্রিড', subtitle: 'মোট গ্রুপ, শিক্ষার্থী এবং অন্যান্য তথ্য', icon: 'fa-chart-pie', color: 'blue' },
    { key: 'topGroups', title: 'এলিট গ্রুপ (শীর্ষ ৩)', subtitle: 'সেরা ৩টি গ্রুপ হাইলাইট করুন', icon: 'fa-crown', color: 'yellow' },
    { key: 'academicStats', title: 'একাডেমিক স্ট্যাটাস', subtitle: 'শাখাভিত্তিক পারফরম্যান্স', icon: 'fa-university', color: 'sky' },
    { key: 'ranking', title: 'গ্রুপ র‍্যাঙ্কিং', subtitle: 'সকল গ্রুপের বিস্তারিত র‍্যাঙ্কিং', icon: 'fa-list-ol', color: 'emerald' },
  ];

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">অ্যাপ্লিকেশন কনফিগারেশন</h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm">আপনার ড্যাশবোর্ড এবং মেনু পছন্দমত সাজিয়ে নিন।</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Sidebar Management (Left - Wider) */}
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <i className="fas fa-bars"></i>
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 dark:text-white">মেনু ব্যবস্থাপনা</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">সাইডবার মেনু আইটেমগুলো কাস্টমাইজ করুন</p>
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-500 uppercase bg-gray-50/80 dark:bg-gray-700/50 dark:text-gray-400">
                  <tr>
                    <th scope="col" className="px-6 py-4 font-semibold">মেনু আইটেম</th>
                    <th scope="col" className="px-6 py-4 text-center font-semibold">দৃশ্যমানতা</th>
                    <th scope="col" className="px-6 py-4 text-center font-semibold">এক্সেস টাইপ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                  {Object.entries(sidebar).map(([path, item]) => (
                    <tr key={path} className="group hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors border-b border-gray-50 dark:border-gray-800 last:border-0">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 group-hover:bg-white group-hover:shadow-sm dark:group-hover:bg-gray-600 transition-all">
                            <i className={item.icon}></i>
                          </div>
                          <span className="font-medium text-gray-700 dark:text-gray-200">{item.label}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <label className={`relative inline-flex items-center ${item.locked ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}>
                          <input 
                            type="checkbox" 
                            className="sr-only peer" 
                            checked={item.visible}
                            disabled={item.locked}
                            onChange={(e) => handleSidebarVisibility(path, e.target.checked)}
                          />
                          <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button 
                          className={`relative inline-flex items-center justify-center px-4 py-1.5 overflow-hidden text-xs font-medium transition-all duration-300 ease-out rounded-full group-btn ${item.locked ? 'cursor-not-allowed opacity-60' : 'hover:shadow-md cursor-pointer'} ${item.type === 'private' ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 border border-red-200 dark:border-red-800' : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'}`}
                          disabled={item.locked}
                          onClick={() => handleSidebarType(path)}
                        >
                          <span className="mr-1.5">
                            <i className={`fas ${item.type === 'private' ? 'fa-lock' : 'fa-globe'}`}></i>
                          </span>
                          {item.type === 'private' ? 'প্রাইভেট' : 'পাবলিক'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Dashboard & Other Settings (Right) */}
        <div className="space-y-6">
          {/* Dashboard Sections */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                  <i className="fas fa-tachometer-alt"></i>
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 dark:text-white">ড্যাশবোর্ড সেকশন</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">ড্যাশবোর্ডের কন্টেন্ট নিয়ন্ত্রণ করুন</p>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-4">
              {dashboardToggles.map((toggle) => (
                <div key={toggle.key} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-purple-200 dark:hover:border-purple-500/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg bg-${toggle.color}-100 dark:bg-${toggle.color}-900/30 flex items-center justify-center text-${toggle.color}-600 dark:text-${toggle.color}-400 shadow-sm`}>
                      <i className={`fas ${toggle.icon}`}></i>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{toggle.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{toggle.subtitle}</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={dashboardSections[toggle.key]}
                      onChange={(e) => handleDashboardSection(toggle.key, e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300/50 dark:peer-focus:ring-purple-800/50 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>
          
          {/* Info Card */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-6 border border-blue-100 dark:border-blue-800/30">
            <div className="flex gap-3">
              <i className="fas fa-info-circle text-blue-600 dark:text-blue-400 mt-1"></i>
              <div>
                <h5 className="font-semibold text-blue-800 dark:text-blue-300 text-sm">গুরুত্বপূর্ণ তথ্য</h5>
                <p className="text-xs text-blue-700/80 dark:text-blue-300/70 mt-1 leading-relaxed">
                  'প্রাইভেট' হিসেবে মার্ক করা পেজগুলো শুধুমাত্র অ্যাডমিনরা দেখতে পাবেন। 'পাবলিক' পেজগুলো লগইন করা বা না করা সকল ব্যবহারকারী দেখতে পাবেন।
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
