import {
    createInsightDropdown,
    DEFAULT_INSIGHT_MEDIA,
    getInsightMediaPresentation,
} from "../../content/renderers/renderer-utils.js";

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

function appendParagraphs(container, text) {
    String(text || "")
        .split(/\n{2,}/)
        .map((paragraph) => paragraph.trim())
        .filter(Boolean)
        .forEach((paragraph) => {
            const element = document.createElement("p");
            element.textContent = paragraph;
            container.appendChild(element);
        });
}

function renderVerseInsightContent(host, insight, fallbackMedia = DEFAULT_INSIGHT_MEDIA) {
    host.replaceChildren();

    const title = document.createElement("h2");
    title.className = "section-title";
    title.textContent = insight.title || insight.label || "Insight";
    host.appendChild(title);

    const mediaPresentation = getInsightMediaPresentation({
        title: insight.title || insight.label || "Insight",
        fallbackMedia,
        media: insight.media || null,
    });

    if (insight.media) {
        if (mediaPresentation.kind === "video" && mediaPresentation.embedUrl) {
            const frame = document.createElement("div");
            frame.className = "explanation-video-frame insight-video-frame";

            const iframe = document.createElement("iframe");
            iframe.src = mediaPresentation.embedUrl;
            iframe.title = insight.title || insight.label || "Insight video";
            iframe.loading = "lazy";
            iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
            iframe.referrerPolicy = "strict-origin-when-cross-origin";
            iframe.allowFullscreen = true;
            frame.appendChild(iframe);
            host.appendChild(frame);
        } else if (mediaPresentation.kind === "video" && mediaPresentation.src) {
            const video = document.createElement("video");
            video.className = "explanation-video";
            video.controls = true;
            video.preload = "metadata";
            video.src = mediaPresentation.src;
            host.appendChild(video);
        } else if (mediaPresentation.kind === "image" || mediaPresentation.previewImage) {
            const player = document.createElement("div");
            player.className = "video-player";

            const imageElement = document.createElement("img");
            imageElement.src = mediaPresentation.previewImage || mediaPresentation.src || fallbackMedia;
            imageElement.alt = mediaPresentation.alt;
            imageElement.loading = "lazy";
            imageElement.onerror = () => {
                imageElement.src = fallbackMedia;
            };
            player.appendChild(imageElement);
            host.appendChild(player);
        } else if (mediaPresentation.kind === "audio" && mediaPresentation.src) {
            const audio = document.createElement("audio");
            audio.className = "explanation-audio";
            audio.controls = true;
            audio.preload = "metadata";
            audio.src = mediaPresentation.src;
            host.appendChild(audio);
        } else if (mediaPresentation.kind === "link" && mediaPresentation.src) {
            const link = document.createElement("a");
            link.className = "btn btn-primary explanation-video-link";
            link.href = mediaPresentation.src;
            link.target = "_blank";
            link.rel = "noreferrer";
            link.textContent = "Open Media";
            host.appendChild(link);
        }
    }

    if (insight.caption) {
        const caption = document.createElement("p");
        caption.className = "video-caption";
        caption.textContent = insight.caption;
        host.appendChild(caption);
    }

    if (insight.body) {
        const body = document.createElement("div");
        body.className = "explanation-text";
        appendParagraphs(body, insight.body);
        host.appendChild(body);
    }
}

export function createVerseInsightDropdown({
    insights = [],
    wrapperClassName,
    buttonId,
    panelId,
    buttonClassName = "",
    fallbackMedia = DEFAULT_INSIGHT_MEDIA,
} = {}) {
    const options = Array.isArray(insights)
        ? [...insights].sort((left, right) => left.ui_order - right.ui_order || left.label.localeCompare(right.label))
        : [];
    if (!options.length) {
        return null;
    }

    const selectedInsight = options[0];
    const wrapper = document.createElement("div");
    wrapper.className = wrapperClassName || "verse-inline-insight";

    const button = document.createElement("button");
    button.className = `insight-btn${buttonClassName ? ` ${buttonClassName}` : ""}`;
    button.id = buttonId;
    button.type = "button";
    button.setAttribute("aria-expanded", "false");
    button.setAttribute("aria-controls", panelId);

    const icon = document.createElement("span");
    icon.className = "insight-btn-icon";
    icon.setAttribute("aria-hidden", "true");
    icon.innerHTML = "&#9662;";

    const text = document.createElement("span");
    text.textContent = selectedInsight.label || selectedInsight.title || "Insight";
    button.append(icon, text);

    const panel = document.createElement("section");
    panel.className = "key-insight-dropdown section-insight-dropdown";
    panel.id = panelId;
    panel.setAttribute("aria-labelledby", buttonId);

    const card = document.createElement("div");
    card.className = "video-player-card";

    let activeInsight = selectedInsight;

    if (options.length > 1) {
        const optionList = document.createElement("div");
        optionList.className = "verse-insight-option-list";

        options.forEach((insight) => {
            const optionButton = document.createElement("button");
            optionButton.type = "button";
            optionButton.className = "admin-inline-bar-link";
            optionButton.textContent = insight.label || insight.title || "Insight";
            optionButton.dataset.active = String(insight.id === activeInsight.id);
            optionButton.addEventListener("click", () => {
                activeInsight = insight;
                text.textContent = insight.label || insight.title || "Insight";
                Array.from(optionList.children).forEach((child) => {
                    child.dataset.active = String(child === optionButton);
                });
                renderVerseInsightContent(contentHost, activeInsight, fallbackMedia);
            });
            optionList.appendChild(optionButton);
        });

        card.appendChild(optionList);
    }

    const contentHost = document.createElement("div");
    contentHost.className = "verse-insight-content";
    renderVerseInsightContent(contentHost, activeInsight, fallbackMedia);
    card.appendChild(contentHost);

    panel.appendChild(card);
    wrapper.append(button, panel);
    return wrapper;
}
