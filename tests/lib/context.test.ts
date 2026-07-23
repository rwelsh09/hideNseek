import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { isLoading } from '../../src/lib/context';

describe('isLoading store', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        isLoading.set(false); // Reset state
    });

    afterEach(() => {
        vi.runAllTimers();
        vi.useRealTimers();
    });

    it('should set isLoading to true immediately', () => {
        isLoading.set(true);
        expect(isLoading.get()).toBe(true);
    });

    it('should wait 400ms before setting isLoading to false if turned off immediately', () => {
        isLoading.set(true);
        expect(isLoading.get()).toBe(true);

        isLoading.set(false);
        // It should still be true initially since 400ms hasn't passed
        expect(isLoading.get()).toBe(true);

        // Advance by 300ms, should still be true
        vi.advanceTimersByTime(300);
        expect(isLoading.get()).toBe(true);

        // Advance by remaining 100ms
        vi.advanceTimersByTime(100);
        expect(isLoading.get()).toBe(false);
    });

    it('should set isLoading to false immediately if 400ms has already passed', () => {
        isLoading.set(true);
        expect(isLoading.get()).toBe(true);

        // Simulate waiting 500ms
        vi.advanceTimersByTime(500);

        isLoading.set(false);
        expect(isLoading.get()).toBe(false);
    });

    it('should clear timeout if toggled back to true while waiting to turn false', () => {
        isLoading.set(true);
        expect(isLoading.get()).toBe(true);

        isLoading.set(false);
        expect(isLoading.get()).toBe(true); // Waiting for 400ms

        vi.advanceTimersByTime(200);

        // Set back to true
        isLoading.set(true);
        expect(isLoading.get()).toBe(true);

        // Advance past original 400ms mark, should STILL be true
        vi.advanceTimersByTime(250);
        expect(isLoading.get()).toBe(true);
    });
});
