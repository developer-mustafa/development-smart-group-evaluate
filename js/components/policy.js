// js/components/policy.js

// Dependencies
let uiManager, helpers;

// DOM Elements
const elements = {};

// LocalStorage keys
const LS_KEYS = { EXPANDED_SET: 'policy_expanded_indices_v2' };

/** =========================
 *  Editable Policy Content
 *  ========================= */
let policyData = [
  {
    title: '১) টিম গঠন (Team Formation)',
    icon: 'fas fa-users-cog',
    content: `
      <ul>
        <li>প্রতি গ্রুপে ৪–৬ জন শিক্ষার্থী থাকবে (আদর্শ ৫ জন)।</li>
        <li>ছেলে ও মেয়ে শিক্ষার্থীদের জন্য আলাদা গ্রুপ গঠন করা হবে।</li>
        <li>প্রতিটি শিক্ষার্থীর একটি নির্দিষ্ট গ্রুপ-দায়িত্ব থাকবে।</li>
        <li>গ্রুপ স্টাডি সহজ করতে একই বেঞ্চে একই গ্রুপের সদস্যরা বসতে চেষ্টা করবে।</li>
      </ul>
    `,
  },
  {
    title: '২) দায়িত্ব বণ্টন (Role Distribution)',
    icon: 'fas fa-sitemap',
    content: `
      <h5>প্রধান দায়িত্বসমূহ</h5>
      <ul>
        <li><strong>টিম লিডার:</strong> নেতৃত্ব, সদস্য যোগাযোগ, শিক্ষক সমন্বয়, দায়িত্ব পর্যবেক্ষণ।</li>
        <li><strong>টাইম কিপার:</strong> সময়ানুবর্তিতা নিশ্চিতকরণ, সাপ্তাহিক উপস্থিতির পরিসংখ্যান।</li>
        <li><strong>রিসোর্স ম্যানেজার:</strong> শীট/নোট/রিপোর্ট সংরক্ষণ ও ফলাফলের ভিত্তিতে নির্দেশনা।</li>
        <li><strong>রিপোর্টার:</strong> কাজের রিপোর্ট রাখা ও প্রয়োজনে উপস্থাপনা করা।</li>
        <li><strong>পিস মেকার:</strong> শৃঙ্খলা বজায় রাখা, মতবিরোধে মীমাংসা ও উৎসাহ প্রদান।</li>
      </ul>
    `,
  },
  {
    title: '৩) মূল্যায়ন পদ্ধতি (Evaluation System)',
    icon: 'fas fa-clipboard-check',
    content: `
      <p>প্রতি টাস্কের মোট নম্বর ১০০। মূল্যায়নের খাতসমূহ:</p>
      <ol>
        <li>এসাইনমেন্ট/টাস্ক নম্বর: <strong>২০</strong></li>
        <li>টিম নম্বর: <strong>১৫</strong></li>
        <li>MCQ নম্বর: <strong>৪০</strong> (বা শিক্ষক নির্ধারণ করবেন)</li>
        <li>অতিরিক্ত ক্রাইটেরিয়া: <strong>২৫</strong></li>
      </ol>
      <h5>অতিরিক্ত ক্রাইটেরিয়া – ব্রেকডাউন (সর্বোচ্চ ২৫)</h5>
      <ul>
        <li>“ভালো করে শিখেছি”: +১০</li>
        <li>“শুধু বুঝেছি”: +৫</li>
        <li>“এখনো পারিনি”: −৫</li>
        <li>সাপ্তাহিক নিয়মিত উপস্থিতি: +১০</li>
        <li>সপ্তাহে প্রতিদিন বাড়ির কাজ: +৫</li>
      </ul>
    `,
  },
  {
    title: '৪) র‌্যাঙ্কিং ও পুরস্কার (Ranking & Rewards)',
    icon: 'fas fa-trophy',
    content: `
      <ul>
        <li>কমপক্ষে ২টি মূল্যায়নে অংশগ্রহণকারীদের গড় স্কোরের ভিত্তিতে র‌্যাঙ্ক নির্ধারণ।</li>
        <li>স্কোর সমান হলে অধিক মূল্যায়নে অংশ নেওয়া শিক্ষার্থী অগ্রাধিকার পাবে।</li>
        <li>গ্রুপভিত্তিক র‌্যাঙ্কিং; সেরা ৩টি গ্রুপ মাসিক পুরস্কার পাবে।</li>
        <li>সেরা টপ ১০ শিক্ষার্থীকে বিশেষ স্বীকৃতি ও পুরস্কার।</li>
        <li>প্রতিটি অ্যাসাইনমেন্টের ফলাফল পরবর্তী র‌্যাঙ্কিংকে প্রভাবিত করবে।</li>
      </ul>
    `,
  },
];

