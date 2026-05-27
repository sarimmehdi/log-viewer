import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useFooterScreenViewModel } from '@/features/footer/presentation/footer-screen-viewmodel';
import { FooterComponent } from '@/features/footer/presentation/components/footer-component';

// Mock the Zustand store hook module
jest.mock('@/features/footer/presentation/footer-screen-viewmodel');

describe('FooterComponent Coverage Test Suite', () => {
  // Define mock actions to capture execution
  const mockInitViewModel = jest.fn();
  const mockNextPage = jest.fn();
  const mockPreviousPage = jest.fn();
  const mockGoToPage = jest.fn();
  const mockFirstPage = jest.fn();
  const mockLastPage = jest.fn();
  const mockTeardown = jest.fn();

  // Baseline mock state template
  const baseMockState = {
    currentPage: 3,
    isFirstPage: false,
    isLastPage: false,
    initViewModel: mockInitViewModel,
    nextPage: mockNextPage,
    previousPage: mockPreviousPage,
    goToPage: mockGoToPage,
    firstPage: mockFirstPage,
    lastPage: mockLastPage,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockInitViewModel.mockReturnValue(mockTeardown);

    // Mock implementation of the custom selector hook
    (useFooterScreenViewModel as unknown as jest.Mock).mockImplementation(
      (selector: (state: typeof baseMockState) => unknown) => selector(baseMockState),
    );
  });

  // ─── LIFECYCLE & RENDER TESTS ───
  describe('Lifecycle & Core Rendering', () => {
    it('should invoke initViewModel on mount and fire teardown on unmount', () => {
      const { unmount } = render(<FooterComponent />);

      expect(mockInitViewModel).toHaveBeenCalledTimes(1);

      unmount();
      expect(mockTeardown).toHaveBeenCalledTimes(1);
    });

    it('should safely initialize the input element value matching the store state counter string', () => {
      render(<FooterComponent />);
      const inputEl = screen.getByRole('textbox') as HTMLInputElement;
      expect(inputEl.value).toBe('3');
    });
  });

  // ─── ACTION BUTTON BUTTON INTERACTIONS ───
  describe('Navigation Button Interactions', () => {
    it('should fire correct methods when clicking enabled navigation controllers', () => {
      render(<FooterComponent />);

      fireEvent.click(screen.getByRole('button', { name: /first page/i }));
      expect(mockFirstPage).toHaveBeenCalledTimes(1);

      fireEvent.click(screen.getByRole('button', { name: /previous page/i }));
      expect(mockPreviousPage).toHaveBeenCalledTimes(1);

      fireEvent.click(screen.getByRole('button', { name: /next page/i }));
      expect(mockNextPage).toHaveBeenCalledTimes(1);

      fireEvent.click(screen.getByRole('button', { name: /last page/i }));
      expect(mockLastPage).toHaveBeenCalledTimes(1);
    });

    it('should fully disable boundary navigation elements when flags indicate first or last locations', () => {
      const boundaryState = {
        ...baseMockState,
        isFirstPage: true,
        isLastPage: true,
      };

      (useFooterScreenViewModel as unknown as jest.Mock).mockImplementation(
        (selector: (state: typeof boundaryState) => unknown) => selector(boundaryState),
      );

      render(<FooterComponent />);

      expect(screen.getByRole('button', { name: /first page/i })).toBeDisabled();
      expect(screen.getByRole('button', { name: /previous page/i })).toBeDisabled();
      expect(screen.getByRole('button', { name: /next page/i })).toBeDisabled();
      expect(screen.getByRole('button', { name: /last page/i })).toBeDisabled();
    });
  });

  // ─── CONTROLLED INPUT MECHANICS ───
  describe('Page Jumper Input Handlers', () => {
    it('should fire goToPage on Enter keypress when numeric entry constraints match', () => {
      render(<FooterComponent />);
      const inputEl = screen.getByRole('textbox') as HTMLInputElement;

      fireEvent.change(inputEl, { target: { value: '8' } });
      fireEvent.keyDown(inputEl, { key: 'Enter', code: 'Enter' });

      expect(mockGoToPage).toHaveBeenCalledWith(8);
    });

    it('should quietly ignore arbitrary keypress events on textfields without firing handlers', () => {
      render(<FooterComponent />);
      const inputEl = screen.getByRole('textbox') as HTMLInputElement;

      fireEvent.keyDown(inputEl, { key: 'Shift', code: 'ShiftLeft' });
      expect(mockGoToPage).not.toHaveBeenCalled();
    });

    it('should bypass navigation processing and restore previous counter state string if input content contains invalid characters', () => {
      render(<FooterComponent />);
      const inputEl = screen.getByRole('textbox') as HTMLInputElement;

      // 1. Simulate user typing invalid characters
      fireEvent.change(inputEl, { target: { value: 'not-a-number' } });

      // 2. Press Enter (Triggers setInputValue and blur)
      fireEvent.keyDown(inputEl, { key: 'Enter', code: 'Enter' });

      expect(mockGoToPage).not.toHaveBeenCalled();

      // 3. Trigger the native blur event to force the element to read the updated fallback state
      fireEvent.blur(inputEl);
      expect(inputEl.value).toBe('3');
    });

    it('should bypass navigation processing and restore previous counter state string if requested index value is less than or equal to zero', () => {
      render(<FooterComponent />);
      const inputEl = screen.getByRole('textbox') as HTMLInputElement;

      // 1. Simulate typing a negative index out of bounds
      fireEvent.change(inputEl, { target: { value: '-2' } });

      // 2. Press Enter (Triggers setInputValue and blur)
      fireEvent.keyDown(inputEl, { key: 'Enter', code: 'Enter' });

      expect(mockGoToPage).not.toHaveBeenCalled();

      // 3. Trigger the native blur event to verify the fallback string applies cleanly
      fireEvent.blur(inputEl);
      expect(inputEl.value).toBe('3');
    });

    it('should restore original state value to field whenever element loses focus via blur events', () => {
      render(<FooterComponent />);
      const inputEl = screen.getByRole('textbox') as HTMLInputElement;

      // 1. Simulate typing an arbitrary value
      fireEvent.change(inputEl, { target: { value: '45' } });

      // 2. Explicitly fire the blur event which invokes handleInputBlur()
      fireEvent.blur(inputEl);

      // 3. Because handleInputBlur immediately calls setInputValue(currentPage.toString()),
      // your input fields read and project the accurate sync fallback state.
      expect(inputEl.value).toBe('3');
    });
  });
});
