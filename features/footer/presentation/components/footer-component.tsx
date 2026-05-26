import React, { useEffect, useState } from 'react';
import { useFooterScreenViewModel } from '@/features/footer/presentation/footer-screen-viewmodel';

export const FooterComponent: React.FC = () => {
  const currentPage = useFooterScreenViewModel((state) => state.currentPage);
  const isFirstPage = useFooterScreenViewModel((state) => state.isFirstPage);
  const isLastPage = useFooterScreenViewModel((state) => state.isLastPage);

  const initViewModel = useFooterScreenViewModel((state) => state.initViewModel);
  const nextPage = useFooterScreenViewModel((state) => state.nextPage);
  const previousPage = useFooterScreenViewModel((state) => state.previousPage);
  const goToPage = useFooterScreenViewModel((state) => state.goToPage);
  const firstPage = useFooterScreenViewModel((state) => state.firstPage);
  const lastPage = useFooterScreenViewModel((state) => state.lastPage);

  useEffect(() => {
    const teardown = initViewModel();
    return () => teardown();
  }, [initViewModel]);

  // ─── LOCAL STATE DECLARES INITIAL VALUE ONLY ───
  const [inputValue, setInputValue] = useState(currentPage.toString());

  // ─── DELETED THE OFFENDING USEEFFECT ENTIRELY ───

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const parsedPage = parseInt(inputValue, 10);
      if (!isNaN(parsedPage) && parsedPage > 0) {
        goToPage(parsedPage);
      } else {
        setInputValue(currentPage.toString());
      }
      e.currentTarget.blur();
    }
  };

  const handleInputBlur = () => {
    setInputValue(currentPage.toString());
  };

  return (
    <footer className="flex h-14 w-full items-center justify-center border-t border-zinc-800 bg-zinc-900/40 px-6 font-mono text-xs text-zinc-400 select-none backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <button
          onClick={firstPage}
          disabled={isFirstPage}
          className="flex h-8 w-8 items-center justify-center rounded border border-zinc-800 bg-zinc-900 transition-all hover:bg-zinc-800 hover:text-zinc-50 active:scale-95 disabled:pointer-events-none disabled:opacity-30"
          aria-label="Navigate to first page"
        >
          &laquo;
        </button>

        <button
          onClick={previousPage}
          disabled={isFirstPage}
          className="flex h-8 w-8 items-center justify-center rounded border border-zinc-800 bg-zinc-900 transition-all hover:bg-zinc-800 hover:text-zinc-50 active:scale-95 disabled:pointer-events-none disabled:opacity-30"
          aria-label="Navigate to previous page"
        >
          &lsaquo;
        </button>

        <div className="flex items-center gap-2 px-2">
          {/* ─── ADDED KEY EXPRESSION TO TRACK RENDER Lifecycles ─── */}
          <input
            key={currentPage}
            type="text"
            defaultValue={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleInputKeyDown}
            onBlur={handleInputBlur}
            className="h-8 w-12 rounded border border-zinc-800 bg-zinc-950 text-center font-bold text-zinc-100 outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <button
          onClick={nextPage}
          disabled={isLastPage}
          className="flex h-8 w-8 items-center justify-center rounded border border-zinc-800 bg-zinc-900 transition-all hover:bg-zinc-800 hover:text-zinc-50 active:scale-95 disabled:pointer-events-none disabled:opacity-30"
          aria-label="Navigate to next page"
        >
          &rsaquo;
        </button>

        <button
          onClick={lastPage}
          disabled={isLastPage}
          className="flex h-8 w-8 items-center justify-center rounded border border-zinc-800 bg-zinc-900 transition-all hover:bg-zinc-800 hover:text-zinc-50 active:scale-95 disabled:pointer-events-none disabled:opacity-30"
          aria-label="Navigate to last page"
        >
          &raquo;
        </button>
      </div>
    </footer>
  );
};