/** ================
 *  Public API
 *  ================ */
export function init(dependencies) {
  uiManager = dependencies.managers.uiManager;
  helpers = dependencies.utils;

  _cacheDOMElements();
  _setupEventListeners();
  console.log('✅ Policy component initialized.');

  return { render, setPolicyData, expandAll, collapseAll };
}

export function render() {
  if (!elements.page) {
    console.error('Policy render failed: #page-group-policy not found.');
    return;
  }
  if (!elements.policySectionsContainer) {
    console.error('Policy render failed: #policySections not found.');
    uiManager.displayEmptyMessage(elements.page, 'এই মুহূর্তে নীতিমালা দেখানো যাচ্ছে না।');
    return;
  }

  uiManager.clearContainer(elements.policySectionsContainer);
  if (!Array.isArray(policyData) || policyData.length === 0) {
    uiManager.displayEmptyMessage(elements.policySectionsContainer, 'নীতিমালা তথ্য পাওয়া যায়নি।');
    return;
  }

  const expandedSet = _getExpandedSet();
  let html = `
    <div class="flex items-center justify-end gap-2 mb-3">
      <button id="btnExpandAll" class="px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition">সব খোলা</button>
      <button id="btnCollapseAll" class="px-3 py-1.5 rounded-lg bg-gray-200 dark:bg-gray-700 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 transition">সব বন্ধ</button>
    </div>
  `;

  policyData.forEach((section, index) => {
    const id = `policy-${index}`;
    const isExpanded = expandedSet.has(index);
    html += `
      <section class="card overflow-hidden border border-gray-200 dark:border-gray-700 rounded-xl mb-3">
        <h3>
          <button
            type="button"
            class="policy-header w-full flex justify-between items-center p-4 text-left bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            data-index="${index}"
            aria-controls="${id}-content"
            aria-expanded="${isExpanded ? 'true' : 'false'}"
          >
            <span class="text-lg font-semibold text-gray-800 dark:text-white flex items-center">
              <i class="${section.icon || 'fas fa-shield-alt'} w-6 text-center mr-3 text-blue-500"></i>
              ${_formatText(section.title)}
            </span>
            <i class="chev fas fa-chevron-down text-gray-500 dark:text-gray-400 transition-transform duration-300 ${
              isExpanded ? 'rotate-180' : ''
            }"></i>
          </button>
        </h3>
        <div
          id="${id}-content"
          class="policy-content overflow-hidden ${isExpanded ? '' : 'hidden'}"
          data-anim="true"
          style="${isExpanded ? 'height:auto;opacity:1;' : 'height:0;opacity:0;'}"
        >
          <div class="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
            <div class="prose prose-sm dark:prose-invert max-w-none">
              ${_renderContent(section.content)}
            </div>
          </div>
        </div>
      </section>
    `;
  });

  elements.policySectionsContainer.innerHTML = html;
}

export function togglePolicySection(index) {
  const btn = elements.policySectionsContainer?.querySelector(`.policy-header[data-index="${index}"]`);
  if (!btn) return;
  const contentId = btn.getAttribute('aria-controls');
  const content = document.getElementById(contentId);
  const icon = btn.querySelector('.chev');
  const willExpand = btn.getAttribute('aria-expanded') !== 'true';

  btn.setAttribute('aria-expanded', String(willExpand));
  icon?.classList.toggle('rotate-180', willExpand);

  _animateAccordion(content, willExpand);

  const set = _getExpandedSet();
  if (willExpand) set.add(Number(index));
  else set.delete(Number(index));
  _setExpandedSet(set);
}

export function setPolicyData(nextArray) {
  if (Array.isArray(nextArray)) {
    policyData = nextArray.map((s) => ({
      ...s,
      // ensure clean strings
      title: _formatText(s.title),
      icon: s.icon,
      content: _formatText(s.content),
    }));
    render();
  } else {
    console.warn('setPolicyData expects an array.');
  }
}

export function expandAll() {
  const set = new Set(Array.from(policyData, (_, i) => i));
  _setExpandedSet(set);
  render();
}

export function collapseAll() {
  _setExpandedSet(new Set());
  render();
}

/** ================
 *  Private
 *  ================ */
function _cacheDOMElements() {
  elements.page = document.getElementById('page-group-policy');
  if (elements.page) {
    elements.policySectionsContainer = elements.page.querySelector('#policySections');
  } else {
    console.warn('Policy page element (#page-group-policy) not found!');
  }
}

