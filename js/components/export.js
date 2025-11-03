// js/components/export.js

// Dependencies
let stateManager, uiManager, dataService, helpers, app;

// DOM Elements
const elements = {};

// Column labels
const TASK_DATE_LABEL = 'তারিখ';
const EVALUATION_DATE_LABEL = 'টাস্কের তারিখ';

// Reusable labels for Evaluations CSV (Bangla, used in both single CSV and ZIP)
const EVAL_LABELS = {
  TASK_NAME: 'কাজের নাম',
  GROUP_NAME: 'গ্রুপের নাম',
  STUDENT_NAME: 'শিক্ষার্থীর নাম',
  ROLL: 'রোল',
  TASK_SCORE: 'টাস্ক স্কোর',
  TEAM_SCORE: 'টিম স্কোর',
  MCQ_SCORE: 'MCQ স্কোর',
  ADDITIONAL_SCORE: 'অতিরিক্ত স্কোর',
  TOTAL_SCORE: 'মোট স্কোর',
  MAX_SCORE: 'সর্বোচ্চ স্কোর',
  COMMENTS: 'মন্তব্য',
};

/**
 * Initializes the Export component.
 * @param {object} dependencies - Passed from app.js.
 * @returns {object} - Public methods.
 */
export function init(dependencies) {
  stateManager = dependencies.managers.stateManager;
  uiManager = dependencies.managers.uiManager;
  dataService = dependencies.services.dataService;
  helpers = dependencies.utils;
  app = dependencies.app;
  // analysisComponent is app.components.analysis (accessed via 'app')

  _cacheDOMElements();
  _setupEventListeners(); // Setup JS-based event listeners

  console.log('✅ Export component initialized.');

  return { render };
}

/**
 * Renders the Export page (#page-export).
 * This function primarily updates the statistics on the page.
 */
export function render() {
  if (!elements.page) {
    console.error('❌ Export render failed: Page element #page-export not found.');
    return;
  }
  console.log('Rendering Export page...');
  _updateStats();
}

/**
 * Caches DOM elements for the Export page.
 * @private
 */
function _cacheDOMElements() {
  elements.page = document.getElementById('page-export');
  if (elements.page) {
    // Cache buttons by explicit IDs (preferred) with legacy fallback support
    elements.exportStudentsCSVBtn =
      elements.page.querySelector('#exportStudentsCSVBtn') ||
      elements.page.querySelector('button[onclick*="exportStudentsCSV"]');
    elements.exportGroupsCSVBtn =
      elements.page.querySelector('#exportGroupsCSVBtn') ||
      elements.page.querySelector('button[onclick*="exportGroupsCSV"]');
    elements.exportEvaluationsCSVBtn =
      elements.page.querySelector('#exportEvaluationsCSVBtn') ||
      elements.page.querySelector('button[onclick*="exportEvaluationsCSV"]');
    elements.exportAllDataJSONBtn =
      elements.page.querySelector('#exportAllDataJSONBtn') ||
      elements.page.querySelector('button[onclick*="exportAllData"]');
    elements.exportAllDataZipBtn =
      elements.page.querySelector('#exportAllDataZipBtn') ||
      elements.page.querySelector('button[onclick*="exportAllDataAsZip"]');
    elements.exportAnalysisPDFBtn =
      elements.page.querySelector('#exportAnalysisPDFBtn') ||
      elements.page.querySelector('button[onclick*="exportAnalysisPDF"]');
    elements.exportGroupAnalysisPDFBtn =
      elements.page.querySelector('#exportGroupAnalysisPDFBtn') ||
      elements.page.querySelector('button[onclick*="exportGroupAnalysisPDF"]');
    elements.printReportBtn =
      elements.page.querySelector('#printGroupAnalysisBtn') ||
      elements.page.querySelector('button[onclick*="printGroupAnalysis"]');

    // Statistics Cards
    elements.totalStudentsCount = elements.page.querySelector('#totalStudentsCount');
    elements.totalGroupsCount = elements.page.querySelector('#totalGroupsCount');
    elements.totalEvaluationsCount = elements.page.querySelector('#totalEvaluationsCount');
    elements.lastExportTime = elements.page.querySelector('#lastExportTime');

    // Remove onclick attributes to prevent double triggers
    _removeOnclickAttributes();
  } else {
    console.error('❌ Export init failed: #page-export element not found!');
  }
}

/**
 * Removes inline 'onclick' attributes from cached buttons
 * to rely solely on JavaScript event listeners.
 * @private
 */
