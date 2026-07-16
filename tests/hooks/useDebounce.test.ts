// @vitest-environment jsdom

import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useDebounce } from '../../src/hooks/useDebounce';

describe('useDebounce', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('should return initial value immediately', () => {
        const { result } = renderHook(() => useDebounce('initial', 500));
        expect(result.current).toBe('initial');
    });

    it('should delay updating the value', () => {
        const { result, rerender } = renderHook(
            ({ value, delay }) => useDebounce(value, delay),
            { initialProps: { value: 'initial', delay: 500 } }
        );

        expect(result.current).toBe('initial');

        // Update value
        rerender({ value: 'updated', delay: 500 });

        // Value shouldn't update immediately
        expect(result.current).toBe('initial');

        // Fast-forward half the delay
        act(() => {
            vi.advanceTimersByTime(250);
        });
        expect(result.current).toBe('initial');

        // Fast-forward the rest of the delay
        act(() => {
            vi.advanceTimersByTime(250);
        });
        expect(result.current).toBe('updated');
    });

    it('should use default delay of 500ms if not provided', () => {
        const { result, rerender } = renderHook(
            ({ value }) => useDebounce(value),
            { initialProps: { value: 'initial' } }
        );

        rerender({ value: 'updated' });

        act(() => {
            vi.advanceTimersByTime(499);
        });
        expect(result.current).toBe('initial');

        act(() => {
            vi.advanceTimersByTime(1);
        });
        expect(result.current).toBe('updated');
    });

    it('should cancel previous timer if value changes before delay', () => {
        const { result, rerender } = renderHook(
            ({ value, delay }) => useDebounce(value, delay),
            { initialProps: { value: 'initial', delay: 500 } }
        );

        // Update value first time
        rerender({ value: 'updated 1', delay: 500 });

        act(() => {
            vi.advanceTimersByTime(250);
        });

        // Update value second time before first delay completes
        rerender({ value: 'updated 2', delay: 500 });

        // Fast forward the remaining 250ms of the FIRST timer
        act(() => {
            vi.advanceTimersByTime(250);
        });

        // Value should still be initial because the first timer was cancelled
        expect(result.current).toBe('initial');

        // Fast forward the remaining 250ms of the SECOND timer
        act(() => {
            vi.advanceTimersByTime(250);
        });

        // Now it should be the final value
        expect(result.current).toBe('updated 2');
    });
});
