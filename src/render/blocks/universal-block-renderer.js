import {
    DEFAULT_INSIGHT_MEDIA,
    deriveInsightEmbedUrl,
} from "../../content/renderers/renderer-utils.js";
import { createInsightDropdownFromBlock } from "../pages/insight-dropdown-renderer.js";

function appendParagraphs(container, text) {
    const paragraphs = String(text || "")
        .split(/\n{2,}/)
        .map((paragraph) => paragraph.trim())
        .filter(Boolean);

    paragraphs.forEach((paragraph) => {
        const element = document.createElement("p");
        element.textContent = paragraph;
        container.appendChild(element);
    });
}

function normalizeText(value) {
    return String(value || "").trim();
}

function createBlockShell(block, extraClassName = "") {
    const article = document.createElement("article");
    article.className = ["explanation-block", extraClassName].filter(Boolean).join(" ");
    article.dataset.blockType = block.block_type || block.type || "";
    article.dataset.blockId = block.id || "";
    article.dataset.blockRegion = block.region || "body";
    return article;
}

function appendBlockTitle(article, titleText) {
    if (!normalizeText(titleText)) {
        return;
    }

    const title = document.createElement("h3");
    title.className = "explanation-block-title";
    title.textContent = titleText;
    article.appendChild(title);
}

function appendCaption(container, captionText, className = "video-caption") {
    if (!normalizeText(captionText)) {
        return;
    }

    const caption = document.createElement("p");
    caption.className = className;
    caption.textContent = captionText;
    container.appendChild(caption);
}

function getResolvedAssetType(block) {
    return normalizeText(block?.resolvedMediaAsset?.asset_type).toLowerCase();
}

function getMediaTitle(block) {
    return normalizeText(block?.data?.title)
        || normalizeText(block?.resolvedMediaAsset?.title)
        || "Content media";
}

function getMediaCaption(block) {
    return normalizeText(block?.data?.caption)
        || normalizeText(block?.resolvedMediaAsset?.caption)
        || "";
}

function getMediaAlt(block) {
    return normalizeText(block?.data?.alt_text)
        || normalizeText(block?.data?.alt)
        || normalizeText(block?.data?.media_alt)
        || normalizeText(block?.resolvedMediaAsset?.alt_text)
        || normalizeText(block?.resolvedMediaAsset?.title)
        || getMediaTitle(block);
}

function getMediaSource(block) {
    return normalizeText(block?.resolvedMediaAsset?.src)
        || normalizeText(block?.data?.src)
        || normalizeText(block?.data?.media_src)
        || "";
}

function getMediaEmbedUrl(block) {
    const source = getMediaSource(block);
    const provider = normalizeText(block?.data?.provider)
        || normalizeText(block?.resolvedMediaAsset?.provider);
    const explicitEmbed = normalizeText(block?.data?.embed_url)
        || normalizeText(block?.resolvedMediaAsset?.metadata?.embed_url)
        || normalizeText(block?.resolvedMediaAsset?.embed_url);

    return deriveInsightEmbedUrl({
        provider,
        src: source,
        embedUrl: explicitEmbed,
    });
}

