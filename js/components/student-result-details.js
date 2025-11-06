/* global window, document */
(function () {
  'use strict';

  const modal = document.getElementById('studentDetailModal');
  if (!modal) {
    console.warn('[Modal] #studentDetailModal not found — script loaded but modal node is missing.');
    return;
  }

  // -------------------------------------------------------------------------
  // Utilities
  // -------------------------------------------------------------------------
  const bn = (n) => {
    try {
      return window.smartEvaluator?.utils?.convertToBanglaNumber(String(n)) ?? String(n);
    } catch {
      return String(n);
    }
  };

  const palette = (p) => {
    const v = Number(p) || 0;
    if (v >= 85)
      return {
        badge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/25 dark:text-emerald-300',
        chip: 'text-emerald-600',
      };
    if (v >= 70) return { badge: 'bg-sky-50 text-sky-700 dark:bg-sky-900/25 dark:text-sky-300', chip: 'text-sky-600' };
    if (v >= 55)
      return { badge: 'bg-amber-50 text-amber-700 dark:bg-amber-900/25 dark:text-amber-300', chip: 'text-amber-600' };
    return { badge: 'bg-rose-50 text-rose-700 dark:bg-rose-900/25 dark:text-rose-300', chip: 'text-rose-600' };
  };

  const fmt = (v, d = 2) => {
    const num = typeof v === 'number' ? v : parseFloat(v || 0);
    const safe = Number.isFinite(num) ? num : 0;
    return bn(safe.toFixed(d));
  };

  const closeModal = () => {
    if (!modal) return;
    modal.classList.add('hidden');
    if (modal.__chart) {
      try {
        modal.__chart.destroy();
      } catch {
        /* noop */
      }
      modal.__chart = null;
    }
  };

  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-modal-close]')) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && !modal.classList.contains('hidden')) closeModal();
  });

  const toLocaleDate = (date) => {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) return '-';
    try {
      return date.toLocaleDateString('bn-BD', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    }
  };

  
  // Pretty role label + badge color classes
  const prettyRole = (role) => {
    const map = {
      'team-leader': 'টিম লিডার',
      'time-keeper': 'টািইম কিপার',
      reporter: 'রিপোর্টার',
      'resource-manager': 'রিসোর্স ম্যানেজার',
      'peace-maker': 'পিস মেকার',
    };
    return map[role] || (role ? String(role) : '');
  };
  const roleBadgeClass = (role) => {
    switch (role) {
      case 'team-leader':
        return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-200 dark:border-amber-700/40';
      case 'time-keeper':
        return 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-900/20 dark:text-sky-200 dark:border-sky-700/40';
      case 'reporter':
        return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-200 dark:border-purple-700/40';
      case 'resource-manager':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-200 dark:border-emerald-700/40';
      case 'peace-maker':
        return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/20 dark:text-rose-200 dark:border-rose-700/40';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800/40 dark:text-gray-200 dark:border-gray-700/40';
    }
  };

  const escHtml = (s) => String(s)
 .replace(/</g, '&lt;')
 .replace(/>/g, '&gt;')
 .replace(/"/g, '&quot;')
 .replace(/'/g, '&#39;');

  // -------------------------------------------------------------------------
  // Main – open modal
  const englishify = (val) => String(val ?? '').replace(/[^\x20-\x7E]/g, '').trim();
  // -------------------------------------------------------------------------
  async function openStudentModalById(studentId) {
    try {
      console.debug('[Modal] openStudentModalById ->', studentId);
    } catch {}

    const app = window.smartEvaluator;
    if (!app) return;

    const state = app.managers?.stateManager?.getState?.() || {};
    const students = Array.isArray(state.students) ? state.students : [];
    const evaluations = Array.isArray(state.evaluations) ? state.evaluations : [];
    const tasks = Array.isArray(state.tasks) ? state.tasks : [];
    const groups = Array.isArray(state.groups) ? state.groups : [];

    const student = students.find((s) => s?.id === studentId);
    if (!student) return;

    const groupName = groups.find((g) => g?.id === student.groupId)?.name || '';
    const taskMap = new Map(tasks.map((t) => [t?.id, t]));

    // ---- Build evaluations ------------------------------------------------
    const evals = evaluations
      .map((ev) => {
        const score = ev?.scores?.[studentId];
        const task = taskMap.get(ev?.taskId);
        if (!score || !task) return null;

        const maxScore = parseFloat(ev?.maxPossibleScore) || parseFloat(task?.maxScore) || 100;
        const total = parseFloat(score?.totalScore) || 0;
        const taskScore = parseFloat(score?.taskScore) || 0;
        const teamScore = parseFloat(score?.teamScore) || 0;
        const additional = parseFloat(score?.additionalScore) || 0;
        const mcq = parseFloat(score?.mcqScore) || 0;
        const comments = typeof score?.comments === 'string' ? score.comments.trim() : '';
        const pct = maxScore > 0 ? (total / maxScore) * 100 : 0;

        const ms = ev?.taskDate?.seconds
          ? ev.taskDate.seconds * 1000
          : Number.isFinite(Date.parse(ev?.taskDate))
          ? Date.parse(ev.taskDate)
          : Number.isFinite(Date.parse(ev?.updatedAt))
          ? Date.parse(ev.updatedAt)
          : Number.isFinite(Date.parse(task?.date))
          ? Date.parse(task.date)
          : null;

        return {
          taskName: task?.name || '',
          date: ms ? new Date(ms) : null,
          taskScore,
          teamScore,
          additional,
          mcq,
          total,
          max: maxScore,
          pct,
          comments,
        };
      })
      .filter(Boolean)
      .sort((a, b) => (a.date?.getTime() ?? 0) - (b.date?.getTime() ?? 0));

    // ---- Rank -----------------------------------------------------------
    const avgPct = evals.length ? evals.reduce((s, r) => s + (r.pct || 0), 0) / evals.length : 0;
    let rankLabel = '-';
    try {
      const averages = students
        .map((st) => {
          const evs = evaluations
            .map((ev) => {
              const sc = ev?.scores?.[st?.id];
              const t = taskMap.get(ev?.taskId);
              if (!sc || !t) return null;
              const max = parseFloat(ev?.maxPossibleScore) || parseFloat(t?.maxScore) || 100;
              const tot = parseFloat(sc?.totalScore) || 0;
              return max > 0 ? (tot / max) * 100 : 0;
            })
            .filter((v) => typeof v === 'number');
          return { id: st?.id, avg: evs.length ? evs.reduce((a, b) => a + b, 0) / evs.length : -1 };
        })
        .filter((x) => (x?.avg ?? -1) >= 0)
        .sort((a, b) => b.avg - a.avg);

      const idx = averages.findIndex((x) => x?.id === studentId);
      if (idx >= 0) rankLabel = bn(idx + 1);
    } catch (e) {
      console.warn('[Modal] Rank computation failed:', e);
    }

    // ---- Fill header ----------------------------------------------------
    const setText = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val || '';
    };
    const setHtml = (id, html) => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = html;
    };

    const avEl = document.getElementById('sdmAvatar');
    if (avEl) {
      avEl.src = student.photoURL || student.avatar || 'images/smart.png';
      avEl.onerror = () => {
        avEl.onerror = null;
        avEl.src = 'images/smart.png';
      };
      avEl.alt = `${student.name || student.id || 'Student'} avatar`;
    }

    setText('sdmTitle', 'শিক্ষার্থীর ফলাফল');
    // sdmName with role badge will be set below
    setText('sdmRoll', student.roll ? `রোল: ${bn(student.roll)}` : '');
    const displayName = escHtml(student.name || student.id || '');


    const role = (student.role || '').toString().trim();


    const roleLabel = prettyRole(role);


    const roleClass = roleBadgeClass(role);


    const roleHtml = roleLabel ? "<span class=\"inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold " + roleClass + "\"><i class=\"fas fa-id-badge\"></i>" + escHtml(roleLabel) + "</span>" : "";


    setHtml("sdmName", "<span class=\"mr-2 align-middle\">" + displayName + "</span>" + roleHtml);


    setText('sdmGroup', groupName ? `গ্রুপ: ${groupName}` : '');
    setText('sdmAcademic', student.academicGroup ? `শিক্ষা বিভাগ: ${student.academicGroup}` : '');
    setText('sdmSession', student.session ? `সেশন: ${student.session}` : '');
    const hasContact = Boolean(student.email) || Boolean(student.contact);
    setText('sdmContact', hasContact ? `যোগাযোগ: ${student.email || ''} ${student.contact || ''}` : '');

    // ---- Parameter averages --------------------------------------------
    const count = Math.max(1, evals.length);
    const sums = evals.reduce(
      (acc, r) => {
        acc.task += r.taskScore || 0;
        acc.team += r.teamScore || 0;
        acc.additional += r.additional || 0;
        acc.mcq += r.mcq || 0;
        acc.total += r.total || 0;
        acc.pct += r.pct || 0;
        return acc;
      },
      { task: 0, team: 0, additional: 0, mcq: 0, total: 0, pct: 0 }
    );

    setText('sdmAvgTotal', fmt(sums.total / count));
    setText('sdmAvgPct', `${fmt(sums.pct / count, 1)}%`);
    setText('sdmRank', rankLabel);

    const plist = document.getElementById('sdmParamList');
    if (plist) {
      plist.innerHTML = '';
      const avgTotal = sums.total / count || 0;
      const items = [
        ['টাস্ক', sums.task / count],
        ['টিম', sums.team / count],
        ['অতিরিক্ত', sums.additional / count],
        ['MCQ', sums.mcq / count],
      ];
      items.forEach(([k, v]) => {
        const li = document.createElement('li');
        const ratioPct = avgTotal > 0 ? (v / avgTotal) * 100 : 0;
        const pal = palette(ratioPct);
        li.className = `rounded border border-gray-200 dark:border-gray-700 px-3 py-2 bg-white dark:bg-gray-800 ${pal.chip}`;
        li.textContent = `${k}: ${fmt(v)}`;
        plist.appendChild(li);
      });
    }

    // ---- Table ---------------------------------------------------------
    const tbody = document.getElementById('sdmTableBody');
    if (tbody) {
      tbody.innerHTML = '';
      evals.forEach((h) => {
        const tr = document.createElement('tr');
        const dateLabel = h.date ? toLocaleDate(h.date) : '-';
        const pal = palette(h.pct);
        tr.innerHTML = `
          <td class="px-3 py-2">${escHtml(h.taskName || '-')}</td>
          <td class="px-3 py-2">
            <span class="inline-block rounded px-2 py-0.5 text-xs font-medium bg-sky-50 text-sky-700 dark:bg-sky-900/20 dark:text-sky-300">${fmt(h.taskScore)}</span>
          </td>
          <td class="px-3 py-2">
            <span class="inline-block rounded px-2 py-0.5 text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300">${fmt(h.teamScore)}</span>
          </td>
          <td class="px-3 py-2">
            <span class="inline-block rounded px-2 py-0.5 text-xs font-medium bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300">${fmt(h.additional)}</span>
          </td>
          <td class="px-3 py-2">
            <span class="inline-block rounded px-2 py-0.5 text-xs font-medium bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300">${fmt(h.mcq)}</span>
          </td>
          <td class="px-3 py-2">${fmt(h.total)}</td>
          <td class="px-3 py-2"><span class="inline-block rounded px-2 py-0.5 text-xs font-semibold ${pal.badge}">${fmt(
          h.pct,
          1
        )}%</span></td>
          <td class="px-3 py-2">${escHtml(h.comments || '')}</td>
          <td class="px-3 py-2">${escHtml(dateLabel)}</td>`;
        tbody.appendChild(tr);
      });
    }

    // ---- Chart ---------------------------------------------------------
    const canvas = document.getElementById('sdmChart');
    if (canvas && window.Chart) {
      if (modal.__chart) {
        try {
          modal.__chart.destroy();
        } catch {}
        modal.__chart = null;
      }
      const labels = evals.map((r) => r.taskName || (r.date ? toLocaleDate(r.date) : 'N/A'));
      const values = evals.map((r) => Number((r.pct || 0).toFixed(1)));
      const colors = values.map((_, i, a) => (i === a.length - 1 ? '#22c55e' : '#94a3b8'));

      modal.__chart = new window.Chart(canvas, {
        type: 'bar',
        data: {
          labels,
          datasets: [
            {
              data: values,
              backgroundColor: colors,
              borderRadius: 6,
              maxBarThickness: 32,
              categoryPercentage: 0.6,
              barPercentage: 0.8,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: { duration: 250 },
          plugins: { legend: { display: false }, tooltip: { displayColors: false } },
          layout: { padding: 4 },
          scales: {
            x: { grid: { display: false }, ticks: { maxRotation: 0, autoSkip: true, autoSkipPadding: 8 } },
            y: {
              beginAtZero: true,
              max: 100,
              grace: '5%',
              grid: { color: 'rgba(148,163,184,0.25)' },
              ticks: { stepSize: 20, callback: (v) => bn(v) },
            },
          },
        },
      });
    }

    // ---- Store context for downloads -----------------------------------
    modal.__evals = evals;
    modal.__student = student;
    modal.__groupName = groupName;
    modal.__avgPct = sums.pct / count;
    modal.__avgTotal = sums.total / count;
    modal.__rank = rankLabel !== '-' ? rankLabel : null;

    // ---- Table / Chart toggle -----------------------------------------
    const btnT = document.getElementById('sdmBtnTable');
    const btnC = document.getElementById('sdmBtnChart');
    const wrapT = document.getElementById('sdmTableWrap');
    const wrapC = document.getElementById('sdmChartWrap');

    const setMode = (mode) => {
      const chart = mode === 'chart';
      wrapC?.classList.toggle('hidden', !chart);
      wrapT?.classList.toggle('hidden', chart);
      btnT?.classList.toggle('bg-gray-100', !chart);
      btnT?.classList.toggle('dark:bg-gray-800', !chart);
      btnC?.classList.toggle('bg-gray-100', chart);
      btnC?.classList.toggle('dark:bg-gray-800', chart);
    };
    btnT?.addEventListener('click', () => setMode('table'));
    btnC?.addEventListener('click', () => setMode('chart'));
    setMode('table');

    // ---- Footnote ------------------------------------------------------
    const foot = document.getElementById('sdmFootnote');
    if (foot) foot.textContent = `${bn(evals.length)} টি মূল্যায়নের তথ্য দেখানো হচ্ছে`;

    // ---- Show modal ----------------------------------------------------
    modal.classList.remove('hidden');
  }

  // -------------------------------------------------------------------------
  // Global exposure
  // -------------------------------------------------------------------------
  window.openStudentModalById = openStudentModalById;

  // Click delegation for ranking cards / buttons
  document.addEventListener('click', (e) => {
    const el = e.target.closest('.ranking-card') || e.target.closest('.view-rank-details-btn');
    if (!el) return;
    const id = el.getAttribute('data-student-id');
    if (id) {
      e.preventDefault();
      openStudentModalById(id);
    }
  });

  // -------------------------------------------------------------------------
  // CSV download
  // -------------------------------------------------------------------------
  const btnCsv = document.getElementById('sdmDownloadCsv');
  btnCsv?.addEventListener('click', () => {
    if (!modal) return;
    const evs = modal.__evals || [];
    const st = modal.__student || {};
    if (!evs.length) return;

    const headers = ['Title', 'Task', 'Team', 'Additional', 'MCQ', 'Total', 'Percent', 'Comments', 'Date'];
    const rows = evs.map((h) => [
      h.taskName || '',
      Number(h.taskScore || 0).toFixed(2),
      Number(h.teamScore || 0).toFixed(2),
      Number(h.additional || 0).toFixed(2),
      Number(h.mcq || 0).toFixed(2),
      Number(h.total || 0).toFixed(2),
      Number(h.pct || 0).toFixed(1),
      (h.comments || '').replace(/\r?\n/g, ' '),
      h.date ? new Date(h.date).toISOString().slice(0, 10) : '',
    ]);

    const encode = (x) => {
      const s = String(x ?? '');
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };

    const csv = [headers.map(encode).join(','), ...rows.map((r) => r.map(encode).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${st.name || st.id || 'student'}_report.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });

  // -------------------------------------------------------------------------
  // PDF download (single, clean implementation)
  // -------------------------------------------------------------------------
  const btnPdf = document.getElementById('sdmDownloadPdf');
  btnPdf?.addEventListener('click', () => {
    if (!modal) return;
    const evs = modal.__evals || [];
    const st = modal.__student || {};
    if (!evs.length) return;

    try {
      const jsPDF = window.jspdf?.jsPDF || window.jsPDF;
      if (!jsPDF) throw new Error('jsPDF not loaded');

      const doc = new jsPDF('p', 'pt', 'a4');
      const M = 36; // margin
      const PAGE_W = doc.internal.pageSize.getWidth();
      const PAGE_H = doc.internal.pageSize.getHeight();
      const BRAND_BG = [79, 70, 229]; // indigo-600

      // ---- Helpers ----------------------------------------------------
      const line = (x1, y1, x2, y2, c = [226, 232, 240]) => {
        doc.setDrawColor(...c);
        doc.line(x1, y1, x2, y2);
      };
      const text = (t, x, y, opt = {}) => doc.text(t, x, y, opt);
      // Convert Bengali digits to ASCII digits for English-only numeric output
      const toAsciiDigits = (val) => {
        const s = String(val ?? '');
        const map = { '০':'0','১':'1','২':'2','৩':'3','৪':'4','৫':'5','৬':'6','৭':'7','৮':'8','৯':'9' };
        return s.replace(/[০-৯]/g, (d) => map[d] || d);
      };
      // Draw Unicode (e.g., Bengali) text via canvas image to ensure rendering in PDF
      const drawUnicodeText = (str, x, y, maxW = 200, fontPx = 10, color = '#0f172a') => {
        try {
          const s = String(str ?? '');
          if (!s) return;
          const scale = 2; // retina for crisper text
          // create canvas to measure and draw
          const c = document.createElement('canvas');
          const ctx = c.getContext('2d');
          ctx.font = `${fontPx * scale}px 'Noto Sans Bengali', 'Hind Siliguri', 'SolaimanLipi', 'Segoe UI', sans-serif`;
          // simple single-line measurement (name is generally short)
          const metrics = ctx.measureText(s);
          const pad = 6 * scale;
          c.width = Math.ceil(metrics.width) + pad;
          c.height = Math.ceil(fontPx * 1.6 * scale) + pad;
          // repaint font settings after resize
          const ctx2 = c.getContext('2d');
          ctx2.font = `${fontPx * scale}px 'Noto Sans Bengali', 'Hind Siliguri', 'SolaimanLipi', 'Segoe UI', sans-serif`;
          ctx2.fillStyle = color;
          ctx2.textBaseline = 'top';
          ctx2.fillText(s, pad / 2, pad / 2);
          const dataUrl = c.toDataURL('image/png');
          // scale to fit maxW in PDF points
          const imgWpx = c.width, imgHpx = c.height;
          // assume 96 DPI canvas → 72 pt per inch conversion: pt = px * 72/96 = px * 0.75
          const ptPerPx = 0.75;
          let pdfW = imgWpx * ptPerPx;
          let pdfH = imgHpx * ptPerPx;
          if (pdfW > maxW) {
            const r = maxW / pdfW; pdfW = maxW; pdfH = pdfH * r;
          }
          doc.addImage(dataUrl, 'PNG', x, y - (fontPx * 0.8), pdfW, pdfH);
        } catch (e) { /* fallback: ignore */ }
      };
      const heading = (t, y) => {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        text(t, M, y);
      };
      const kv = (k, v, y) => {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        text(k, M, y);
        doc.setFont('helvetica', 'normal');
        const valX = M + 120;
        const available = (PAGE_W - M * 2) / 2 - (valX - M) - 12; // within left column box
        const hasUnicode = /[^\x00-\x7F]/.test(String(v || ''));
        if (hasUnicode) {
          drawUnicodeText(v, valX, y, available, 10);
        } else {
          text(String(v ?? ''), valX, y);
        }
      };
      const wrap = (t, w) => doc.splitTextToSize(t, w);

      // ---- Header / Footer (drawn on every page) ----------------------
      const headerHeight = 84;
      const footerHeight = 28;
      const drawHeader = () => {
        doc.setFillColor(...BRAND_BG);
        doc.rect(M, M, PAGE_W - M * 2, headerHeight - 20, 'F');
        doc.setTextColor(255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        text('SMART EVALUATE Automated SYSTEM', PAGE_W / 2, M + 18, { align: 'center' });
        doc.setFontSize(14);
        text('Student Result Report', PAGE_W / 2, M + 36, { align: 'center' });

        const g = new Date();
        const genStr = `Generated: ${g.getFullYear()}-${String(g.getMonth() + 1).padStart(2, '0')}-${String(
          g.getDate()
        ).padStart(2, '0')} ${String(g.getHours()).padStart(2, '0')}:${String(g.getMinutes()).padStart(2, '0')}`;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(107, 114, 128); // gray-600
        doc.setFillColor(255, 255, 255); // white
        doc.rect(PAGE_W - M - 175, M - 18, 170, 16, 'F'); // white background for timestamp
        text(genStr, PAGE_W - M - 170, M - 6); // timestamp text
        line(M, M + headerHeight - 12, PAGE_W - M, M + headerHeight - 12);
      };
      const drawFooter = () => {
        const y = PAGE_H - footerHeight;
        line(M, y, PAGE_W - M, y);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(107, 114, 128);
        text(`Page ${doc.internal.getCurrentPageInfo().pageNumber}`, PAGE_W - M - 40, PAGE_H - 10);
      };

      const addHeaderFooter = () => {
        const total = doc.internal.getNumberOfPages();
        for (let i = 1; i <= total; i++) {
          doc.setPage(i);
          drawHeader();
          drawFooter();
        }
      };

      // ---- Institution & Developer ------------------------------------
      let y = M + headerHeight + 6;
      const institution = 'Institution: Muktijoddha Major Mostofa College, Rajapur, Mirsharai, Chattogram';
      const developer = 'Developed by: Mustafa Rahman Sir, Senior Software Engineer';
      const devContact = 'Query for Contact: 01840-643946';

      doc.setTextColor(17, 24, 39);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      text(wrap(institution, PAGE_W - M * 2), M, y);
      y += 22;

      const cardH = 40;
      doc.setDrawColor(99, 102, 241);
      doc.setFillColor(238, 242, 255);
      doc.rect(M, y, PAGE_W - M * 2, cardH, 'FD');
      doc.setTextColor(55, 48, 163);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      text(developer, M + 10, y + 16);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      text(devContact, M + 10, y + 30);
      y += cardH + 10;

      // ---- Student summary box ----------------------------------------
      const infoH = 96;
      doc.setDrawColor(226, 232, 240);
      doc.setFillColor(248, 250, 252);
      doc.rect(M, y, PAGE_W - M * 2, infoH, 'FD');

      const colW = (PAGE_W - M * 2) / 2;
      const leftX = M + 12,
        rightX = M + colW + 12;
      const lineBase = y + 20;
      doc.setTextColor(15, 23, 42);

      kv('Student:', st.name || st.id || '', lineBase);
      kv('Roll:', st.roll || '-', lineBase + 16);
      kv('Group:', modal.__groupName || '-', lineBase + 32);
      // Duty (Role) in English
      const dutyRaw = (typeof prettyRole === 'function' ? prettyRole(st.role) : (st.role || '-')) || '-';
      const dutyEn = englishify(dutyRaw) || '-';
      kv('Duty:', dutyEn, lineBase + 48);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      text('Average Total:', rightX, lineBase);
      doc.setFont('helvetica', 'normal');
      text(String((modal.__avgTotal || 0).toFixed(2)), rightX + 90, lineBase);
      doc.setFont('helvetica', 'bold');
      text('Average %:', rightX, lineBase + 16);
      doc.setFont('helvetica', 'normal');
      text(`${(modal.__avgPct || 0).toFixed(1)}%`, rightX + 90, lineBase + 16);
      doc.setFont('helvetica', 'bold');
      text('Rank:', rightX, lineBase + 32);
      doc.setFont('helvetica', 'normal');
      // Always show rank in English (ASCII digits)
      const rankAscii = toAsciiDigits(modal.__rank ?? '-');
      text(rankAscii, rightX + 90, lineBase + 32);

      y += infoH + 14;

      // ---- Table ------------------------------------------------------
      const head = [['Assignment', 'Task', 'Team', 'Additional', 'MCQ', 'Total', '%', 'Comments', 'Date']];
      const body = evs.map((h, i) => {
        const comment = (h.comments || '').replace(/\r?\n/g, ' ').trim();
        const short = comment.length > 240 ? 'Comment too long. See in app.' : comment;
        return [
          `Assignment-${i + 1}`,
          Number(h.taskScore || 0).toFixed(2),
          Number(h.teamScore || 0).toFixed(2),
          Number(h.additional || 0).toFixed(2),
          Number(h.mcq || 0).toFixed(2),
          Number(h.total || 0).toFixed(2),
          Number(h.pct || 0).toFixed(1),
          short,
          h.date ? new Date(h.date).toISOString().slice(0, 10) : '',
        ];
      });

      const autoTable = doc.autoTable || window.autoTable;
      if (!autoTable) throw new Error('autoTable plugin missing');

      doc.autoTable({
        startY: y,
        head,
        body,
        styles: { font: 'helvetica', fontSize: 9, cellPadding: 4, lineWidth: 0.25, lineColor: [226, 232, 240] },
        headStyles: { fillColor: BRAND_BG, textColor: 255, halign: 'left' },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        columnStyles: {
          0: { cellWidth: 64 },
          1: { cellWidth: 44, halign: 'right' },
          2: { cellWidth: 44, halign: 'right' },
          3: { cellWidth: 50, halign: 'right' },
          4: { cellWidth: 40, halign: 'right' },
          5: { cellWidth: 48, halign: 'right' },
          6: { cellWidth: 30, halign: 'right' },
          7: { cellWidth: 120 },
          8: { cellWidth: 80, halign: 'center'  },
        },
        margin: { left: M, right: M, top: M + headerHeight, bottom: footerHeight + 6 },
        tableWidth: PAGE_W - M * 2,
        pageBreak: 'auto',
      });

      // ---- Final header/footer on every page -------------------------
      addHeaderFooter();

      doc.save(`${st.name || st.id || 'student'}_report.pdf`);
    } catch (e) {
      console.error('PDF generation error:', e);
    }
  });

  // -------------------------------------------------------------------------
  // Fallback avatar fix
  // -------------------------------------------------------------------------
  document.querySelectorAll('img[src="avatar.png"]').forEach((img) => {
    img.src = 'images/smart.png';
    img.onerror = () => {
      img.onerror = null;
      img.src = 'images/smart.png';
    };
  });
})();