function _removeOnclickAttributes() {
  const buttons = [
    elements.exportStudentsCSVBtn,
    elements.exportGroupsCSVBtn,
    elements.exportEvaluationsCSVBtn,
    elements.exportAllDataJSONBtn,
    elements.exportAllDataZipBtn,
    elements.exportAnalysisPDFBtn,
    elements.exportGroupAnalysisPDFBtn,
    elements.printReportBtn,
  ];
  buttons.forEach((btn) => {
    if (btn && btn.hasAttribute && btn.hasAttribute('onclick')) {
      btn.removeAttribute('onclick');
    }
  });
}

/**
 * Sets up event listeners for all export buttons.
 * @private
 */
function _setupEventListeners() {
  if (!elements.page) return;

  // CSV Exports
  uiManager.addListener(elements.exportStudentsCSVBtn, 'click', _handleExportStudentsCSV);
  uiManager.addListener(elements.exportGroupsCSVBtn, 'click', _handleExportGroupsCSV);
  uiManager.addListener(elements.exportEvaluationsCSVBtn, 'click', _handleExportEvaluationsCSV);

  // Advanced Exports
  uiManager.addListener(elements.exportAllDataJSONBtn, 'click', _handleExportAllDataJSON);
  uiManager.addListener(elements.exportAllDataZipBtn, 'click', _handleExportAllDataZip);

  // PDF/Print Exports (call functions from analysis component via 'app')
  uiManager.addListener(elements.exportAnalysisPDFBtn, 'click', () => {
    if (app.components.analysis?.generateGroupAnalysisPDF) {
      uiManager.showToast('গ্রুপ বিশ্লেষণ PDF তৈরি হচ্ছে...', 'info');
      app.components.analysis.generateGroupAnalysisPDF();
    } else {
      uiManager.showToast('PDF এক্সপোর্টের জন্য বিশ্লেষণ মডিউল অনুপलब্ধ।', 'error');
    }
  });
  uiManager.addListener(elements.exportGroupAnalysisPDFBtn, 'click', () => {
    if (app.components.analysis?.generateSelectedGroupPDF) {
      uiManager.showToast('নির্বাচিত গ্রুপের PDF তৈরি হচ্ছে...', 'info');
      app.components.analysis.generateSelectedGroupPDF();
    } else if (app.components.analysis?.generateGroupAnalysisPDF) {
      uiManager.showToast('নির্বাচিত গ্রুপের PDF নেই; পুরো রিপোর্ট এক্সপোর্ট করা হচ্ছে।', 'warning');
      app.components.analysis.generateGroupAnalysisPDF();
    } else {
      uiManager.showToast('প্রিন্টের জন্য বিশ্লেষণ মডিউল অনুপलब্ধ।', 'error');
    }
  });
  uiManager.addListener(elements.printReportBtn, 'click', () => {
    if (app.components.analysis?.printGroupAnalysis) {
      app.components.analysis.printGroupAnalysis();
    } else {
      uiManager.showToast('প্রিন্টের জন্য বিশ্লেষণ মডিউল অনুপलब্ধ।', 'error');
    }
  });
}

/**
 * Updates the statistics cards on the export page.
 * @private
 */
function _updateStats() {
  const { students, groups, evaluations } = stateManager.getState();
  const setText = (el, val) => {
    if (el) el.textContent = helpers.convertToBanglaNumber(val);
  };

  setText(elements.totalStudentsCount, students?.length || 0);
  setText(elements.totalGroupsCount, groups?.length || 0);
  setText(elements.totalEvaluationsCount, evaluations?.length || 0);

  const lastExport = localStorage.getItem('lastExportTimestamp');
  if (elements.lastExportTime) {
    elements.lastExportTime.textContent = lastExport
      ? new Date(lastExport).toLocaleTimeString('bn-BD', { hour: 'numeric', minute: '2-digit' })
      : '-';
  }
}

// --- Export Handlers ---

/**
 * Exports students data as CSV.
 * @private
 */