function inferMediaKind(block) {
    const resolvedType = getResolvedAssetType(block);
    if (resolvedType) {
        return resolvedType;
    }

    const hintedKind = normalizeText(block?.data?.media_kind).toLowerCase();
    if (hintedKind) {
        return hintedKind;
    }

    const embedUrl = getMediaEmbedUrl(block);
    if (embedUrl) {
        return "embed";
    }

    const source = getMediaSource(block).toLowerCase();
    if (/\.(png|jpe?g|gif|webp|svg|avif)(\?|#|$)/i.test(source)) {
        return "image";
    }

    if (/\.(mp4|webm|ogg|mov|m4v)(\?|#|$)/i.test(source)) {
        return "video";
    }

    if (/\.(mp3|wav|m4a|aac|oga|ogg)(\?|#|$)/i.test(source)) {
        return "audio";
    }

    if (/\.(pdf|docx?|pptx?|xlsx?|txt)(\?|#|$)/i.test(source)) {
        return "document";
    }

    return source ? "image" : "";
}

function createTextBlock(block, extraClassName = "") {
    if (block.variant === "divider" && !normalizeText(block?.data?.body)) {
        const article = createBlockShell(block, "is-divider");
        const divider = document.createElement("div");
        divider.className = "explanation-divider";
        divider.setAttribute("aria-hidden", "true");
        article.appendChild(divider);
        return article;
    }

    const article = createBlockShell(
        block,
        extraClassName || (block.block_type === "commentary" ? "is-commentary" : "is-text-section")
    );

    appendBlockTitle(article, block?.data?.title);

    const body = document.createElement("div");
    body.className = "explanation-text";
    appendParagraphs(body, block?.data?.body || "");
    article.appendChild(body);
    return article;
}

function createImageFigure({ src, alt, caption }) {
    const card = document.createElement("figure");
    card.className = "explanation-image-card";

    const image = document.createElement("img");
    image.src = src || DEFAULT_INSIGHT_MEDIA;
    image.alt = alt || "Content image";
    image.loading = "lazy";
    card.appendChild(image);

    if (caption) {
        const figureCaption = document.createElement("figcaption");
        figureCaption.className = "video-caption";
        figureCaption.textContent = caption;
        card.appendChild(figureCaption);
    }

    return card;
}

function createImageBlock(block) {
    const source = getMediaSource(block);
    if (!source) {
        return null;
    }

    const article = createBlockShell(block, "is-image");
    appendBlockTitle(article, getMediaTitle(block));
    article.appendChild(
        createImageFigure({
            src: source,
            alt: getMediaAlt(block),
            caption: getMediaCaption(block),
        })
    );
    return article;
}

function createVideoFrame(embedUrl, titleText) {
    const frame = document.createElement("div");
    frame.className = "explanation-video-frame";

    const iframe = document.createElement("iframe");
    iframe.src = embedUrl;
    iframe.title = titleText || "Content video";
    iframe.loading = "lazy";
    iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
    iframe.referrerPolicy = "strict-origin-when-cross-origin";
    iframe.allowFullscreen = true;
    frame.appendChild(iframe);
    return frame;
}

function createMediaLink(url, text) {
    const link = document.createElement("a");
    link.className = "btn btn-primary explanation-video-link";
    link.href = url;
    link.target = "_blank";
    link.rel = "noreferrer";
    link.textContent = text;
    return link;
}

function createVideoBlock(block) {
    const article = createBlockShell(block, "is-video");
    const titleText = getMediaTitle(block);
    const source = getMediaSource(block);
    const embedUrl = getMediaEmbedUrl(block);
    const mediaKind = inferMediaKind(block);

    appendBlockTitle(article, titleText);

    const card = document.createElement("div");
    card.className = "video-player-card explanation-media-card";

    if (embedUrl) {
        card.appendChild(createVideoFrame(embedUrl, titleText));
    } else if (source && (mediaKind === "video" || mediaKind === "embed")) {
        const video = document.createElement("video");
        video.controls = true;
        video.preload = "none";
        video.src = source;
        card.appendChild(video);
    } else if (source) {
        card.appendChild(
            createImageFigure({
                src: source,
                alt: getMediaAlt(block),
                caption: "",
            })
        );
    }

    appendCaption(card, getMediaCaption(block));
    article.appendChild(card);
    return article;
}

function createAudioBlock(block) {
    const source = getMediaSource(block);
    if (!source) {
        return null;
    }

    const article = createBlockShell(block, "is-audio");
    appendBlockTitle(article, getMediaTitle(block));

    const card = document.createElement("div");
    card.className = "video-player-card explanation-audio-card";

    const audio = document.createElement("audio");
    audio.controls = true;
    audio.preload = "none";
    audio.src = source;
    card.appendChild(audio);
    appendCaption(card, getMediaCaption(block));
    article.appendChild(card);
    return article;
}

function createDocumentBlock(block) {
    const source = getMediaSource(block);
    if (!source) {
        return null;
    }

    const article = createBlockShell(block, "is-media");
    appendBlockTitle(article, getMediaTitle(block));

    const card = document.createElement("div");
    card.className = "explanation-document-card";

    const label = document.createElement("p");
    label.className = "explanation-document-type";
    label.textContent = inferMediaKind(block) || "document";
    card.appendChild(label);

    card.appendChild(createMediaLink(source, "Open Document"));
    appendCaption(card, getMediaCaption(block));
    article.appendChild(card);
    return article;
}

function createMediaBlock(block) {
    switch (inferMediaKind(block)) {
        case "image":
            return createImageBlock(block);
        case "video":
        case "embed":
            return createVideoBlock(block);
        case "audio":
            return createAudioBlock(block);
        case "document":
            return createDocumentBlock(block);
        default:
            return createImageBlock(block);
    }
}

function createQuoteBlock(block) {
    const article = createBlockShell(block, "is-quote");
    const quote = document.createElement("blockquote");
    quote.className = "explanation-text";
    appendParagraphs(quote, block?.data?.quote || "");
    article.appendChild(quote);
    appendCaption(article, block?.data?.attribution, "explanation-quote-attribution");
    return article;
}

function createRelatedEntitiesBlock(block) {
    const article = createBlockShell(block, "is-related-entities");
    appendBlockTitle(article, block?.data?.title);

    const grid = document.createElement("div");
    grid.className = "explanation-related-grid";

    (block?.data?.items || []).forEach((item) => {
        const card = document.createElement("article");
        card.className = "explanation-related-card";

        const label = document.createElement("strong");
        label.textContent = item.label || item.title || item.id || "Related entity";
        card.appendChild(label);

        if (item.entity || item.id) {
            const meta = document.createElement("p");
            meta.className = "video-caption";
            meta.textContent = [item.entity, item.id].filter(Boolean).join(" • ");
            card.appendChild(meta);
        }

        grid.appendChild(card);
    });

    article.appendChild(grid);
    return article;
}

function createCtaBlock(block) {
    const article = createBlockShell(block, "is-cta");
    appendBlockTitle(article, block?.data?.title || "Continue");

    if (block?.data?.body) {
        const copy = document.createElement("div");
        copy.className = "explanation-text";
        appendParagraphs(copy, block.data.body);
        article.appendChild(copy);
    }

    if (block?.data?.href && block?.data?.label) {
        const link = document.createElement("a");
        link.className = "btn btn-primary explanation-video-link";
        link.href = block.data.href;
        link.textContent = block.data.label;
        article.appendChild(link);
    }

    return article;
}

function createGalleryAssetTile(asset) {
    const mockBlock = {
        data: {
            title: asset?.title,
            caption: asset?.caption,
            alt_text: asset?.alt_text,
        },
        resolvedMediaAsset: asset,
    };
    const mediaKind = inferMediaKind(mockBlock);

    const tile = document.createElement("div");
    tile.className = "explanation-gallery-item";

    if (mediaKind === "image") {
        tile.appendChild(
            createImageFigure({
                src: normalizeText(asset?.src),
                alt: normalizeText(asset?.alt_text) || normalizeText(asset?.title) || "Gallery media",
                caption: normalizeText(asset?.caption),
            })
        );
        return tile;
    }

    if (mediaKind === "video" || mediaKind === "embed") {
        const embedUrl = deriveInsightEmbedUrl({
            provider: normalizeText(asset?.provider),
            src: normalizeText(asset?.src),
            embedUrl: normalizeText(asset?.metadata?.embed_url),
        });

        const card = document.createElement("div");
        card.className = "video-player-card explanation-media-card";
        if (embedUrl) {
            card.appendChild(createVideoFrame(embedUrl, normalizeText(asset?.title) || "Gallery video"));
        } else if (normalizeText(asset?.src)) {
            const video = document.createElement("video");
            video.controls = true;
            video.preload = "none";
            video.src = asset.src;
            card.appendChild(video);
        }

        if (normalizeText(asset?.src)) {
            card.appendChild(createMediaLink(asset.src, "Open Media"));
        }

        appendCaption(card, normalizeText(asset?.caption));
        tile.appendChild(card);
        return tile;
    }

    if (mediaKind === "audio") {
        const card = document.createElement("div");
        card.className = "video-player-card explanation-audio-card";

        const audio = document.createElement("audio");
        audio.controls = true;
        audio.preload = "none";
        audio.src = asset.src;
        card.appendChild(audio);
        appendCaption(card, normalizeText(asset?.caption));
        tile.appendChild(card);
        return tile;
    }

    const card = document.createElement("div");
    card.className = "explanation-document-card";
    if (normalizeText(asset?.title)) {
        const title = document.createElement("strong");
        title.textContent = asset.title;
        card.appendChild(title);
    }
    if (normalizeText(asset?.src)) {
        card.appendChild(createMediaLink(asset.src, "Open Document"));
    }
    appendCaption(card, normalizeText(asset?.caption));
    tile.appendChild(card);
    return tile;
}

function createGalleryBlock(block) {
    const article = createBlockShell(block, "is-gallery");
    appendBlockTitle(article, block?.data?.title);

    const grid = document.createElement("div");
    grid.className = "explanation-gallery-grid";

    (block?.resolvedMediaAssets || []).forEach((asset) => {
        grid.appendChild(createGalleryAssetTile(asset));
    });

    article.appendChild(grid);
    appendCaption(article, block?.data?.caption);
    return article;
}

function createStatGridBlock(block) {
    const article = createBlockShell(block, "is-stat-grid");
    appendBlockTitle(article, block?.data?.title);

    const grid = document.createElement("div");
    grid.className = "explanation-stat-grid";

    (block?.data?.items || []).forEach((item) => {
        const card = document.createElement("article");
        card.className = "explanation-stat-card";

        const value = document.createElement("p");
        value.className = "chapter-title";
        value.textContent = item.value || "";

        const label = document.createElement("p");
        label.className = "chapter-name";
        label.textContent = item.label || "";

        card.append(value, label);
        grid.appendChild(card);
    });

    article.appendChild(grid);
    return article;
}

function createHeroBlock(block) {
    const article = createBlockShell(block, "is-hero");
    appendBlockTitle(article, block?.data?.title || "");

    if (block?.data?.subtitle) {
        const subtitle = document.createElement("div");
        subtitle.className = "explanation-text";
        appendParagraphs(subtitle, block.data.subtitle);
        article.appendChild(subtitle);
    }

    if (block?.data?.media_asset_id || block?.resolvedMediaAsset) {
        const mediaBlock = createMediaBlock({
            ...block,
            block_type: "media",
        });
        if (mediaBlock) {
            article.appendChild(mediaBlock.querySelector(".explanation-image-card, .video-player-card, .explanation-document-card") || mediaBlock);
        }
    }

    if (block?.data?.cta_href && block?.data?.cta_label) {
        article.appendChild(createMediaLink(block.data.cta_href, block.data.cta_label));
    }

    return article;
}

function createInsightDropdownBlock(block, renderOptions = {}) {
    if (renderOptions?.presentation !== "insight-dropdown") {
        return null;
    }

    const blockKey = block?.id || renderOptions.instanceKey || "block";

    return createInsightDropdownFromBlock({
        block,
        wrapperClassName: renderOptions.wrapperClassName || "book-row-insight",
        buttonId: renderOptions.buttonId || `insightToggle-${blockKey}`,
        panelId: renderOptions.panelId || `insightPanel-${blockKey}`,
        buttonClassName: renderOptions.buttonClassName || "",
        headingTag: renderOptions.headingTag || "h3",
        fallbackTitle: renderOptions.fallbackTitle || "",
        fallbackMedia: renderOptions.fallbackMedia || DEFAULT_INSIGHT_MEDIA,
        alt: renderOptions.alt || "",
    });
}

export function createUniversalBlockElement(block, renderOptions = {}) {
    const presentedInsight = createInsightDropdownBlock(block, renderOptions);
    if (presentedInsight) {
        return presentedInsight;
    }

    switch (block.block_type) {
        case "hero":
            return createHeroBlock(block);
        case "video":
            return createVideoBlock(block);
        case "rich_text":
        case "commentary":
            return createTextBlock(block);
        case "image":
            return createImageBlock(block);
        case "media":
            return createMediaBlock(block);
        case "audio":
            return createAudioBlock(block);
        case "quote":
            return createQuoteBlock(block);
        case "related_entities":
            return createRelatedEntitiesBlock(block);
        case "cta":
            return createCtaBlock(block);
        case "gallery":
            return createGalleryBlock(block);
        case "stat_grid":
            return createStatGridBlock(block);
        default:
            return null;
    }
}

export function renderUniversalBlocks({ container, blocks = [], emptyMessage = "", renderOptions = null } = {}) {
    if (!(container instanceof HTMLElement)) {
        return;
    }

    container.replaceChildren();

    const records = Array.isArray(blocks) ? blocks : [];
    if (!records.length) {
        if (!emptyMessage) {
            return;
        }

        const empty = document.createElement("p");
        empty.className = "explanation-text explanation-empty-state";
        empty.textContent = emptyMessage;
        container.appendChild(empty);
        return;
    }

    records.forEach((block) => {
        const element = createUniversalBlockElement(block, renderOptions || {});
        if (element) {
            container.appendChild(element);
        }
    });
}
