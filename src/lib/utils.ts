import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import calgaryRapidTransitData from "@/data/calgary_rapid_transit_network.json";

export const STATION_IDS_INDEX = (calgaryRapidTransitData.features as any[])
    .filter(
        (f) =>
            f.properties?.transit_type === "CTrain Station" ||
            f.properties?.transit_type === "MAX Station" ||
            f.properties?.transit_type === "CTrain & MAX Hub"
    )
    .map((f) =>
        (f.properties?.["@id"] || f.id || `${f.geometry.coordinates[1]},${f.geometry.coordinates[0]}`) as string
    )
    .sort();

export function encodeDisabledStations(stations: string[]): string {
    const numBytes = Math.ceil(STATION_IDS_INDEX.length / 8);
    const bytes = new Uint8Array(numBytes);
    for (const stationId of stations) {
        const index = STATION_IDS_INDEX.indexOf(stationId);
        if (index !== -1) {
            const byteIndex = Math.floor(index / 8);
            const bitIndex = index % 8;
            bytes[byteIndex] |= 1 << bitIndex;
        }
    }
    let binary = "";
    for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function decodeDisabledStations(encoded: string): string[] {
    const regularBase64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
    const paddedBase64 =
        regularBase64 + "=".repeat((4 - (regularBase64.length % 4)) % 4);
    let binary;
    try {
        binary = atob(paddedBase64);
    } catch {
        return [];
    }

    const disabledStations: string[] = [];
    for (let i = 0; i < binary.length; i++) {
        const byte = binary.charCodeAt(i);
        for (let bitIndex = 0; bitIndex < 8; bitIndex++) {
            if ((byte & (1 << bitIndex)) !== 0) {
                const globalIndex = i * 8 + bitIndex;
                if (globalIndex < STATION_IDS_INDEX.length) {
                    disabledStations.push(STATION_IDS_INDEX[globalIndex]);
                }
            }
        }
    }
    return disabledStations;
}

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const mapToObj = <T, K extends string, V>(
    arr: T[],
    fn: (item: T) => [K, V],
) => Object.fromEntries(arr.map(fn));

export const compress = async (
    str: string,
    encoding = "deflate" as CompressionFormat,
): Promise<string> => {
    const byteArray = new TextEncoder().encode(str);
    const cs = new CompressionStream(encoding);
    const writer = cs.writable.getWriter();
    writer.write(byteArray);
    writer.close();
    const arrayBuffer = await new Response(cs.readable).arrayBuffer();

    const bytes = new Uint8Array(arrayBuffer);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary)
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=/g, "");
};

export const decompress = async (
    base64String: string,
    encoding = "deflate" as CompressionFormat,
): Promise<string> => {
    const regularBase64 = base64String.replace(/-/g, "+").replace(/_/g, "/");
    const paddedBase64 =
        regularBase64 + "=".repeat((4 - (regularBase64.length % 4)) % 4);

    const binaryString = atob(paddedBase64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }

    const cs = new DecompressionStream(encoding);
    const writer = cs.writable.getWriter();
    writer.write(bytes);
    writer.close();
    const arrayBuffer = await new Response(cs.readable).arrayBuffer();
    return new TextDecoder().decode(arrayBuffer);
};

export interface ShareDataOptions {
    url: string;
    text?: string;
    title?: string;
}

/**
 * Open native share sheet or fallback to sending to clipboard
 * @param data URL string or ShareData to share
 * @param forceClipboard Whether to force usage of the clipboard (instead of share sheet)
 * @returns `true` for native success, `false` for both native and fallback failure and `"clipboard"` for clipboard success
 */
export async function shareOrFallback(
    data: string | ShareDataOptions,
    forceClipboard = false,
): Promise<boolean | "clipboard"> {
    const url = typeof data === "string" ? data : data.url;
    const text = typeof data === "string" ? undefined : data.text;
    const title = typeof data === "string" ? undefined : data.title;

    // Fallback content to copy when share sheet isn't used
    const clipboardContent = text ? `${text}\n${url}` : url;

    if (forceClipboard) {
        if (!navigator || !navigator.clipboard) {
            // Clipboard not supported
            return false;
        }

        navigator.clipboard.writeText(clipboardContent);
        return "clipboard";
    }

    if (!navigator.share) return shareOrFallback(data, true); // Fallback to clipboard

    const sharePayload = text ? { text: clipboardContent, title } : { url, title };

    return await navigator
        .share(sharePayload)
        .then(() => true)
        .catch(() => {
            // Try again with clipboard
            return shareOrFallback(data, true);
        });
}
