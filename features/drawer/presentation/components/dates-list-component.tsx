'use client';

import { useDrawerScreenViewModel } from '../drawer-screen-viewmodel';

export function DatesListComponent() {
  const { dates, selectedDateId, selectDate, isLoadingDates } = useDrawerScreenViewModel();

  if (isLoadingDates) {
    return (
      <div className="flex items-center justify-center p-4 text-xs text-zinc-500 animate-pulse">
        Loading operational log dates...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <h3 className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 px-2 mb-1">
        Log History (Dates)
      </h3>

      {dates.map((dateItem) => {
        const isActive = selectedDateId === dateItem.id;

        return (
          <button
            key={dateItem.id} // Equivalent to assigning an item key in a LazyColumn
            onClick={() => selectDate(dateItem.id)}
            className={`w-full text-left px-3 py-2 rounded-md text-xs font-medium transition-all duration-150 flex items-center justify-between ${
              isActive
                ? 'bg-zinc-800 text-zinc-50 border border-zinc-700 shadow-sm'
                : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200 border border-transparent'
            }`}
          >
            <span className="font-mono tracking-wide">{dateItem.formattedString}</span>
            {isActive && (
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            )}
          </button>
        );
      })}
    </div>
  );
}
