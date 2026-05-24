'use client';

import { useDrawerScreenViewModel } from '../drawer-screen-viewmodel';

export function SessionsListComponent() {
  const { sessions, selectedSessionId, selectSession, selectedDateId, isLoadingSessions } = useDrawerScreenViewModel();

  // If no date has been clicked yet, keep this area cleanly empty
  if (!selectedDateId) return null;

  return (
    <div className="mt-6 flex flex-col gap-1.5 border-t border-zinc-800/60 pt-5">
      <h3 className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 px-2 mb-1">
        Active Recording Sessions
      </h3>

      {isLoadingSessions ? (
        <div className="flex items-center justify-center p-4 text-xs text-zinc-600 animate-pulse font-mono">
          Fetching log index...
        </div>
      ) : sessions.length === 0 ? (
        <div className="text-[11px] italic text-zinc-600 px-2">
          No logs found for this date.
        </div>
      ) : (
        <div className="flex flex-col gap-1 max-h-60 overflow-y-auto pr-1">
          {sessions.map((sessionItem) => {
            const isSelected = selectedSessionId === sessionItem.id;

            return (
              <button
                key={sessionItem.id}
                onClick={() => selectSession(sessionItem.id)}
                className={`w-full text-left px-3 py-2 rounded text-[11px] font-mono truncate transition-colors duration-150 ${
                  isSelected
                    ? 'bg-zinc-900 text-emerald-400 border-l-2 border-emerald-500 pl-2.5'
                    : 'text-zinc-400 hover:bg-zinc-900/60 hover:text-zinc-300'
                }`}
                title={sessionItem.name}
              >
                {sessionItem.name}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}