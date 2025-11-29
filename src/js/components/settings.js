import stateManager from '../managers/stateManager.js';
import uiManager from '../managers/uiManager.js';

// Default settings structure
const DEFAULT_SETTINGS = {
  dashboardSections: {
    hero: true,
    stats: true,
    eliteGroups: true, // This is now 'topGroups' in UI but keeping key for backward compat or mapping
    topGroups: true,
    academicStats: true,
    ranking: true
  },
  sidebar: {
    dashboard: { visible: true, type: 'public', label: 'ড্যাশবোর্ড', icon: 'fa-tachometer-alt', locked: true },
    'upcoming-assignments': { visible: true, type: 'public', label: 'আপকামিং এসাইনমেন্ট', icon: 'fa-calendar-week' },
    'student-ranking': { visible: true, type: 'public', label: 'রেঙ্ক লিডারবোর্ড', icon: 'fa-trophy' },
    'all-students': { visible: true, type: 'public', label: 'শিক্ষার্থী তথ্য', icon: 'fa-user-graduate' },
    'student-filter': { visible: true, type: 'public', label: 'শিক্ষার্থী ফিল্টার', icon: 'fa-filter' },
    'group-analysis': { visible: true, type: 'public', label: 'ফলাফল সামারি', icon: 'fa-chart-bar' },
    'graph-analysis': { visible: true, type: 'public', label: 'মূল্যায়ন বিশ্লেষণ', icon: 'fa-chart-line' },
    statistics: { visible: true, type: 'public', label: 'গ্রুপ পরিসংখ্যান', icon: 'fa-calculator' },
    'group-policy': { visible: true, type: 'public', label: 'গ্রুপ পলিসি', icon: 'fa-book' },
    export: { visible: true, type: 'public', label: 'এক্সপোর্ট', icon: 'fa-file-export' },
    groups: { visible: true, type: 'private', label: 'গ্রুপ ব্যবস্থাপনা', icon: 'fa-layer-group' },
    members: { visible: true, type: 'private', label: 'শিক্ষার্থী ব্যবস্থাপনা', icon: 'fa-users' },
    tasks: { visible: true, type: 'private', label: 'টাস্ক ব্যবস্থাপনা', icon: 'fa-tasks' },
    evaluation: { visible: true, type: 'private', label: 'মূল্যায়ন', icon: 'fa-clipboard-check' },
    settings: { visible: true, type: 'private', label: 'সেটিংস', icon: 'fa-cog', locked: true },
  }
};

let _settings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS)); // Deep copy
const STORAGE_KEY = 'app_settings_v2';

export function init(dependencies) {
  _loadSettings();
  _mergeDefaults();
  _applySettings();
  console.log('⚙️ Settings component initialized');
  
  return {
    render,
    applySettings: _applySettings,
    isPagePublic,
    toggleSidebarType,
    toggleDashboardSection,
    toggleSidebarVisibility
  };
}

function _mergeDefaults() {
  // 1. Clean up stale keys from _settings.sidebar that are not in DEFAULT_SETTINGS.sidebar
  Object.keys(_settings.sidebar).forEach(key => {
    if (!DEFAULT_SETTINGS.sidebar.hasOwnProperty(key)) {
      delete _settings.sidebar[key];
    }
  });

  // 2. Merge sidebar keys
  Object.keys(DEFAULT_SETTINGS.sidebar).forEach(key => {
    if (!_settings.sidebar[key]) {
      _settings.sidebar[key] = DEFAULT_SETTINGS.sidebar[key];
    } else {
      // If locked, force defaults for critical properties
      if (DEFAULT_SETTINGS.sidebar[key].locked) {
        _settings.sidebar[key].locked = true;
        _settings.sidebar[key].visible = true; // Force visible if locked
        _settings.sidebar[key].type = DEFAULT_SETTINGS.sidebar[key].type; // Force type if locked
      }
      
      _settings.sidebar[key].label = DEFAULT_SETTINGS.sidebar[key].label;
      _settings.sidebar[key].icon = DEFAULT_SETTINGS.sidebar[key].icon;
    }
  });
  
  // Merge dashboard sections
  Object.keys(DEFAULT_SETTINGS.dashboardSections).forEach(key => {
    if (_settings.dashboardSections[key] === undefined) {
      _settings.dashboardSections[key] = DEFAULT_SETTINGS.dashboardSections[key];
    }
  });
}

