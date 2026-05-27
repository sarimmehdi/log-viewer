import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useMainScreenViewModel } from '@/features/main/presentation/main-screen-viewmodel';
import { Level } from '@/features/log/domain/model/level';
import { LogRowComponent } from '@/features/main/presentation/components/log-row-component';

// Mock the Zustand store hook module
jest.mock('@/features/main/presentation/main-screen-viewmodel');

describe('LogRowComponent Coverage Test Suite', () => {
  const mockSelectLog = jest.fn();
  const mockUnselectLog = jest.fn();

  // Baseline data template to feed into props
  const mockLogBase = {
    id: 742,
    message: 'Memory buffer space allocation completed successfully.',
    level: Level.INFO,
    functionName: 'allocateBuffers',
    className: 'BufferPoolManager',
    line: 85,
  };

  // Baseline mock state template
  const baseMockStore = {
    selectedLogIds: [] as number[],
    selectLog: mockSelectLog,
    unselectLog: mockUnselectLog,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Default store selector hook implementation
    (useMainScreenViewModel as unknown as jest.Mock).mockImplementation(
      (selector: (state: typeof baseMockStore) => unknown) => selector(baseMockStore),
    );
  });

  // ─── RENDERING & TOOLTIP STRUCTURAL VALUE TESTS ───
  describe('Structural Content Layout Render', () => {
    it('should project structural log properties and apply native HTML title descriptive hover attributes cleanly', () => {
      render(<LogRowComponent log={mockLogBase} />);

      // Verify content projection strings are accessible
      expect(screen.getByText('742')).toBeInTheDocument();
      expect(screen.getByText(mockLogBase.message)).toBeInTheDocument();
      expect(screen.getByText(mockLogBase.functionName)).toBeInTheDocument();

      // Verify explicit hover titles exist for truncate safety optimizations
      expect(screen.getByText(mockLogBase.message)).toHaveAttribute('title', mockLogBase.message);
      expect(screen.getByText(mockLogBase.functionName)).toHaveAttribute(
        'title',
        mockLogBase.functionName,
      );

      // FIX: Use a custom text matcher function to capture text split across elements
      const classColumnEl = screen.getByText((content, element) => {
        const hasText = (node: Element | null) => node?.textContent === 'BufferPoolManager:85';
        const elementHasText = hasText(element);
        const childrenDontHaveText = Array.from(element?.children || []).every(
          (child) => !hasText(child),
        );
        return elementHasText && childrenDontHaveText;
      });

      expect(classColumnEl).toHaveAttribute('title', 'BufferPoolManager:85');
    });
  });

  // ─── INTERACTION & SELECTION ENGINE OPERATIONS ───
  describe('Checkbox Interactive Selection Controls', () => {
    it('should keep checkbox unchecked and call selectLog on change when index is not selected', () => {
      render(<LogRowComponent log={mockLogBase} />);

      const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
      expect(checkbox.checked).toBe(false);

      fireEvent.click(checkbox);

      expect(mockSelectLog).toHaveBeenCalledWith(742);
      expect(mockUnselectLog).not.toHaveBeenCalled();
    });

    it('should render checkbox checked and call unselectLog on change when index already exists inside selected array', () => {
      const activeSelectionState = {
        ...baseMockStore,
        selectedLogIds: [742], // ID already mapped
      };
      (useMainScreenViewModel as unknown as jest.Mock).mockImplementation(
        (selector: (state: typeof activeSelectionState) => unknown) =>
          selector(activeSelectionState),
      );

      render(<LogRowComponent log={mockLogBase} />);

      const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
      expect(checkbox.checked).toBe(true);

      fireEvent.click(checkbox);

      expect(mockUnselectLog).toHaveBeenCalledWith(742);
      expect(mockSelectLog).not.toHaveBeenCalled();
    });
  });

  // ─── PARAMETERIZED STYLE MATCHERS FOR THE SWITCH BLOCK ───
  describe('Parameterized Level Badge Style Specifications', () => {
    const stylingScenarios = [
      {
        level: Level.ERROR,
        expectedClassSubstring: 'bg-red-500/10 text-red-500 border-red-500/20',
      },
      {
        level: Level.WARN,
        expectedClassSubstring: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
      },
      {
        level: Level.DEBUG,
        expectedClassSubstring: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      },
      {
        level: Level.INFO, // Falls back into default matching branch rule
        expectedClassSubstring: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
      },
    ];

    test.each(stylingScenarios)(
      'should correctly apply layout classes "$expectedClassSubstring" when log trace matches $level severity',
      ({ level, expectedClassSubstring }) => {
        const specializedLog = {
          ...mockLogBase,
          level,
        };

        render(<LogRowComponent log={specializedLog} />);

        const badgeElement = screen.getByText(level);
        expect(badgeElement).toHaveClass(expectedClassSubstring);
      },
    );
  });
});
