const EXPLANATION_PAGE_BRIDGE_KEY = "__BHAGAVAD_GITA_EXPLANATION_PAGE_BRIDGE__";

export function getExplanationPageBridge() {
    if (typeof window === "undefined") {
        return null;
    }

    return window[EXPLANATION_PAGE_BRIDGE_KEY] || null;
}

export function setExplanationPageBridge(bridge) {
    if (typeof window === "undefined") {
        return;
    }

    window[EXPLANATION_PAGE_BRIDGE_KEY] = bridge || null;
}

export function clearExplanationPageBridge() {
    if (typeof window === "undefined") {
        return;
    }

    delete window[EXPLANATION_PAGE_BRIDGE_KEY];
}
