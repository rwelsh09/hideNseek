import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { isLoading } from '../../src/lib/context';

describe('isLoading', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        // Reset state
        isLoading.set(false);
        vi.runAllTimers();
        vi.advanceTimersByTime(1000);
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('sets immediately when true', () => {
        isLoading.set(true);
        expect(isLoading.get()).toBe(true);
    });

    it('waits for MINIMUM_LOADING_TIME before setting to false if less time has passed', () => {
        isLoading.set(true);
        expect(isLoading.get()).toBe(true);

        // Let 100ms pass
        vi.advanceTimersByTime(100);

        // Attempt to set to false
        isLoading.set(false);

        // Should still be true
        expect(isLoading.get()).toBe(true);

        // Wait another 200ms
        vi.advanceTimersByTime(200);

        // Should now be false
        expect(isLoading.get()).toBe(false);
    });

    it('sets to false immediately if more than MINIMUM_LOADING_TIME has passed', () => {
        isLoading.set(true);

        // Let 400ms pass
        vi.advanceTimersByTime(400);

        isLoading.set(false);
        expect(isLoading.get()).toBe(false);
    });

    it('cancels pending hide timeout if set to true again', () => {
        isLoading.set(true);
        vi.advanceTimersByTime(100);
        isLoading.set(false); // Schedules a timeout to hide after 200ms

        expect(isLoading.get()).toBe(true); // Still true initially

        vi.advanceTimersByTime(100); // Only 100ms has passed since set(false)
        isLoading.set(true); // Should cancel the pending timeout

        vi.advanceTimersByTime(150); // Pass the original timeout point
        expect(isLoading.get()).toBe(true);
    });
});
