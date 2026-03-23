import { PreJoinConfig } from "@/types/meeting";

const PREJOIN_STORAGE_KEY = "kallio-prejoin-config";

export function savePreJoinConfig(config: PreJoinConfig) {
    if (typeof window === "undefined") return;
    sessionStorage.setItem(PREJOIN_STORAGE_KEY, JSON.stringify(config));
}

export function getPreJoinConfig(): PreJoinConfig | null {
    if (typeof window === "undefined") return null;

    const raw = sessionStorage.getItem(PREJOIN_STORAGE_KEY);
    if (!raw) return null;

    try {
        return JSON.parse(raw) as PreJoinConfig;
    } catch {
        return null;
    }
}

export function clearPreJoinConfig() {
    if (typeof window === "undefined") return;
    sessionStorage.removeItem(PREJOIN_STORAGE_KEY);
}