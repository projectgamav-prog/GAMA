const FALLBACK_INSIGHT_MEDIA = "/assets/images/image.png";

function normalizeText(value) {
  return String(value ?? "").trim();
}

function createOwnerScopedMediaSrc(src, ownerId) {
  const normalizedSrc = normalizeText(src) || FALLBACK_INSIGHT_MEDIA;
  if (!ownerId || /[?&]cms_owner=/.test(normalizedSrc)) {
    return normalizedSrc;
  }

  return `${normalizedSrc}${normalizedSrc.includes("?") ? "&" : "?"}cms_owner=${encodeURIComponent(ownerId)}`;
}

function inferMediaProvider(src, fallbackProvider = "") {
  const normalizedSrc = normalizeText(src).toLowerCase();
  if (normalizedSrc.includes("youtube.com") || normalizedSrc.includes("youtu.be")) {
    return "youtube";
  }

  if (normalizedSrc.startsWith("/")) {
    return "local";
  }

  return normalizeText(fallbackProvider) || "local";
}

function inferMediaAssetType(src, fallbackAssetType = "image") {
  const normalizedSrc = normalizeText(src).toLowerCase();
  if (normalizedSrc.includes("youtube.com") || normalizedSrc.includes("youtu.be")) {
    return "embed";
  }

  if (/\.(mp3|wav|ogg|m4a)(\?|$)/.test(normalizedSrc)) {
    return "audio";
  }

  if (/\.(png|jpe?g|gif|webp|svg)(\?|$)/.test(normalizedSrc) || normalizedSrc.startsWith("/assets/")) {
    return "image";
  }

  return normalizeText(fallbackAssetType) || "image";
}

function getInsightTitle(bookRecord, existingBlock = null) {
  return normalizeText(existingBlock?.data?.title)
    || normalizeText(bookRecord?.insight_title)
    || normalizeText(bookRecord?.title)
    || normalizeText(bookRecord?.short_title)
    || "Insight";
}

function getInsightCaption(bookRecord, existingBlock = null) {
  return normalizeText(existingBlock?.data?.caption)
    || normalizeText(existingBlock?.data?.body)
    || normalizeText(bookRecord?.insight_caption)
    || "";
}

function getBookInsightBlockId(bookId) {
  return `content-block-books-${bookId}-insight`;
}

function getBookInsightMediaAssetId(bookId) {
  return `media-asset-${bookId}-insight-media`;
}

function getSeedInsightMediaAsset(mediaAssets = []) {
  return mediaAssets.find((asset) => asset?.id === "media-asset-insight-default-image")
    || mediaAssets.find((asset) => asset?.metadata?.source === "legacy-insight-media" && !asset?.metadata?.owner_id)
    || null;
}

function findExistingBookInsightBlock(bookRecord, contentBlocks = []) {
  return contentBlocks.find((block) =>
    block?.owner_entity === "books"
    && block?.owner_id === bookRecord?.id
    && block?.region === "insight"
  ) || null;
}

function findExistingBookMediaAsset(bookRecord, mediaAssets = [], insightBlock = null) {
  const explicitAssetId = normalizeText(insightBlock?.data?.media_asset_id);
  if (explicitAssetId) {
    const explicitAsset = mediaAssets.find((asset) => asset?.id === explicitAssetId) || null;
    if (explicitAsset) {
      return explicitAsset;
    }
  }

  const desiredAssetId = getBookInsightMediaAssetId(bookRecord?.id || "");
  return mediaAssets.find((asset) =>
    asset?.id === desiredAssetId
    || (asset?.metadata?.owner_entity === "books" && asset?.metadata?.owner_id === bookRecord?.id)
  ) || null;
}

export function buildProvisionedBookInsightMediaAsset(bookRecord, mediaAssets = [], insightBlock = null) {
  const existingAsset = findExistingBookMediaAsset(bookRecord, mediaAssets, insightBlock);
  if (existingAsset) {
    return existingAsset;
  }

  const seedAsset = getSeedInsightMediaAsset(mediaAssets);
  const bookId = normalizeText(bookRecord?.id);
  const seededSrc = normalizeText(bookRecord?.insight_media)
    || createOwnerScopedMediaSrc(seedAsset?.src || FALLBACK_INSIGHT_MEDIA, bookId);
  const provider = inferMediaProvider(seededSrc, seedAsset?.provider || "");

  return {
    id: getBookInsightMediaAssetId(bookId),
    asset_type: inferMediaAssetType(seededSrc, seedAsset?.asset_type || "image"),
    title: `${getInsightTitle(bookRecord, insightBlock)} Insight Media`,
    src: seededSrc,
    alt_text: `${getInsightTitle(bookRecord, insightBlock)} media`,
    caption: getInsightCaption(bookRecord, insightBlock) || null,
    provider,
    metadata: {
      source: "admin-generated-book-insight-media",
      owner_entity: "books",
      owner_id: bookId,
      seeded_from_asset_id: seedAsset?.id || null,
    },
  };
}

export function buildProvisionedBookInsightBlock(bookRecord, mediaAssetRecord, contentBlocks = []) {
  const existingBlock = findExistingBookInsightBlock(bookRecord, contentBlocks);
  const status = normalizeText(existingBlock?.status) || (bookRecord?.is_published ? "published" : "draft");

  return {
    id: normalizeText(existingBlock?.id) || getBookInsightBlockId(bookRecord?.id || ""),
    owner_entity: "books",
    owner_id: normalizeText(bookRecord?.id),
    region: "insight",
    block_type: "media",
    variant: existingBlock?.variant ?? null,
    position: Number(existingBlock?.position) > 0 ? Number(existingBlock.position) : 1,
    status,
    visibility: normalizeText(existingBlock?.visibility) || "public",
    is_published: existingBlock?.is_published == null ? status === "published" : Boolean(existingBlock.is_published),
    data: {
      title: getInsightTitle(bookRecord, existingBlock),
      media_asset_id: normalizeText(mediaAssetRecord?.id),
      caption: getInsightCaption(bookRecord, existingBlock),
    },
    created_at: existingBlock?.created_at,
    updated_at: existingBlock?.updated_at,
  };
}

export function provisionBookInsightRecords({
  bookRecord,
  contentBlocks = [],
  mediaAssets = [],
}) {
  const insightBlock = findExistingBookInsightBlock(bookRecord, contentBlocks);
  const mediaAsset = buildProvisionedBookInsightMediaAsset(bookRecord, mediaAssets, insightBlock);
  const provisionedBlock = buildProvisionedBookInsightBlock(bookRecord, mediaAsset, contentBlocks);

  const nextMediaAssets = findExistingBookMediaAsset(bookRecord, mediaAssets, insightBlock)
    ? mediaAssets.map((asset) => (asset.id === mediaAsset.id ? mediaAsset : asset))
    : [...mediaAssets, mediaAsset];

  const nextContentBlocks = insightBlock
    ? contentBlocks.map((block) => (block.id === insightBlock.id ? provisionedBlock : block))
    : [...contentBlocks, provisionedBlock];

  return {
    mediaAsset,
    insightBlock: provisionedBlock,
    nextMediaAssets,
    nextContentBlocks,
  };
}
