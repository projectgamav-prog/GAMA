import { renderUniversalBlocks } from "../blocks/universal-block-renderer.js";

export function renderRegion(container, blocks = [], options = {}) {
    renderUniversalBlocks({
        container,
        blocks,
        emptyMessage: options.emptyMessage || "",
    });
}
