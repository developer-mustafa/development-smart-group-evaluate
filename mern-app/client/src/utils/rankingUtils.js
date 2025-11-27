export const toBanglaNumber = (num) => {
  if (num === null || num === undefined) return '';
  const map = { '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪', '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯' };
  return num.toString().replace(/[0-9]/g, (d) => map[d]);
};

export const toBanglaRank = (n) => {
  const ordinalMap = { 1: '১ম', 2: '২য়', 3: '৩য়', 4: '৪র্থ', 5: '৫ম', 6: '৬ষ্ঠ', 7: '৭ম', 8: '৮ম', 9: '৯ম', 10: '১০ম' };
  if (ordinalMap[n]) {
    return ordinalMap[n] + ' র‍্যাঙ্ক';
  }
  return toBanglaNumber(n) + 'তম র‍্যাঙ্ক';
};

export const getScorePalette = (score) => {
  const n = Number(score) || 0;
  if (n >= 85) return { solid: '#16a34a', shadow: 'rgba(22,163,74,.35)', grad: 'linear-gradient(90deg,#16a34a 0%,#22c55e 40%,#86efac 100%)' }; // Green
  if (n >= 70) return { solid: '#0284c7', shadow: 'rgba(2,132,199,.30)', grad: 'linear-gradient(90deg,#0284c7 0%,#0ea5e9 40%,#7dd3fc 100%)' }; // Sky
  if (n >= 55) return { solid: '#d97706', shadow: 'rgba(217,119,6,.35)', grad: 'linear-gradient(90deg,#d97706 0%,#f59e0b 40%,#facc15 100%)' }; // Amber
  return { solid: '#e11d48', shadow: 'rgba(225,29,72,.40)', grad: 'linear-gradient(90deg,#e11d48 0%,#f43f5e 40%,#fb7185 100%)' }; // Rose
};
