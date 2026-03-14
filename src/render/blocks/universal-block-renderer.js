import { DEFAULT_INSIGHT_MEDIA } from "../../content/renderers/renderer-utils.js";
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

function createBlockShell(block, extraClassName = "") {
    const article = document.createElement("article");
    article.className = ["explanation-block", extraClassName].filter(Boolean).join(" ");
    article.dataset.blockType = block.block_type || block.type || "";
    article.dataset.blockId = block.id || "";
    article.dataset.blockRegion = block.region || "body";
    return article;
}

function resolveMediaSource(block) {
    return block?.resolvedMediaAsset?.src
        || block?.data?.media_src
        || block?.data?.src
        || "";
}

function resolveMediaAlt(block) {
    return block?.resolvedMediaAsset?.alt_text
        || block?.data?.media_alt
        || block?.data?.alt
        || block?.resolvedMediaAsset?.title
        || block?.data?.title
        || "Content media";
}

function createRichTextBlock(block) {
    if (block.variant === "divider" && !String(block?.data?.body || "").trim()) {
        const article = createBlockShell(block, "is-divider");
        const divider = document.createElement("div");
        divider.className = "explanation-divider";
        divider.setAttribute("aria-hidden", "true");
        article.appendChild(divider);
        return article;
    }

    const article = createBlockShell(block, block.block_type === "commentary" ? "is-commentary" : "is-text-section");

    if (block?.data?.title) {
        const title = document.createElement("h3");
        title.className = "explanation-block-title";
        title.textContent = block.data.title;
        article.appendChild(title);
    }

    const body = document.createElement("div");
    body.className = "explanation-text";
    appendParagraphs(body, block?.data?.body || "");
    article.appendChild(body);
    return article;
}

function createImageLikeBlock(block) {
    const article = createBlockShell(block, block.block_type === "gallery" ? "is-gallery" : "is-image");
    const imageCard = document.createElement("div");
    imageCard.className = "explanation-image-card";

    const image = document.createElement("img");
    image.src = resolveMediaSource(block);
    image.alt = resolveMediaAlt(block);
    image.loading = "lazy";
    imageCard.appendChild(image);
    article.appendChild(imageCard);

    const captionText = block?.data?.caption || block?.resolvedMediaAsset?.caption || "";
    if (captionText) {
        const caption = document.createElement("div");
        caption.className = "explanation-text";
        appendParagraphs(caption, captionText);
        article.appendChild(caption);
    }

    return article;
}

function createVideoLikeBlock(block) {
    const article = createBlockShell(block, "is-video");

    if (block?.data?.title) {
        const title = document.createElement("h3");
        title.className = "explanation-block-title";
        title.textContent = block.data.title;
        article.appendChild(title);
    }

    const card = document.createElement("div");
    card.className = "video-player-card explanation-video-card";

    if (block?.data?.embed_url) {
        const frame = document.createElement("div");
        frame.className = "explanation-video-frame";

        const iframe = document.createElement("iframe");
        iframe.src = block.data.embed_url;
        iframe.title = block?.data?.title || "Content video";
        iframe.loading = "lazy";
        iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
        iframe.referrerPolicy = "strict-origin-when-cross-origin";
        iframe.allowFullscreen = true;
        frame.appendChild(iframe);
        card.appendChild(frame);
    } else if (resolveMediaSource(block)) {
        const preview = document.createElement("div");
        preview.className = "video-player";

        const image = document.createElement("img");
        image.src = resolveMediaSource(block);
        image.alt = resolveMediaAlt(block);
        image.loading = "lazy";
        preview.appendChild(image);

        const playButton = document.createElement("button");
        playButton.className = "play-button";
        playButton.type = "button";
        playButton.setAttribute("aria-label", `Play ${block?.data?.title || "content"} media`);
        preview.appendChild(playButton);
        card.appendChild(preview);
    }

    if (block?.data?.url) {
        const link = document.createElement("a");
        link.className = "btn btn-primary explanation-video-link";
        link.href = block.data.url;
        link.target = "_blank";
        link.rel = "noreferrer";
        link.textContent = block?.data?.embed_url ? "Open Video Source" : "Open Media";
        card.appendChild(link);
    }

    if (block?.data?.caption) {
        const description = document.createElement("p");
        description.className = "video-caption";
        description.textContent = block.data.caption;
        card.appendChild(description);
    }

    article.appendChild(card);
    return article;
}

