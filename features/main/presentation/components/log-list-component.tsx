import React, { useEffect } from 'react';
import { useMainScreenViewModel } from '@/features/main/presentation/main-screen-viewmodel';
import { LogRowComponent } from './log-row-component';

export const LogListComponent: React.FC = () => {
  const logs = useMainScreenViewModel((state) => state.logs);
  const isLoadingLogs = useMainScreenViewModel((state) => state.isLoadingLogs);
  const initViewModel = useMainScreenViewModel((state) => state.initViewModel);

  // Initialize and tear down reactive data stream pipelines inside useEffect
  useEffect(() => {
    const teardown = initViewModel();
    return () => teardown();
  }, [initViewModel]);

  if (isLoadingLogs && logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full py-12 text-zinc-500 font-mono">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4" />
        Streaming pipeline processing context...
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="flex items-center justify-center h-full w-full py-12 text-zinc-500 font-mono border border-dashed border-zinc-800 rounded-lg">
        No active trace records available. Select a session to initialize.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden">
      {/* Table Head Specification Index */}
      <div className="flex items-center gap-4 px-4 py-2 bg-zinc-900 border-b border-zinc-800 text-xs font-bold uppercase tracking-wider text-zinc-500 font-mono min-w-[900px] select-none">
        <div className="w-5 flex-shrink-0 text-center">Sel</div>
        <div className="w-12 flex-shrink-0 text-right">ID</div>
        <div className="flex-1">Message Content</div>
        <div className="w-20 flex-shrink-0">Level</div>
        <div className="w-40 flex-shrink-0">Function</div>
        <div className="w-48 flex-shrink-0">Class Reference</div>
      </div>

      {/* Structural Scrollable Viewport Frame Box Container Layer */}
      <div className="flex-1 overflow-x-auto overflow-y-auto divide-y divide-zinc-900 custom-scrollbar">
        {logs.map((log) => (
          <LogRowComponent key={log.id} log={log} />
        ))}
      </div>
    </div>
  );
};
