import { createSlice } from '@reduxjs/toolkit';

const DEFAULT_SETTINGS = {
  dashboardSections: {
    hero: true,
    stats: true,
    topGroups: true,
    academicStats: true,
    ranking: true
  },
  sidebar: {
    '/': { visible: true, type: 'public', label: 'ড্যাশবোর্ড', icon: 'fas fa-tachometer-alt', locked: true },
    '/upcoming-assignments': { visible: true, type: 'public', label: 'আপকামিং এসাইনমেন্ট', icon: 'fas fa-calendar-week' },
    '/ranking': { visible: true, type: 'public', label: 'রেঙ্ক লিডারবোর্ড', icon: 'fas fa-trophy' },
    '/students': { visible: true, type: 'public', label: 'শিক্ষার্থী তথ্য', icon: 'fas fa-user-graduate' },
    '/student-filter': { visible: true, type: 'public', label: 'শিক্ষার্থী ফিল্টার', icon: 'fas fa-filter' },
    '/group-analysis': { visible: true, type: 'public', label: 'ফলাফল সামারি', icon: 'fas fa-chart-bar' },
    '/graph-analysis': { visible: true, type: 'public', label: 'মূল্যায়ন বিশ্লেষণ', icon: 'fas fa-chart-line' },
    '/statistics': { visible: true, type: 'public', label: 'গ্রুপ পরিসংখ্যান', icon: 'fas fa-calculator' },
    '/group-policy': { visible: true, type: 'public', label: 'গ্রুপ পলিসি', icon: 'fas fa-book' },
    '/export': { visible: true, type: 'public', label: 'এক্সপোর্ট', icon: 'fas fa-file-export' },
    '/groups': { visible: true, type: 'private', label: 'গ্রুপ ব্যবস্থাপনা', icon: 'fas fa-layer-group' },
    '/members': { visible: true, type: 'private', label: 'শিক্ষার্থী ব্যবস্থাপনা', icon: 'fas fa-users' },
    '/tasks': { visible: true, type: 'private', label: 'টাস্ক ব্যবস্থাপনা', icon: 'fas fa-tasks' },
    '/evaluations': { visible: true, type: 'private', label: 'মূল্যায়ন', icon: 'fas fa-clipboard-check' },
    '/admin-management': { visible: true, type: 'private', label: 'অ্যাডমিন ম্যানেজমেন্ট', icon: 'fas fa-user-shield' },
    '/settings': { visible: true, type: 'private', label: 'সেটিংস', icon: 'fas fa-cog', locked: true },
  }
};

const loadSettings = () => {
  try {
    const saved = localStorage.getItem('app_settings_v2');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Merge saved settings with default to ensure new keys are present
      return {
        dashboardSections: { ...DEFAULT_SETTINGS.dashboardSections, ...parsed.dashboardSections },
        sidebar: { ...DEFAULT_SETTINGS.sidebar, ...parsed.sidebar }
      };
    }
  } catch (e) {
    console.error('Failed to load settings:', e);
  }
  return DEFAULT_SETTINGS;
};

const initialState = loadSettings();

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    toggleSidebarVisibility: (state, action) => {
      const { path, visible } = action.payload;
      if (state.sidebar[path] && !state.sidebar[path].locked) {
        state.sidebar[path].visible = visible;
        localStorage.setItem('app_settings_v2', JSON.stringify(state));
      }
    },
    toggleSidebarType: (state, action) => {
      const { path } = action.payload;
      if (state.sidebar[path] && !state.sidebar[path].locked) {
        state.sidebar[path].type = state.sidebar[path].type === 'public' ? 'private' : 'public';
        localStorage.setItem('app_settings_v2', JSON.stringify(state));
      }
    },
    toggleDashboardSection: (state, action) => {
      const { section, visible } = action.payload;
      if (state.dashboardSections.hasOwnProperty(section)) {
        state.dashboardSections[section] = visible;
        localStorage.setItem('app_settings_v2', JSON.stringify(state));
      }
    },
    resetSettings: (state) => {
      state.dashboardSections = DEFAULT_SETTINGS.dashboardSections;
      state.sidebar = DEFAULT_SETTINGS.sidebar;
      localStorage.setItem('app_settings_v2', JSON.stringify(state));
    }
  }
});

export const { toggleSidebarVisibility, toggleSidebarType, toggleDashboardSection, resetSettings } = settingsSlice.actions;
export default settingsSlice.reducer;
