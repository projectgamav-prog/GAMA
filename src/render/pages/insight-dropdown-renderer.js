import { createInsightDropdown, DEFAULT_INSIGHT_MEDIA } from "../../content/renderers/renderer-utils.js";

function resolveInsightBlockContent(block, fallbackTitle = "") {
    if (!block) {
        return null;
    }

    if (block.block_type === "media" || block.block_type === "image") {
        return {
            title: block?.data?.title || fallbackTitle,
            caption: block?.data?.caption || block?.resolvedMediaAsset?.caption || "",
            image: block?.resolvedMediaAsset?.src || block?.data?.media_src || block?.data?.src || "",
        };
    }

    if (block.block_type === "rich_text" || block.block_type === "commentary") {
        return {
            title: block?.data?.title || fallbackTitle,
            caption: block?.data?.body || "",
            image: "",
        };
    }

    return {
        title: block?.data?.title || fallbackTitle,
        caption: block?.data?.caption || "",
        image: block?.resolvedMediaAsset?.src || block?.data?.media_src || "",
    };
}

export function createInsightDropdownFromBlock({
    block,
    wrapperClassName,
    buttonId,
    panelId,
    buttonClassName = "",
    headingTag = "h3",
    fallbackTitle = "",
    fallbackMedia = DEFAULT_INSIGHT_MEDIA,
    alt = "",
}) {
    const insight = resolveInsightBlockContent(block, fallbackTitle);
    if (!insight || (!insight.title && !insight.caption && !insight.image)) {
        return null;
    }

    return createInsightDropdown({
        wrapperClassName,
        buttonId,
        panelId,
        buttonClassName,
        headingTag,
        title: insight.title || fallbackTitle,
        image: insight.image || fallbackMedia,
        alt,
        caption: insight.caption || "",
        fallbackMedia,
    });
}
