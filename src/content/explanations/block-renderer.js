import { renderUniversalBlocks } from "../../render/blocks/universal-block-renderer.js";

export function renderExplanationBlocks({
    container,
    blocks = [],
    emptyMessage = "Editorial explanation for this verse is still being prepared.",
} = {}) {
    renderUniversalBlocks({
        container,
        blocks,
        emptyMessage,
    });
}