function _setupEventListeners() {
  if (!elements.page) return;

  // Delegated click: toggle sections / expand-collapse all
  elements.page.addEventListener('click', (e) => {
    const btn = e.target.closest('.policy-header');
    if (btn && elements.policySectionsContainer?.contains(btn)) {
      const idx = Number(btn.dataset.index);
      togglePolicySection(idx);
      return;
    }
    if (e.target.id === 'btnExpandAll') {
      expandAll();
      return;
    }
    if (e.target.id === 'btnCollapseAll') {
      collapseAll();
    }
  });

  // Keyboard support for header toggle
  elements.page.addEventListener('keydown', (e) => {
    const btn = e.target.closest('.policy-header');
    if (!btn) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const idx = Number(btn.dataset.index);
      togglePolicySection(idx);
    }
  });
}

function _formatText(value) {
  if (helpers?.ensureBengaliText && typeof helpers.ensureBengaliText === 'function') {
    return helpers.ensureBengaliText(value);
  }
  if (typeof value === 'string') return value.trim();
  if (value === null || value === undefined) return '';
  return String(value);
}

function _renderContent(rawHtml) {
  // 1) normalize + trim
  let html = _formatText(rawHtml);

  // 2) strip legacy citation markers if accidentally present
  html = html.replace(/\[cite_start\]/g, '').replace(/\[cite:[^\]]*\]/g, '');

  // 3) sanitize (allow a safe subset only)
  return _sanitizeHtml(html);
}

/** Smooth accordion animation (height + opacity)
 *  - expand: set current height -> target scrollHeight
 *  - collapse: set fixed height -> 0
 */
function _animateAccordion(panel, expand) {
  if (!panel) return;

  const duration = 260; // ms
  panel.style.overflow = 'hidden';
  panel.dataset.animating = 'true';

  const startHeight = panel.getBoundingClientRect().height;
  const endHeight = expand ? _getInnerHeight(panel) : 0;

  // If starting from display:none/hidden, unhide first
  if (expand) {
    panel.classList.remove('hidden');
    // set height 0 for smooth start if it was hidden
    panel.style.height = startHeight ? `${startHeight}px` : '0px';
    panel.style.opacity = 0;
  }

  const startTime = performance.now();

  const step = (now) => {
    const t = Math.min(1, (now - startTime) / duration);
    // ease-out cubic
    const eased = 1 - Math.pow(1 - t, 3);

    const current = startHeight + (endHeight - startHeight) * eased;
    panel.style.height = `${current}px`;
    panel.style.opacity = expand ? eased : 1 - eased;

    if (t < 1) {
      requestAnimationFrame(step);
    } else {
      panel.style.height = expand ? 'auto' : '0px';
      if (!expand) panel.classList.add('hidden');
      panel.style.opacity = expand ? 1 : 0;
      panel.style.overflow = '';
      delete panel.dataset.animating;
    }
  };

  requestAnimationFrame(step);
}

function _getInnerHeight(panel) {
  // temporarily set height:auto to measure inner content
  const prevHeight = panel.style.height;
  const prevHidden = panel.classList.contains('hidden');

  panel.classList.remove('hidden');
  panel.style.height = 'auto';
  const h = panel.getBoundingClientRect().height;

  // revert
  if (prevHidden) panel.classList.add('hidden');
  panel.style.height = prevHeight || '0px';
  return h;
}

function _sanitizeHtml(html) {
  // small allow-list (replace with DOMPurify if you have it)
  const ALLOWED = {
    tags: ['p', 'ul', 'ol', 'li', 'strong', 'em', 'b', 'i', 'u', 'h5', 'br', 'span'],
    attrs: { '*': ['class', 'style'] },
  };

  const div = document.createElement('div');
  div.innerHTML = html;

  const walker = (node) => {
    if (node.nodeType === 1) {
      const tag = node.tagName.toLowerCase();
      if (!ALLOWED.tags.includes(tag)) {
        node.replaceWith(...Array.from(node.childNodes));
        return;
      }
      [...node.attributes].forEach((attr) => {
        const name = attr.name.toLowerCase();
        if (!ALLOWED.attrs['*']?.includes(name)) node.removeAttribute(attr.name);
        if (/^on/i.test(name)) node.removeAttribute(attr.name);
        if (name === 'style' && /expression|javascript:/i.test(attr.value)) node.removeAttribute('style');
      });
    }
    [...node.childNodes].forEach(walker);
  };
  [...div.childNodes].forEach(walker);
  return div.innerHTML;
}

function _getExpandedSet() {
  try {
    const raw = localStorage.getItem(LS_KEYS.EXPANDED_SET);
    const arr = raw ? JSON.parse(raw) : [];
    return new Set(arr);
  } catch {
    return new Set();
  }
}

function _setExpandedSet(set) {
  try {
    localStorage.setItem(LS_KEYS.EXPANDED_SET, JSON.stringify([...set]));
  } catch {
    /* ignore */
  }
}
