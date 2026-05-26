'use client';

import { useEffect } from 'react';
import { useDrawerScreenViewModel } from '@/features/drawer/presentation/drawer-screen-viewmodel';
import { DatesListComponent } from '@/features/drawer/presentation/components/dates-list-component';
import { SessionsListComponent } from '@/features/drawer/presentation/components/sessions-list-component';
import { LogListComponent } from '@/features/main/presentation/components/log-list-component';
import { FooterComponent } from '@/features/footer/presentation/components/footer-component';

export default function LogViewerApp() {
  const { isDrawerOpen, toggleDrawer, loadDates } = useDrawerScreenViewModel();

  useEffect(() => {
    loadDates();
  }, [loadDates]);

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-zinc-950 text-zinc-50 antialiased font-sans">
      {/* GLOBAL TOP NAVIGATION HEADER */}
      <header className="flex h-14 w-full items-center border-b border-zinc-800 bg-zinc-900/40 px-4 select-none backdrop-blur-sm">
        <button
          onClick={toggleDrawer}
          className="flex h-9 w-9 items-center justify-center rounded-md border border-zinc-800 bg-zinc-900 text-zinc-300 transition-all hover:bg-zinc-800 hover:text-zinc-50 active:scale-95"
          aria-label="Toggle navigation drawer"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="h-4 w-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
            />
          </svg>
        </button>
        <span className="ml-4 text-xs font-bold uppercase tracking-widest text-zinc-400">
          LOG TRACKER ENGINE
        </span>
      </header>

      {/* CONTAINER BODY WORKSPACE */}
      <div className="flex h-[calc(100vh-3.5rem)] w-full overflow-hidden">
        {/* COLLAPSIBLE SIDEBAR DRAWER PANEL */}
        <aside
          className={`h-full border-r border-zinc-900 bg-zinc-950 transition-all duration-300 ease-in-out ${
            isDrawerOpen ? 'w-64 opacity-100' : 'w-0 opacity-0 border-r-0 pointer-events-none'
          }`}
        >
          <div className="w-64 p-4 flex flex-col h-full overflow-y-auto">
            <DatesListComponent />
            <SessionsListComponent />
          </div>
        </aside>

        {/* MAIN CONSOLE FEED DISPLAY WINDOW */}
        {/* Note: Removing the 'p-8' padding from the main wrapper to allow the footer to cleanly snap full-width against the edges */}
        <main className="flex-1 h-full flex flex-col bg-zinc-950 select-text overflow-hidden">
          {/* Main Log View Body Container with explicit content spacing */}
          <div className="flex-1 flex flex-col p-8 overflow-hidden min-h-0 w-full">
            {/* Static Header Meta Content */}
            <div className="mb-6 flex-shrink-0">
              <h1 className="text-xl font-bold tracking-tight text-zinc-100 font-mono">
                Main Console Monitor
              </h1>
              <p className="mt-2 text-xs text-zinc-400 leading-relaxed max-w-xl">
                Click on an operational log history date in the left drawer to load individual
                recording instances. Once selected, sessions will pop up smoothly underneath.
              </p>
            </div>

            {/* Scrollable grid element container */}
            <div className="flex-1 min-h-0 w-full">
              <LogListComponent />
            </div>
          </div>

          {/* ─── MOUNT THE PAGINATION BAR AT THE FOOTER REGION ─── */}
          {/* Placing it here guarantees it stretches full-width beneath the scroll viewport */}
          <FooterComponent />
        </main>
      </div>
    </div>
  );
}