function createAudioBlock(block) {
    const article = createBlockShell(block, "is-audio");
    const card = document.createElement("div");
    card.className = "video-player-card explanation-audio-card";

    if (block?.data?.title) {
        const title = document.createElement("h3");
        title.className = "explanation-block-title";
        title.textContent = block.data.title;
        article.appendChild(title);
    }

    const audio = document.createElement("audio");
    audio.controls = true;
    audio.preload = "none";
    audio.src = resolveMediaSource(block);
    card.appendChild(audio);

    if (block?.data?.caption) {
        const caption = document.createElement("p");
        caption.className = "video-caption";
        caption.textContent = block.data.caption;
        card.appendChild(caption);
    }

    article.appendChild(card);
    return article;
}

function createQuoteBlock(block) {
    const article = createBlockShell(block, "is-quote");
    const quote = document.createElement("blockquote");
    quote.className = "explanation-text";
    appendParagraphs(quote, block?.data?.quote || "");
    article.appendChild(quote);

    if (block?.data?.attribution) {
        const attribution = document.createElement("p");
        attribution.className = "video-caption";
        attribution.textContent = block.data.attribution;
        article.appendChild(attribution);
    }

    return article;
}

function createRelatedEntitiesBlock(block) {
    const article = createBlockShell(block, "is-related-entities");

    if (block?.data?.title) {
        const title = document.createElement("h3");
        title.className = "explanation-block-title";
        title.textContent = block.data.title;
        article.appendChild(title);
    }

    const list = document.createElement("ul");
    list.className = "chip-list";

    (block?.data?.items || []).forEach((item) => {
        const entry = document.createElement("li");
        entry.className = "character-chip";
        entry.textContent = item.label || item.title || `${item.entity || "entity"}:${item.id || ""}`;
        list.appendChild(entry);
    });

    article.appendChild(list);
    return article;
}

function createCtaBlock(block) {
    const article = createBlockShell(block, "is-cta");

    const title = document.createElement("h3");
    title.className = "explanation-block-title";
    title.textContent = block?.data?.title || "Continue";
    article.appendChild(title);

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

function createGalleryBlock(block) {
    const article = createBlockShell(block, "is-gallery");

    if (block?.data?.title) {
        const title = document.createElement("h3");
        title.className = "explanation-block-title";
        title.textContent = block.data.title;
        article.appendChild(title);
    }

    const grid = document.createElement("div");
    grid.className = "character-grid";

    (block?.resolvedMediaAssets || []).forEach((asset) => {
        const figure = document.createElement("figure");
        figure.className = "explanation-image-card";

        const image = document.createElement("img");
        image.src = asset.src;
        image.alt = asset.alt_text || asset.title || "Gallery image";
        image.loading = "lazy";
        figure.appendChild(image);

        if (asset.caption) {
            const caption = document.createElement("figcaption");
            caption.className = "video-caption";
            caption.textContent = asset.caption;
            figure.appendChild(caption);
        }

        grid.appendChild(figure);
    });

    article.appendChild(grid);
    return article;
}

function createStatGridBlock(block) {
    const article = createBlockShell(block, "is-stat-grid");

    if (block?.data?.title) {
        const title = document.createElement("h3");
        title.className = "explanation-block-title";
        title.textContent = block.data.title;
        article.appendChild(title);
    }

    const grid = document.createElement("div");
    grid.className = "chapter-grid";

    (block?.data?.items || []).forEach((item) => {
        const card = document.createElement("article");
        card.className = "chapter-card";
        card.innerHTML = `
            <span class="lotus-small" aria-hidden="true"></span>
            <p class="chapter-title">${item.value || ""}</p>
            <p class="chapter-name">${item.label || ""}</p>
        `;
        grid.appendChild(card);
    });

    article.appendChild(grid);
    return article;
}

function createHeroBlock(block) {
    const article = createBlockShell(block, "is-hero");
    const title = document.createElement("h3");
    title.className = "explanation-block-title";
    title.textContent = block?.data?.title || "";
    article.appendChild(title);

    if (block?.data?.subtitle) {
        const subtitle = document.createElement("div");
        subtitle.className = "explanation-text";
        appendParagraphs(subtitle, block.data.subtitle);
        article.appendChild(subtitle);
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
        case "rich_text":
        case "commentary":
            return createRichTextBlock(block);
        case "image":
            return createImageLikeBlock(block);
        case "media":
            if (block?.data?.embed_url || block?.data?.url) {
                return createVideoLikeBlock(block);
            }
            return createImageLikeBlock(block);
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