async function _handleExportStudentsCSV() {
  uiManager.showLoading('শিক্ষার্থী CSV এক্সপোর্ট হচ্ছে...');
  try {
    const students = stateManager.get('students') || [];
    const groups = stateManager.get('groups') || [];
    const groupsMap = new Map(groups.map((g) => [g.id, g.name]));

    const dataToExport = students
      .map((s) => ({
        নাম: s.name,
        রোল: s.roll,
        লিঙ্গ: s.gender,
        'একাডেমিক গ্রুপ': s.academicGroup,
        সেশন: s.session,
        যোগাযোগ: s.contact || '',
        'গ্রুপের নাম': groupsMap.get(s.groupId) || '',
        'দায়িত্ব কোড': s.role || '',
      }))
      .sort((a, b) => (a['নাম'] || '').localeCompare(b['নাম'] || '', 'bn'));

    if (dataToExport.length === 0) {
      uiManager.showToast('এক্সপোর্ট করার মতো শিক্ষার্থীর ডেটা নেই।', 'info');
      return;
    }

    const csv = Papa.unparse(dataToExport, { header: true });
    _triggerDownload(csv, 'students_export.csv', 'text/csv;charset=utf-8;');
    uiManager.showToast('শিক্ষার্থী CSV ফাইল ডাউনলোড শুরু হয়েছে।', 'success');
  } catch (error) {
    console.error('❌ Error exporting students CSV:', error);
    uiManager.showToast(`CSV এক্সপোর্ট করতে সমস্যা: ${error.message}`, 'error');
  } finally {
    uiManager.hideLoading();
    _updateLastExportTime();
  }
}

/**
 * Exports groups data as CSV.
 * @private
 */
async function _handleExportGroupsCSV() {
  uiManager.showLoading('গ্রুপ CSV এক্সপোর্ট হচ্ছে...');
  try {
    const groups = stateManager.get('groups') || [];
    const students = stateManager.get('students') || [];

    const dataToExport = groups
      .map((g) => ({
        'গ্রুপের নাম': g.name,
        'শিক্ষার্থী সংখ্যা': students.filter((s) => s.groupId === g.id).length,
      }))
      .sort((a, b) => (a['গ্রুপের নাম'] || '').localeCompare(b['গ্রুপের নাম'] || '', 'bn'));

    if (dataToExport.length === 0) {
      uiManager.showToast('এক্সপোর্ট করার মতো গ্রুপের ডেটা নেই।', 'info');
      return;
    }

    const csv = Papa.unparse(dataToExport, { header: true });
    _triggerDownload(csv, 'groups_export.csv', 'text/csv;charset=utf-8;');
    uiManager.showToast('গ্রুপ CSV ফাইল ডাউনলোড শুরু হয়েছে।', 'success');
  } catch (error) {
    console.error('❌ Error exporting groups CSV:', error);
    uiManager.showToast(`CSV এক্সপোর্ট করতে সমস্যা: ${error.message}`, 'error');
  } finally {
    uiManager.hideLoading();
    _updateLastExportTime();
  }
}

/**
 * Exports detailed evaluations data as CSV.
 * @private
 */
