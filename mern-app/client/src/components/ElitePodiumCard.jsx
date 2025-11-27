import React from 'react';
import { toBanglaNumber } from '../utils/rankingUtils';

const ElitePodiumCard = ({ group, rank, onClick }) => {
  const isFirst = rank === 1;
  const isSecond = rank === 2;
  const isThird = rank === 3;

  let containerClasses = "relative rounded-2xl p-3 md:p-4 shadow-lg cursor-pointer transition-transform hover:scale-[1.02] flex flex-col justify-between h-full";
  let rankIcon = "";
  let rankLabel = "";

  if (isFirst) {
    containerClasses += " bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-500 text-white ring-2 ring-yellow-300/60 dark:ring-yellow-400/50 order-1 md:order-2 z-10 md:-mt-4";
    rankIcon = "fa-crown text-amber-200";
    rankLabel = "১ম";
  } else if (isSecond) {
    containerClasses += " bg-gradient-to-br from-gray-100 via-gray-200 to-slate-200 dark:from-slate-600 dark:via-slate-500 dark:to-slate-600 text-gray-900 dark:text-gray-100 ring-1 ring-slate-300/60 dark:ring-slate-400/40 order-2 md:order-1";
    rankIcon = "fa-medal text-slate-400 dark:text-slate-300";
    rankLabel = "২য়";
  } else {
    containerClasses += " bg-gradient-to-br from-amber-200 via-orange-300 to-amber-400 dark:from-amber-700 dark:via-orange-600 dark:to-amber-700 text-gray-900 dark:text-white ring-1 ring-amber-300/60 dark:ring-amber-500/50 order-3 md:order-3";
    rankIcon = "fa-award text-amber-700 dark:text-amber-200";
    rankLabel = "৩য়";
  }

  const latestStats = group.latestStats || { avg: 0, participants: 0, rate: 0 };

  return (
    <article className={containerClasses} onClick={onClick}>
      {/* Rank Chip */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-1.5 bg-white shadow-md px-3 py-1 rounded-full border border-gray-100 z-20">
        <i className={`fa-solid ${rankIcon} text-sm`}></i>
        <span className="text-sm font-bold uppercase tracking-wider text-gray-800">{rankLabel}</span>
      </div>

      {/* Group Info */}
      <div className="mt-6 mb-3 text-center">
        <h3 className={`font-bold leading-tight mb-1 ${isFirst ? 'text-lg md:text-xl' : 'text-base md:text-lg'}`}>
          {group.name}
        </h3>
        <p className={`text-xs font-medium ${isFirst ? 'text-white/90' : 'text-gray-600 dark:text-gray-300'}`}>
          গড়: <span className="font-bold text-sm">{toBanglaNumber(group.avgScore.toFixed(1))}%</span>
        </p>
      </div>

      {/* Latest Metrics */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-2 border border-white/10">
        <div className="flex items-center gap-1.5 mb-2 opacity-80">
          <i className="fas fa-chart-line text-[10px]"></i>
          <p className="text-[9px] font-bold uppercase tracking-wider">সর্বশেষ</p>
        </div>
        
        <div className="flex justify-between gap-1.5">
          <div className="flex flex-col items-center bg-white/20 rounded-lg p-1 flex-1">
            <span className="text-[9px] opacity-75 mb-0.5">ফলাফল</span>
            <span className="text-xs font-bold">{toBanglaNumber(latestStats.avg)}%</span>
          </div>
          <div className="flex flex-col items-center bg-white/20 rounded-lg p-1 flex-1">
            <span className="text-[9px] opacity-75 mb-0.5">অংশগ্রহণ</span>
            <span className="text-xs font-bold">{toBanglaNumber(latestStats.participants)}</span>
          </div>
          <div className="flex flex-col items-center bg-white/20 rounded-lg p-1 flex-1">
            <span className="text-[9px] opacity-75 mb-0.5">হার</span>
            <span className="text-xs font-bold">{toBanglaNumber(latestStats.rate)}%</span>
          </div>
        </div>
      </div>
    </article>
  );
};

export default ElitePodiumCard;