export function render() {
  const container = document.getElementById('settingsContent');
  if (!container) return;

  container.innerHTML = `
    <div class="space-y-8">
      <!-- Header Section -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <h3 class="text-xl font-bold text-gray-800 dark:text-white mb-2">অ্যাপ্লিকেশন কনফিগারেশন</h3>
        <p class="text-gray-500 dark:text-gray-400 text-sm">আপনার ড্যাশবোর্ড এবং মেনু পছন্দমত সাজিয়ে নিন।</p>
      </div>

      <div class="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <!-- Sidebar Management (Left - Wider) -->
        <div class="xl:col-span-2 space-y-6">
          <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div class="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <i class="fas fa-bars"></i>
                </div>
                <div>
                  <h4 class="font-bold text-gray-800 dark:text-white">মেনু ব্যবস্থাপনা</h4>
                  <p class="text-xs text-gray-500 dark:text-gray-400">সাইডবার মেনু আইটেমগুলো কাস্টমাইজ করুন</p>
                </div>
              </div>
            </div>
            
            <div class="overflow-x-auto">
              <table class="w-full text-sm text-left">
                <thead class="text-xs text-gray-500 uppercase bg-gray-50/80 dark:bg-gray-700/50 dark:text-gray-400">
                  <tr>
                    <th scope="col" class="px-6 py-4 font-semibold">মেনু আইটেম</th>
                    <th scope="col" class="px-6 py-4 text-center font-semibold">দৃশ্যমানতা</th>
                    <th scope="col" class="px-6 py-4 text-center font-semibold">এক্সেস টাইপ</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100 dark:divide-gray-700/50">
                  ${_renderSidebarRows()}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Dashboard & Other Settings (Right) -->
        <div class="space-y-6">
          <!-- Dashboard Sections -->
          <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div class="p-6 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                  <i class="fas fa-tachometer-alt"></i>
                </div>
                <div>
                  <h4 class="font-bold text-gray-800 dark:text-white">ড্যাশবোর্ড সেকশন</h4>
                  <p class="text-xs text-gray-500 dark:text-gray-400">ড্যাশবোর্ডের কন্টেন্ট নিয়ন্ত্রণ করুন</p>
                </div>
              </div>
            </div>
            <div class="p-6 space-y-4">
              ${_renderDashboardToggle('hero', 'হিরো সেকশন', 'স্বাগতম বার্তা এবং স্কোর কার্ড', 'fa-star', 'indigo')}
              ${_renderDashboardToggle('stats', 'পরিসংখ্যান গ্রিড', 'মোট গ্রুপ, শিক্ষার্থী এবং অন্যান্য তথ্য', 'fa-chart-pie', 'blue')}
              ${_renderDashboardToggle('topGroups', 'এলিট গ্রুপ (শীর্ষ ৩)', 'সেরা ৩টি গ্রুপ হাইলাইট করুন', 'fa-crown', 'yellow')}
              ${_renderDashboardToggle('academicStats', 'একাডেমিক স্ট্যাটাস', 'শাখাভিত্তিক পারফরম্যান্স', 'fa-university', 'sky')}
              ${_renderDashboardToggle('ranking', 'গ্রুপ র‍্যাঙ্কিং', 'সকল গ্রুপের বিস্তারিত র‍্যাঙ্কিং', 'fa-list-ol', 'emerald')}
            </div>
          </div>
          
          <!-- Info Card -->
          <div class="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-6 border border-blue-100 dark:border-blue-800/30">
            <div class="flex gap-3">
              <i class="fas fa-info-circle text-blue-600 dark:text-blue-400 mt-1"></i>
              <div>
                <h5 class="font-semibold text-blue-800 dark:text-blue-300 text-sm">গুরুত্বপূর্ণ তথ্য</h5>
                <p class="text-xs text-blue-700/80 dark:text-blue-300/70 mt-1 leading-relaxed">
                  'প্রাইভেট' হিসেবে মার্ক করা পেজগুলো শুধুমাত্র অ্যাডমিনরা দেখতে পাবেন। 'পাবলিক' পেজগুলো লগইন করা বা না করা সকল ব্যবহারকারী দেখতে পাবেন।
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function _renderDashboardToggle(key, title, subtitle, icon, color) {
  const isChecked = _settings.dashboardSections[key];
  return `
    <div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-purple-200 dark:hover:border-purple-500/30 transition-colors">
      <div class="flex items-center gap-4">
        <div class="w-10 h-10 rounded-lg bg-${color}-100 dark:bg-${color}-900/30 flex items-center justify-center text-${color}-600 dark:text-${color}-400 shadow-sm">
          <i class="fas ${icon}"></i>
        </div>
        <div>
          <p class="font-semibold text-gray-900 dark:text-white">${title}</p>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">${subtitle}</p>
        </div>
      </div>
      <label class="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" class="sr-only peer" 
          ${isChecked ? 'checked' : ''}
          onchange="window.smartEvaluator.components.settings.toggleDashboardSection('${key}', this.checked)">
        <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300/50 dark:peer-focus:ring-purple-800/50 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
      </label>
    </div>
  `;
}

function _renderSidebarRows() {
  // Use DEFAULT_SETTINGS keys to ensure order and prevent stale keys from showing
  return Object.keys(DEFAULT_SETTINGS.sidebar).map(key => {
    const item = _settings.sidebar[key];
    if (!item) return ''; // Should not happen due to _mergeDefaults

    const isLocked = item.locked;
    return `
    <tr class="group hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors border-b border-gray-50 dark:border-gray-800 last:border-0">
      <td class="px-6 py-4">
        <div class="flex items-center gap-4">
          <div class="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 group-hover:bg-white group-hover:shadow-sm dark:group-hover:bg-gray-600 transition-all">
            <i class="fas ${item.icon}"></i>
          </div>
          <span class="font-medium text-gray-700 dark:text-gray-200">${item.label}</span>
        </div>
      </td>
      <td class="px-6 py-4 text-center">
        <label class="relative inline-flex items-center ${isLocked ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}">
          <input type="checkbox" class="sr-only peer" 
            ${item.visible ? 'checked' : ''} 
            ${isLocked ? 'disabled' : ''}
            onchange="window.smartEvaluator.components.settings.toggleSidebarVisibility('${key}', this.checked)">
          <div class="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
        </label>
      </td>
      <td class="px-6 py-4 text-center">
        <button 
          class="relative inline-flex items-center justify-center px-4 py-1.5 overflow-hidden text-xs font-medium transition-all duration-300 ease-out rounded-full group-btn ${isLocked ? 'cursor-not-allowed opacity-60' : 'hover:shadow-md cursor-pointer'} ${item.type === 'private' ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 border border-red-200 dark:border-red-800' : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'}"
          ${isLocked ? 'disabled' : ''}
          onclick="window.smartEvaluator.components.settings.toggleSidebarType('${key}')">
          <span class="mr-1.5">
            <i class="fas ${item.type === 'private' ? 'fa-lock' : 'fa-globe'}"></i>
          </span>
          ${item.type === 'private' ? 'প্রাইভেট' : 'পাবলিক'}
        </button>
      </td>
    </tr>
  `}).join('');
}

// --- Public Actions ---

export function toggleSidebarVisibility(key, isVisible) {
  if (_settings.sidebar[key] && !_settings.sidebar[key].locked) {
    _settings.sidebar[key].visible = isVisible;
    _saveSettings();
    _applySettings();
  }
}

export function toggleSidebarType(key) {
  if (_settings.sidebar[key] && !_settings.sidebar[key].locked) {
    _settings.sidebar[key].type = _settings.sidebar[key].type === 'public' ? 'private' : 'public';
    _saveSettings();
    _applySettings();
    render();
  }
}

export function toggleDashboardSection(section, isVisible) {
  if (_settings.dashboardSections.hasOwnProperty(section)) {
    _settings.dashboardSections[section] = isVisible;
    _saveSettings();
    _applySettings();
  }
}

// --- Helper Methods ---

export function isPagePublic(pageId) {
  if (_settings.sidebar[pageId]) {
    return _settings.sidebar[pageId].type === 'public';
  }
  return false; 
}

function _loadSettings() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      _settings.dashboardSections = { ..._settings.dashboardSections, ...parsed.dashboardSections };
      _settings.sidebar = { ..._settings.sidebar, ...parsed.sidebar };
    } catch (e) {
      console.error('Failed to parse settings', e);
    }
  }
}

function _saveSettings() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(_settings));
  uiManager.showToast('সেটিং সেভ করা হয়েছে', 'success');
}

function _applySettings() {
  // 1. Sidebar
  Object.entries(_settings.sidebar).forEach(([key, config]) => {
    const btn = document.querySelector(`button[data-page="${key}"]`);
    if (btn) {
      if (!config.visible) {
        btn.classList.add('hidden');
        btn.setAttribute('data-settings-hidden', 'true');
      } else {
        btn.removeAttribute('data-settings-hidden');
      }

      if (config.type === 'private') {
        btn.classList.add('private-tab');
      } else {
        btn.classList.remove('private-tab');
      }
    }
  });

  // 2. Dashboard Sections
  const sectionMap = {
    hero: 'dashboard-hero',
    stats: 'dashboard-stats',
    topGroups: 'dashboard-top-groups',
    academicStats: 'dashboard-academic-stats',
    ranking: 'dashboard-ranking',
    eliteGroups: 'elite-groups' // Legacy fallback
  };

  Object.entries(_settings.dashboardSections).forEach(([key, visible]) => {
    const elementId = sectionMap[key];
    if (elementId) {
      const el = document.getElementById(elementId);
      if (el) {
        if (visible) {
          el.classList.remove('hidden');
        } else {
          el.classList.add('hidden');
        }
      }
    }
  });

  // 3. Auth Check
  _refreshSidebarAuth();
}

function _refreshSidebarAuth() {
  const currentUser = stateManager.get('currentUserData');
  const isAdmin = currentUser && (currentUser.type === 'admin' || currentUser.type === 'super-admin');
  
  console.log('🔄 _refreshSidebarAuth called');
  console.log('👤 Current User Data:', currentUser);
  console.log('🛡️ Is Admin:', isAdmin);

  document.querySelectorAll('.nav-btn').forEach(btn => {
    if (btn.hasAttribute('data-settings-hidden')) {
      // console.log(`Hidden by settings: ${btn.dataset.page}`);
      btn.classList.add('hidden');
      return;
    }

    if (btn.classList.contains('private-tab')) {
      if (isAdmin) {
        btn.classList.remove('hidden');
        // console.log(`Showing private tab: ${btn.dataset.page}`);
      } else {
        btn.classList.add('hidden');
        // console.log(`Hiding private tab (not admin): ${btn.dataset.page}`);
      }
    } else {
      btn.classList.remove('hidden');
    }
  });
  
  const divider = document.querySelector('.private-tab-divider');
  if (divider) {
    const visiblePrivateTabs = Array.from(document.querySelectorAll('.private-tab')).some(el => !el.classList.contains('hidden'));
    if (visiblePrivateTabs) {
      divider.classList.remove('hidden');
    } else {
      divider.classList.add('hidden');
    }
  }
}