async function _handleExportEvaluationsCSV() {
  uiManager.showLoading('মূল্যায়ন CSV এক্সপোর্ট হচ্ছে...');
  try {
    const evaluations = stateManager.get('evaluations') || [];
    const students = stateManager.get('students') || [];
    const tasks = stateManager.get('tasks') || [];
    const groups = stateManager.get('groups') || [];

    const studentsMap = new Map(students.map((s) => [s.id, s]));
    const tasksMap = new Map(tasks.map((t) => [t.id, t]));
    const groupsMap = new Map(groups.map((g) => [g.id, g.name]));

    const dataToExport = [];

    evaluations.forEach((ev) => {
      const task = tasksMap.get(ev.taskId);
      const groupName = groupsMap.get(ev.groupId) || ev.groupName || '';
      const taskName = task?.name || ev.taskName || '';
      const taskDate = task?.date || ev.taskDate || '';
      const { display: taskDateDisplay, sortValue: taskDateSort } = _normalizeDateForExport(taskDate);
      const maxScore =
        Number.parseFloat(ev.maxPossibleScore) ||
        Number.parseFloat(task?.maxScore) ||
        (typeof TOTAL_MAX_SCORE !== 'undefined' ? TOTAL_MAX_SCORE : '');

      if (ev?.scores && typeof ev.scores === 'object') {
        Object.entries(ev.scores).forEach(([studentId, scoreData = {}]) => {
          const student = studentsMap.get(String(studentId));
          if (!student) return;

          const row = {
            [EVAL_LABELS.TASK_NAME]: taskName,
            [EVAL_LABELS.GROUP_NAME]: groupName,
            [EVAL_LABELS.STUDENT_NAME]: student.name ?? '',
            [EVAL_LABELS.ROLL]: student.roll ?? '',
            [EVAL_LABELS.TASK_SCORE]: scoreData.taskScore ?? '',
            [EVAL_LABELS.TEAM_SCORE]: scoreData.teamScore ?? '',
            [EVAL_LABELS.MCQ_SCORE]: scoreData.mcqScore ?? '',
            [EVAL_LABELS.ADDITIONAL_SCORE]: scoreData.additionalScore ?? '',
            [EVAL_LABELS.TOTAL_SCORE]: scoreData.totalScore ?? '',
            [EVAL_LABELS.MAX_SCORE]: maxScore ?? '',
            [EVAL_LABELS.COMMENTS]: scoreData.comments ?? '',
            [EVALUATION_DATE_LABEL]: taskDateDisplay ?? '',
            __sortDate: taskDateSort ?? Number.NEGATIVE_INFINITY,
          };

          dataToExport.push(row);
        });
      }
    });

    if (dataToExport.length === 0) {
      uiManager.showToast('এক্সপোর্ট করার মতো মূল্যায়নের ডেটা নেই।', 'info');
      return;
    }

    // Sort: newest date, then group name, then roll (numeric-aware)
    dataToExport.sort((a, b) => {
      const diff = (b.__sortDate ?? Number.NEGATIVE_INFINITY) - (a.__sortDate ?? Number.NEGATIVE_INFINITY);
      if (diff !== 0) return diff;

      const groupDiff = String(a[EVAL_LABELS.GROUP_NAME] || '').localeCompare(
        String(b[EVAL_LABELS.GROUP_NAME] || ''),
        'bn'
      );
      if (groupDiff !== 0) return groupDiff;

      return String(a[EVAL_LABELS.ROLL] || '').localeCompare(String(b[EVAL_LABELS.ROLL] || ''), undefined, {
        numeric: true,
      });
    });

    dataToExport.forEach((row) => delete row.__sortDate);

    const csv = Papa.unparse(dataToExport, { header: true });
    _triggerDownload(csv, 'evaluations_export.csv', 'text/csv;charset=utf-8;');
    uiManager.showToast('মূল্যায়ন CSV ফাইল ডাউনলোড শুরু হয়েছে।', 'success');
  } catch (error) {
    console.error('❌ Error exporting evaluations CSV:', error);
    uiManager.showToast(`CSV এক্সপোর্ট করতে সমস্যা: ${error.message}`, 'error');
  } finally {
    uiManager.hideLoading();
    _updateLastExportTime();
  }
}

/**
 * Exports all core data as a single JSON file.
 * @private
 */
function _handleExportAllDataJSON() {
  uiManager.showLoading('JSON ফাইল তৈরি হচ্ছে...');
  try {
    const { groups, students, tasks, evaluations, admins } = stateManager.getState();
    const allData = {
      exportDate: new Date().toISOString(),
      groups,
      students,
      tasks,
      evaluations,
      // Conditionally add admins if current user is super-admin
      admins: stateManager.get('currentUserData')?.type === 'super-admin' ? admins : undefined,
    };

    const jsonString = JSON.stringify(allData, null, 2); // Pretty print
    _triggerDownload(jsonString, 'smart_evaluator_backup.json', 'application/json;charset=utf-8;');
    uiManager.showToast('সমস্ত ডেটার JSON ফাইল ডাউনলোড শুরু হয়েছে।', 'success');
  } catch (error) {
    console.error('❌ Error exporting all data JSON:', error);
    uiManager.showToast(`JSON এক্সপোর্ট করতে সমস্যা: ${error.message}`, 'error');
  } finally {
    uiManager.hideLoading();
    _updateLastExportTime();
  }
}

/**
 * Exports all data as separate CSVs within a single ZIP file.
 * @private
 */
