// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { isLoading } from "@/lib/context";

describe("isLoading nanostore", () => {
    beforeEach(() => {
        vi.useFakeTimers();
        // Reset the store to false before each test
        isLoading.set(false);
        vi.runAllTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("should set to true immediately", () => {
        isLoading.set(true);
        expect(isLoading.get()).toBe(true);
    });

    it("should enforce a minimum 400ms duration when setting to false quickly", () => {
        isLoading.set(true);
        expect(isLoading.get()).toBe(true);

        // Advance a little bit, less than 400ms
        vi.advanceTimersByTime(100);

        // Try to set false
        isLoading.set(false);

        // Should still be true because 400ms haven't passed
        expect(isLoading.get()).toBe(true);

        // Advance to 399ms total
        vi.advanceTimersByTime(299);
        expect(isLoading.get()).toBe(true);

        // Advance to 400ms total
        vi.advanceTimersByTime(1);
        expect(isLoading.get()).toBe(false);
    });

    it("should set to false immediately if 400ms have already passed", () => {
        isLoading.set(true);
        expect(isLoading.get()).toBe(true);

        // Advance more than 400ms
        vi.advanceTimersByTime(500);

        // Try to set false
        isLoading.set(false);

        // Should be false immediately
        expect(isLoading.get()).toBe(false);
    });

    it("should clear the timeout if set to true again within the 400ms window", () => {
        isLoading.set(true);

        vi.advanceTimersByTime(100);
        isLoading.set(false); // Schedules a timeout to set false in 300ms

        vi.advanceTimersByTime(100);
        isLoading.set(true); // Should cancel the timeout

        // Advance past what would have been the 400ms mark
        vi.advanceTimersByTime(300);

        // Should remain true because we set it to true again
        expect(isLoading.get()).toBe(true);
    });
});
