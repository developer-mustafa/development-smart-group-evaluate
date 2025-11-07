// js/components/policy.js

let uiManager;
let helpers;

const elements = {};

const DEFAULT_SECTIONS = [
  {
    title: 'টিম গঠন',
    icon: 'fas fa-users',
    tone: 'indigo',
    rules: [
      'প্রতি দলে ৪-৫ জন সদস্য থাকবে এবং সবার ভূমিকা স্পষ্টভাবে নির্ধারিত হবে।',
      'নতুন সদস্য যুক্ত করার আগে আগের দলের অগ্রগতি যাচাই করা হবে।',
      'টিম লিডারই কাজ বণ্টন ও সময়সূচি পরিচালনা করবে।',
    ],
  },
  {
    title: 'ভূমিকা বণ্টন',
    icon: 'fas fa-sitemap',
    tone: 'emerald',
    rules: [
      'Leadership, Time Keeper, Reporter, Resource Manager ও Peace Maker—এই পাঁচটি ভূমিকাই বাধ্যতামূলক।',
      'প্রতিটি ভূমিকার দৈনিক রিপোর্ট কাগজে অথবা অ্যাপে জমা দিতে হবে।',
      'ভূমিকা পরিবর্তন করতে চাইলে পুরো দল ও সমন্বয়কারীর সম্মতি লাগবে।',
    ],
  },
  {
    title: 'মূল্যায়ন নিয়ম',
    icon: 'fas fa-clipboard-check',
    tone: 'amber',
    rules: [
      'টাস্ক, টিমওয়ার্ক, অতিরিক্ত কাজ এবং MCQ—এই ৪ প্যারামিটারে নম্বর দেওয়া হবে।',
      'ভালোভাবে শিখেছি +10, শুধু বুঝেছি +5, এখনো পারিনা টপিক -5 পয়েন্ট কাটা হবে',
      'দেরিতে কাজ জমা দিলে মোট নম্বরের ১০% পর্যন্ত কাটা যেতে পারে।',
    ],
  },
  {
    title: 'র্যাঙ্কিং ও পুরস্কার',
    icon: 'fas fa-trophy',
    tone: 'purple',
    rules: [
      'সাপ্তাহিক র্যাঙ্ক বোর্ডে শীর্ষ ৩ দলকে বিশেষ ব্যাজ দেওয়া হবে।',
      'ধারাবাহিকভাবে পিছিয়ে থাকা দলকে মেন্টরিং সেশন দেওয়া হবে।',
      'চূড়ান্ত পুরস্কার পেতে হলে ৮০% সেশন উপস্থিত থাকা বাধ্যতামূলক।',
    ],
  },
];

const TONE_STYLES = {
  indigo: {
    icon: 'bg-indigo-100 text-indigo-700',
    dot: 'bg-indigo-500',
    border: 'border-indigo-100',
  },
  emerald: {
    icon: 'bg-emerald-100 text-emerald-700',
    dot: 'bg-emerald-500',
    border: 'border-emerald-100',
  },
  amber: {
    icon: 'bg-amber-100 text-amber-700',
    dot: 'bg-amber-500',
    border: 'border-amber-100',
  },
  purple: {
    icon: 'bg-purple-100 text-purple-700',
    dot: 'bg-purple-500',
    border: 'border-purple-100',
  },
};

let policySections = [...DEFAULT_SECTIONS];

export function init(dependencies) {
  uiManager = dependencies.managers.uiManager;
  helpers = dependencies.utils;

  _cacheDOMElements();
  render();

  console.log('✅ Policy component initialized.');
  return { render, setPolicyData, expandAll, collapseAll };
}

export function render() {
  if (!elements.page || !elements.policySectionsContainer) return;

  const sections = Array.isArray(policySections) && policySections.length ? policySections : DEFAULT_SECTIONS;
  const cardsHtml = sections.map(_renderSectionCard).join('');

  elements.policySectionsContainer.innerHTML = `
    <div class="space-y-8">
      ${_renderHero(sections)}
      <div class="grid gap-6 lg:grid-cols-2" aria-live="polite">
        ${cardsHtml}
      </div>
    </div>
  `;
}