async function _handleExportAllDataZip() {
  const JSZip = window.JSZip; // Get from global scope
  if (!JSZip) {
    uiManager.showToast('ZIP লাইব্রেরি (JSZip) লোড করা নেই।', 'error');
    console.error('JSZip library not found. Please include it in index.html');
    return;
  }

  uiManager.showLoading('ZIP ফাইল তৈরি হচ্ছে...');
  try {
    const zip = new JSZip();
    const { groups = [], students = [], tasks = [], evaluations = [] } = stateManager.getState();
    const bom = '\uFEFF'; // BOM for Excel Bengali support

    // 1. Students CSV
    const groupsMap = new Map(groups.map((g) => [g.id, g.name]));
    const studentsData = students
      .map((s) => ({
        নাম: s.name,
        রোল: s.roll,
        লিঙ্গ: s.gender,
        'একাডেমিক গ্রুপ': s.academicGroup,
        সেশন: s.session,
        যোগাযোগ: s.contact || '',
        'গ্রুপের নাম': groupsMap.get(s.groupId) || '',
        'দায়িত্ব কোড': s.role || '',
      }))
      .sort((a, b) => (a['নাম'] || '').localeCompare(b['নাম'] || '', 'bn'));
    if (studentsData.length > 0) zip.file('students.csv', bom + Papa.unparse(studentsData));

    // 2. Groups CSV
    const groupsData = groups
      .map((g) => ({
        'গ্রুপের নাম': g.name,
        'শিক্ষার্থী সংখ্যা': students.filter((s) => s.groupId === g.id).length,
      }))
      .sort((a, b) => (a['গ্রুপের নাম'] || '').localeCompare(b['গ্রুপের নাম'] || '', 'bn'));
    if (groupsData.length > 0) zip.file('groups.csv', bom + Papa.unparse(groupsData));

    // 3. Tasks CSV
    const tasksData = tasks
      .map((t) => {
        const { display: taskDateDisplay, sortValue: taskDateSort } = _normalizeDateForExport(t.date);
        const row = {
          'টাস্কের নাম': t.name,
          'মোট সর্বোচ্চ স্কোর': t.maxScore,
          ব্রেকডাউন_টাস্ক: t.maxScoreBreakdown?.task,
          ব্রেকডাউন_টিম: t.maxScoreBreakdown?.team,
          ব্রেকডাউন_অতিরিক্ত: t.maxScoreBreakdown?.additional,
          ব্রেকডাউন_MCQ: t.maxScoreBreakdown?.mcq,
          বিবরণ: t.description || '',
        };
        row[TASK_DATE_LABEL] = taskDateDisplay;
        row.__sortDate = taskDateSort;
        return row;
      })
      .sort((a, b) => {
        const diff = (b.__sortDate ?? Number.NEGATIVE_INFINITY) - (a.__sortDate ?? Number.NEGATIVE_INFINITY);
        if (diff !== 0) return diff;
        return String(a['টাস্কের নাম'] || '').localeCompare(String(b['টাস্কের নাম'] || ''), 'bn');
      });
    tasksData.forEach((row) => delete row.__sortDate);
    if (tasksData.length > 0) zip.file('tasks.csv', bom + Papa.unparse(tasksData));

    // 4. Evaluations CSV (Detailed) — same labels as single CSV
    const studentsMap = new Map(students.map((s) => [s.id, s]));
    const tasksMap = new Map(tasks.map((t) => [t.id, t]));
    const evaluationsData = [];

    evaluations.forEach((ev) => {
      const task = tasksMap.get(ev.taskId);
      const groupName = groupsMap.get(ev.groupId) || ev.groupName || '';
      const taskName = task?.name || ev.taskName || '';
      const taskDate = task?.date || ev.taskDate || '';
      const { display: taskDateDisplay, sortValue: taskDateSort } = _normalizeDateForExport(taskDate);
      const maxScore =
        Number.parseFloat(ev.maxPossibleScore) ||
        Number.parseFloat(task?.maxScore) ||
        (typeof TOTAL_MAX_SCORE !== 'undefined' ? TOTAL_MAX_SCORE : '');

      if (ev?.scores && typeof ev.scores === 'object') {
        Object.entries(ev.scores).forEach(([studentId, scoreData = {}]) => {
          const student = studentsMap.get(studentId);
          if (!student) return;

          const row = {
            [EVAL_LABELS.TASK_NAME]: taskName,
            [EVAL_LABELS.GROUP_NAME]: groupName,
            [EVAL_LABELS.STUDENT_NAME]: student.name ?? '',
            [EVAL_LABELS.ROLL]: student.roll ?? '',
            [EVAL_LABELS.TASK_SCORE]: scoreData.taskScore ?? '',
            [EVAL_LABELS.TEAM_SCORE]: scoreData.teamScore ?? '',
            [EVAL_LABELS.MCQ_SCORE]: scoreData.mcqScore ?? '',
            [EVAL_LABELS.ADDITIONAL_SCORE]: scoreData.additionalScore ?? '',
            [EVAL_LABELS.TOTAL_SCORE]: scoreData.totalScore ?? '',
            [EVAL_LABELS.MAX_SCORE]: maxScore ?? '',
            [EVAL_LABELS.COMMENTS]: scoreData.comments ?? '',
          };

          row[EVALUATION_DATE_LABEL] = taskDateDisplay ?? '';
          row.__sortDate = taskDateSort ?? Number.NEGATIVE_INFINITY;

          evaluationsData.push(row);
        });
      }
    });

    if (evaluationsData.length > 0) {
      evaluationsData.sort((a, b) => {
        const diff = (b.__sortDate ?? Number.NEGATIVE_INFINITY) - (a.__sortDate ?? Number.NEGATIVE_INFINITY);
        if (diff !== 0) return diff;

        const groupDiff = String(a[EVAL_LABELS.GROUP_NAME] || '').localeCompare(
          String(b[EVAL_LABELS.GROUP_NAME] || ''),
          'bn'
        );
        if (groupDiff !== 0) return groupDiff;

        return String(a[EVAL_LABELS.ROLL] || '').localeCompare(String(b[EVAL_LABELS.ROLL] || ''), undefined, {
          numeric: true,
        });
      });

      evaluationsData.forEach((row) => delete row.__sortDate);

      zip.file('evaluations_detailed.csv', bom + Papa.unparse(evaluationsData));
    }

    // Generate ZIP blob
    const content = await zip.generateAsync({ type: 'blob' });
    _triggerDownload(content, `smart_evaluator_backup_${new Date().toISOString().split('T')[0]}.zip`);
    uiManager.showToast('সমস্ত ডেটার ZIP ফাইল ডাউনলোড শুরু হয়েছে।', 'success');
  } catch (error) {
    console.error('❌ Error exporting all data ZIP:', error);
    uiManager.showToast(`ZIP এক্সপোর্ট করতে সমস্যা: ${error.message}`, 'error');
  } finally {
    uiManager.hideLoading();
    _updateLastExportTime();
  }
}

