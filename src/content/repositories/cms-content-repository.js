import { CMS_DATABASE } from "../cms/database.js";
import { getVerseExplanationContent } from "../explanations/queries.js";

function sortBlocks(blocks = []) {
    return [...blocks].sort((left, right) => {
        if (left.region !== right.region) {
            return left.region.localeCompare(right.region);
        }

        return left.position - right.position;
    });
}

function normalizeMediaAsset(asset) {
    return asset ? { ...asset } : null;
}

function resolveBlockMedia(block) {
    const assetId = block?.data?.media_asset_id || null;
    const asset = assetId ? CMS_DATABASE.indexes.mediaAssetsById[assetId] || null : null;
    const assetIds = Array.isArray(block?.data?.media_asset_ids) ? block.data.media_asset_ids : [];

    return Object.freeze({
        ...block,
        resolvedMediaAsset: normalizeMediaAsset(asset),
        resolvedMediaAssets: Object.freeze(assetIds.map((id) => normalizeMediaAsset(CMS_DATABASE.indexes.mediaAssetsById[id] || null)).filter(Boolean)),
    });
}

function createSyntheticBlock({
    id,
    ownerEntity,
    ownerId,
    region,
    blockType,
    variant = null,
    position = 1,
    status = "published",
    visibility = "public",
    data = {},
    source = "legacy",
}) {
    return resolveBlockMedia({
        id,
        owner_entity: ownerEntity,
        owner_id: ownerId,
        region,
        block_type: blockType,
        variant,
        position,
        status,
        visibility,
        is_published: status === "published",
        data,
        source,
    });
}

export function listContentBlocksForOwner(ownerEntity, ownerId, { includeDraft = false, includeHidden = false } = {}) {
    const key = `${ownerEntity}:${ownerId}`;
    const blocks = CMS_DATABASE.indexes.blocksByOwnerEntityKey[key] || [];

    return sortBlocks(
        blocks
            .filter((block) => includeDraft || block.status === "published")
            .filter((block) => includeHidden || block.visibility !== "hidden")
            .map((block) => resolveBlockMedia({ ...block }))
    );
}

export function getMediaAssetById(assetId) {
    return normalizeMediaAsset(CMS_DATABASE.indexes.mediaAssetsById[assetId] || null);
}

export function listMediaAssetsByIds(assetIds = []) {
    return assetIds.map((assetId) => getMediaAssetById(assetId)).filter(Boolean);
}

export function synthesizeInsightBlocksFromRecord(record, ownerEntity, ownerId) {
    const title = String(record?.insight_title || "").trim();
    const caption = String(record?.insight_caption || "").trim();
    const mediaSrc = String(record?.insight_media || "").trim();

    if (!title && !caption && !mediaSrc) {
        return Object.freeze([]);
    }

    return Object.freeze([
        createSyntheticBlock({
            id: `legacy-insight-${ownerEntity}-${ownerId}`,
            ownerEntity,
            ownerId,
            region: "insight",
            blockType: "media",
            data: {
                title: title || record?.title || record?.name || "Insight",
                caption,
                media_src: mediaSrc || null,
                media_alt: `${record?.title || record?.name || "Insight"} media`,
            },
        }),
    ]);
}

export function synthesizeExplanationBlocksForVerse(verseId, { includeDraft = false, includeHidden = false } = {}) {
    const explanationContent = getVerseExplanationContent(verseId, {
        includeDraft,
        includeHidden,
    });

    return Object.freeze(
        (explanationContent.blocks || []).map((block) => {
            switch (block.type) {
                case "text_section":
                    return createSyntheticBlock({
                        id: `legacy-body-${block.id}`,
                        ownerEntity: "verses",
                        ownerId: verseId,
                        region: "body",
                        blockType: "rich_text",
                        position: block.sort_order,
                        visibility: block.is_visible === false ? "hidden" : "public",
                        status: explanationContent.document?.status === "draft" ? "draft" : "published",
                        data: {
                            title: block.data_json?.title || null,
                            body: block.data_json?.body || "",
                        },
                        source: "legacy-explanation",
                    });
                case "video":
                    return createSyntheticBlock({
                        id: `legacy-body-${block.id}`,
                        ownerEntity: "verses",
                        ownerId: verseId,
                        region: "body",
                        blockType: "media",
                        position: block.sort_order,
                        visibility: block.is_visible === false ? "hidden" : "public",
                        status: explanationContent.document?.status === "draft" ? "draft" : "published",
                        data: {
                            title: block.data_json?.title || null,
                            caption: block.data_json?.description || null,
                            embed_url: block.data_json?.embed_url || null,
                            url: block.data_json?.url || null,
                        },
                        source: "legacy-explanation",
                    });
                case "image":
                    return createSyntheticBlock({
                        id: `legacy-body-${block.id}`,
                        ownerEntity: "verses",
                        ownerId: verseId,
                        region: "body",
                        blockType: "image",
                        position: block.sort_order,
                        visibility: block.is_visible === false ? "hidden" : "public",
                        status: explanationContent.document?.status === "draft" ? "draft" : "published",
                        data: {
                            title: block.data_json?.alt || null,
                            caption: block.data_json?.caption || null,
                            media_src: block.data_json?.src || null,
                            media_alt: block.data_json?.alt || "Explanation image",
                        },
                        source: "legacy-explanation",
                    });
                case "divider":
                    return createSyntheticBlock({
                        id: `legacy-body-${block.id}`,
                        ownerEntity: "verses",
                        ownerId: verseId,
                        region: "body",
                        blockType: "commentary",
                        variant: "divider",
                        position: block.sort_order,
                        visibility: block.is_visible === false ? "hidden" : "public",
                        status: explanationContent.document?.status === "draft" ? "draft" : "published",
                        data: {
                            body: "",
                        },
                        source: "legacy-explanation",
                    });
                default:
                    return null;
            }
        }).filter(Boolean)
    );
}

export function buildRegionMap(blocks = []) {
    return Object.freeze(
        blocks.reduce((regions, block) => {
            const region = block.region || "body";
            if (!regions[region]) {
                regions[region] = [];
            }

            regions[region].push(block);
            return regions;
        }, {
            hero: [],
            insight: [],
            body: [],
            sidebar: [],
            footer: [],
        })
    );
}

export function getResolvedRegionsForOwner(record, ownerEntity, options = {}) {
    if (!record) {
        return buildRegionMap([]);
    }

    const cmsBlocks = listContentBlocksForOwner(ownerEntity, record.id, {
        includeDraft: options.includeDraft === true,
        includeHidden: options.includeHidden === true,
    });

    if (cmsBlocks.length) {
        return buildRegionMap(cmsBlocks);
    }

    return buildRegionMap(synthesizeInsightBlocksFromRecord(record, ownerEntity, record.id));
}