export function setPolicyData(list = []) {
  if (Array.isArray(list) && list.length) {
    policySections = list.map(_normalizeSection);
  } else {
    policySections = [...DEFAULT_SECTIONS];
  }
  render();
}

export function expandAll() {
  render();
}

export function collapseAll() {
  render();
}

function _cacheDOMElements() {
  elements.page = document.getElementById('page-group-policy');
  elements.policySectionsContainer = document.getElementById('policySections');
}

function _renderHero(sections) {
  const totalSections = sections.length;
  const totalRules = sections.reduce((sum, section) => sum + section.rules.length, 0);
  const teamsFocus = sections.find((section) => /টিম|গঠন/i.test(section.title))?.rules.length || 0;

  const format = (value) =>
    helpers?.convertToBanglaNumber ? helpers.convertToBanglaNumber(String(value)) : String(value);

  return `
    <section class="rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-800 p-6 text-white shadow-2xl">
      <div class="space-y-3">
        <p class="text-xs uppercase tracking-[0.4em] text-white/70">Policy Update</p>
        <h2 class="text-3xl font-semibold"> গ্রুপ পলিসি </h2>
        <p class="text-sm text-white/80 max-w-2xl">
          টিমকে সংগঠিত রাখা, সুষম মূল্যায়ন করা এবং সবার জন্য স্পষ্ট প্রত্যাশা জানানোর জন্য এই কয়েকটি নিয়মই যথেষ্ট।
        </p>
      </div>
      <div class="mt-6 grid gap-4 sm:grid-cols-3">
        ${_heroStat('মোট সেকশন', format(totalSections))}
        ${_heroStat('মোট নিয়ম', format(totalRules))}
        ${_heroStat('টিম ফোকাস', format(teamsFocus))}
      </div>
    </section>
  `;
}

function _heroStat(label, value) {
  return `
    <div class="rounded-2xl border border-white/20 bg-white/10 backdrop-blur p-4">
      <p class="text-xs uppercase tracking-wide text-white/70">${label}</p>
      <p class="mt-2 text-2xl font-semibold">${value}</p>
    </div>
  `;
}

function _renderSectionCard(section, index) {
  const { title, icon, rules, tone } = section;
  const toneStyle = TONE_STYLES[tone] || TONE_STYLES.indigo;
  const ruleItems = rules
    .map(
      (rule) => `
        <li class="flex gap-3">
          <span class="mt-2 h-2 w-2 rounded-full ${toneStyle.dot}"></span>
          <span class="text-sm text-gray-600 dark:text-gray-300">${_escapeHtml(rule)}</span>
        </li>`
    )
    .join('');

  const step = helpers?.convertToBanglaNumber ? helpers.convertToBanglaNumber(String(index + 1)) : index + 1;

  return `
    <article class="rounded-2xl border ${toneStyle.border} bg-white dark:bg-gray-900/80 p-6 shadow-sm hover:shadow-xl transition-shadow duration-300">
      <div class="flex items-center gap-4">
        <span class="flex h-12 w-12 items-center justify-center rounded-2xl ${toneStyle.icon}">
          <i class="${icon} text-lg"></i>
        </span>
        <div>
          <p class="text-xs font-semibold text-gray-400">নিয়ম ${step}</p>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">${_escapeHtml(title)}</h3>
        </div>
      </div>
      <ul class="mt-4 space-y-2">${ruleItems}</ul>
    </article>
  `;
}

function _normalizeSection(section = {}) {
  const rules = Array.isArray(section.rules)
    ? section.rules.map((rule) => _formatText(rule)).filter(Boolean)
    : [];
  return {
    title: _formatText(section.title) || 'শিরোনামহীন নিয়ম',
    icon: section.icon || 'fas fa-book-open',
    tone: section.tone || 'indigo',
    rules: rules.length ? rules : ['এই সেকশনে নিয়ম যুক্ত করুন।'],
  };
}

function _formatText(value) {
  if (!value) return '';
  if (helpers?.ensureBengaliText && typeof helpers.ensureBengaliText === 'function') {
    return helpers.ensureBengaliText(value);
  }
  if (typeof value === 'string') return value.trim();
  return String(value).trim();
}

function _escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