// --- Helper Functions ---

function _normalizeDateForExport(value) {
  if (value === null || value === undefined || value === '') {
    return { display: '', sortValue: Number.NEGATIVE_INFINITY };
  }

  let dateObj = null;
  if (value instanceof Date) {
    dateObj = value;
  } else if (typeof value === 'number') {
    dateObj = new Date(value);
  } else if (typeof value === 'string') {
    const parsed = Date.parse(value);
    if (!Number.isNaN(parsed)) dateObj = new Date(parsed);
  } else if (typeof value === 'object') {
    if (typeof value.toDate === 'function') {
      try {
        dateObj = value.toDate();
      } catch {
        dateObj = null;
      }
    } else if (typeof value.seconds === 'number') {
      dateObj = new Date(value.seconds * 1000);
    }
  }

  const display = helpers?.formatTimestamp
    ? helpers.formatTimestamp(dateObj || value)
    : dateObj
    ? dateObj.toISOString().split('T')[0]
    : String(value ?? '');

  let sortValue = Number.NEGATIVE_INFINITY;
  if (dateObj instanceof Date && !Number.isNaN(dateObj.getTime())) {
    sortValue = dateObj.getTime();
  } else if (typeof value === 'number' && Number.isFinite(value)) {
    sortValue = value;
  } else if (typeof value === 'string') {
    const parsed = Date.parse(value);
    if (!Number.isNaN(parsed)) sortValue = parsed;
  }

  return { display: display || '', sortValue };
}

/**
 * Creates and clicks a download link for a blob or string.
 * @param {Blob|string} content - The file content.
 * @param {string} fileName - The desired file name.
 * @param {string} [contentType] - MIME type.
 * @private
 */
function _triggerDownload(content, fileName, contentType = '') {
  // Add BOM for Excel UTF-8 support ONLY for CSV string content
  const finalContent = contentType.startsWith('text/csv') && typeof content === 'string' ? `\uFEFF${content}` : content;

  const blob = finalContent instanceof Blob ? finalContent : new Blob([finalContent], { type: contentType });

  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();

  // Clean up
  setTimeout(() => {
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }, 100);
}

/**
 * Updates the 'Last Export' time display and stores it.
 * @private
 */
function _updateLastExportTime() {
  const now = new Date();
  const timeString = now.toLocaleTimeString('bn-BD', { hour: 'numeric', minute: '2-digit' });
  if (elements.lastExportTime) {
    elements.lastExportTime.textContent = timeString;
  }
  localStorage.setItem('lastExportTimestamp', now.toISOString());
}
