import React from 'react';
import { Log } from '@/features/log/domain/model/log';
import { Level } from '@/features/log/domain/model/level';
import { useMainScreenViewModel } from '@/features/main/presentation/main-screen-viewmodel';

interface LogRowProps {
  log: Log;
}

export const LogRowComponent: React.FC<LogRowProps> = ({ log }) => {
  const selectedLogIds = useMainScreenViewModel((state) => state.selectedLogIds);
  const selectLog = useMainScreenViewModel((state) => state.selectLog);
  const unselectLog = useMainScreenViewModel((state) => state.unselectLog);

  const isChecked = selectedLogIds.includes(log.id);

  const handleCheckboxChange = () => {
    if (isChecked) {
      unselectLog(log.id);
    } else {
      selectLog(log.id);
    }
  };

  // Level badge styling mapper
  const getLevelBadgeClass = (level: Level) => {
    switch (level) {
      case Level.ERROR:
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      case Level.WARN:
        return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case Level.DEBUG:
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      default:
        return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
    }
  };

  return (
    <div className="flex items-center gap-4 px-4 py-2 border-b border-zinc-800 hover:bg-zinc-900/50 transition-colors text-sm font-mono text-zinc-300 min-w-[900px]">
      {/* 1. Selection Box Container */}
      <div className="flex items-center justify-center w-5 h-5 flex-shrink-0">
        <input
          type="checkbox"
          checked={isChecked}
          onChange={handleCheckboxChange}
          className="w-4 h-4 rounded border-zinc-700 bg-zinc-950 text-blue-600 focus:ring-blue-500 focus:ring-offset-zinc-950 cursor-pointer"
        />
      </div>

      {/* 2. Log ID Identification Index */}
      <div className="w-12 text-zinc-500 flex-shrink-0 text-right select-none">{log.id}</div>

      {/* 3. Operational Milestone Content Text Message Block */}
      <div className="flex-1 min-w-0 truncate pr-4 text-zinc-100" title={log.message}>
        {log.message}
      </div>

      {/* 4. Stream Filtering Level Identity Tag Badge */}
      <div className="w-20 flex-shrink-0">
        <span
          className={`px-2 py-0.5 text-xs font-semibold rounded border uppercase tracking-wider ${getLevelBadgeClass(log.level)}`}
        >
          {log.level}
        </span>
      </div>

      {/* 5. Target Boundary Structural Executable Call Trackers */}
      <div className="w-40 truncate text-blue-400 flex-shrink-0" title={log.functionName}>
        {log.functionName}
      </div>

      {/* 6. Context Code Engine Domain Mapping Identifiers */}
      <div
        className="w-48 truncate text-purple-400 flex-shrink-0"
        title={`${log.className}:${log.line}`}
      >
        {log.className}
        <span className="text-zinc-600 font-sans">:{log.line}</span>
      </div>
    </div>
  );
};
