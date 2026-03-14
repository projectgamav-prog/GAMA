import { createInsightDropdown, DEFAULT_INSIGHT_MEDIA } from "../../content/renderers/renderer-utils.js";

export function resolveInsightBlockContent(block, fallbackTitle = "") {
    if (!block) {
        return null;
    }

    if (block.block_type === "media" || block.block_type === "image") {
        const asset = block?.resolvedMediaAsset || null;
        const assetType = asset?.asset_type || (block.block_type === "image" ? "image" : "");
        const sourceUrl = asset?.src || block?.data?.url || block?.data?.media_src || block?.data?.src || "";

        return {
            title: block?.data?.title || fallbackTitle,
            caption: block?.data?.caption || asset?.caption || "",
            image: assetType === "image"
                ? sourceUrl
                : (block?.data?.preview_image || asset?.metadata?.preview_image || ""),
            media: {
                asset_type: assetType,
                provider: asset?.provider || block?.data?.provider || "",
                src: sourceUrl,
                embed_url: block?.data?.embed_url || asset?.metadata?.embed_url || "",
                alt_text: asset?.alt_text || block?.data?.media_alt || block?.data?.alt || "",
                preview_image: block?.data?.preview_image || asset?.metadata?.preview_image || "",
            },
        };
    }

    if (block.block_type === "rich_text" || block.block_type === "commentary") {
        return {
            title: block?.data?.title || fallbackTitle,
            caption: block?.data?.body || "",
            image: "",
            media: null,
        };
    }

    return {
        title: block?.data?.title || fallbackTitle,
        caption: block?.data?.caption || "",
        image: block?.resolvedMediaAsset?.src || block?.data?.media_src || "",
        media: block?.resolvedMediaAsset
            ? {
                asset_type: block.resolvedMediaAsset.asset_type || "",
                provider: block.resolvedMediaAsset.provider || "",
                src: block.resolvedMediaAsset.src || "",
                embed_url: block?.data?.embed_url || block?.resolvedMediaAsset?.metadata?.embed_url || "",
                alt_text: block.resolvedMediaAsset.alt_text || "",
                preview_image: block?.resolvedMediaAsset?.metadata?.preview_image || "",
            }
            : null,
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
        media: insight.media || null,
    });
}
