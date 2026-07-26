// @vitest-environment jsdom

import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useIsMobile } from "../../src/hooks/use-mobile";

const MOBILE_BREAKPOINT = 768;

describe("useIsMobile", () => {
    let listeners: ((e: MediaQueryListEvent) => void)[] = [];
    let originalInnerWidth: number;
    let originalMatchMedia: typeof window.matchMedia;

    beforeEach(() => {
        listeners = [];
        originalInnerWidth = window.innerWidth;
        originalMatchMedia = window.matchMedia;

        Object.defineProperty(window, "innerWidth", {
            writable: true,
            configurable: true,
            value: 1024,
        });

        Object.defineProperty(window, "matchMedia", {
            writable: true,
            configurable: true,
            value: vi.fn().mockImplementation((query) => ({
                matches: window.innerWidth < MOBILE_BREAKPOINT,
                media: query,
                onchange: null,
                addListener: vi.fn(),
                removeListener: vi.fn(),
                addEventListener: vi.fn((event, listener) => {
                    if (event === "change") {
                        listeners.push(listener);
                    }
                }),
                removeEventListener: vi.fn((event, listener) => {
                    if (event === "change") {
                        listeners = listeners.filter((l) => l !== listener);
                    }
                }),
                dispatchEvent: vi.fn(),
            })),
        });
    });

    afterEach(() => {
        Object.defineProperty(window, "innerWidth", {
            writable: true,
            configurable: true,
            value: originalInnerWidth,
        });
        Object.defineProperty(window, "matchMedia", {
            writable: true,
            configurable: true,
            value: originalMatchMedia,
        });
        vi.restoreAllMocks();
    });

    const triggerResize = (newWidth: number) => {
        window.innerWidth = newWidth;
        // The mock hook depends on window.innerWidth when updating.
        act(() => {
            listeners.forEach((listener) => {
                listener({
                    matches: newWidth < MOBILE_BREAKPOINT,
                    media: `(max-width: ${MOBILE_BREAKPOINT - 1}px)`,
                } as MediaQueryListEvent);
            });
        });
    };

    it("should return false for desktop screen size", () => {
        window.innerWidth = 1024;
        const { result } = renderHook(() => useIsMobile());
        expect(result.current).toBe(false);
    });

    it("should return true for mobile screen size", () => {
        window.innerWidth = 375;
        const { result } = renderHook(() => useIsMobile());
        expect(result.current).toBe(true);
    });

    it("should return false when screen size is exactly the breakpoint", () => {
        window.innerWidth = MOBILE_BREAKPOINT;
        const { result } = renderHook(() => useIsMobile());
        expect(result.current).toBe(false);
    });

    it("should update state when window is resized from desktop to mobile", () => {
        window.innerWidth = 1024;
        const { result } = renderHook(() => useIsMobile());
        expect(result.current).toBe(false);

        triggerResize(375);
        expect(result.current).toBe(true);
    });

    it("should update state when window is resized from mobile to desktop", () => {
        window.innerWidth = 375;
        const { result } = renderHook(() => useIsMobile());
        expect(result.current).toBe(true);

        triggerResize(1024);
        expect(result.current).toBe(false);
    });

    it("should properly cleanup event listeners on unmount", () => {
        window.innerWidth = 1024;
        const { unmount } = renderHook(() => useIsMobile());

        expect(listeners.length).toBe(1);

        unmount();

        expect(listeners.length).toBe(0);
    });
});
