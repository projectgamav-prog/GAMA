import { CMS_DATABASE } from "../cms/database.js";

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

export function listVerseInsightOptions(verseId, { includeDraft = false, includeHidden = false } = {}) {
    return Object.freeze(
        listContentBlocksForOwner("verses", verseId, { includeDraft, includeHidden })
            .filter((block) => block?.region === "insight" && block?.block_type === "verse_insight")
            .map((block) => Object.freeze({
                id: block.id,
                label: String(block?.data?.label || "").trim(),
                title: String(block?.data?.title || "").trim(),
                body: String(block?.data?.body || "").trim(),
                caption: String(block?.data?.caption || "").trim(),
                media_asset_id: String(block?.data?.media_asset_id || "").trim() || null,
                ui_order: Number(block?.position) || 0,
                published: block?.status === "published" && block?.is_published === true,
                media: block?.data?.media_asset_id ? getMediaAssetById(block.data.media_asset_id) : null,
            }))
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

    return buildRegionMap(listContentBlocksForOwner(ownerEntity, record.id, {
        includeDraft: options.includeDraft === true,
        includeHidden: options.includeHidden === true,
    }));
}
