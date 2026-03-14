const EXPLANATIONS_PAGE_BRIDGE_KEY = "__GAMA_EXPLANATIONS_PAGE_BRIDGE__";

export function getExplanationsPageBridge() {
    if (typeof window === "undefined") {
        return null;
    }

    return window[EXPLANATIONS_PAGE_BRIDGE_KEY] || null;
}

export function setExplanationsPageBridge(bridge) {
    if (typeof window === "undefined") {
        return;
    }

    window[EXPLANATIONS_PAGE_BRIDGE_KEY] = bridge || null;
}

export function clearExplanationsPageBridge() {
    if (typeof window === "undefined") {
        return;
    }

    delete window[EXPLANATIONS_PAGE_BRIDGE_KEY];
}
