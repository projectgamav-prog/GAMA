export const DEFAULT_INSIGHT_MEDIA = "/assets/images/image.png";

function extractYouTubeVideoId(rawUrl = "") {
    if (!rawUrl) {
        return "";
    }

    try {
        const url = new URL(rawUrl);
        const host = url.hostname.replace(/^www\./, "");

        if (host === "youtu.be") {
            return url.pathname.split("/").filter(Boolean)[0] || "";
        }

        if (host.endsWith("youtube.com")) {
            if (url.pathname === "/watch") {
                return url.searchParams.get("v") || "";
            }

            const segments = url.pathname.split("/").filter(Boolean);
            if (segments[0] === "embed" || segments[0] === "shorts" || segments[0] === "live") {
                return segments[1] || "";
            }
        }
    } catch {
        return "";
    }

    return "";
}

export function deriveInsightEmbedUrl({ provider = "", src = "", embedUrl = "" } = {}) {
    if (embedUrl) {
        return embedUrl;
    }

    const normalizedProvider = String(provider || "").trim().toLowerCase();
    const youtubeVideoId = extractYouTubeVideoId(String(src || "").trim());

    if (normalizedProvider === "youtube" || youtubeVideoId) {
        return youtubeVideoId ? `https://www.youtube.com/embed/${youtubeVideoId}` : "";
    }

    return "";
}

export function createRouteHref(routeResolver, routeKey, params = {}) {
    if (typeof routeResolver !== "function") {
        return "#";
    }

    const resolved = routeResolver(routeKey, params) || "";
    if (!resolved) return "#";

    try {
        const url = new URL(resolved, window.location.origin);
        Object.entries(params).forEach(([key, value]) => {
            if (value == null || value === "") return;
            url.searchParams.set(key, value);
        });
        return `${url.pathname}${url.search}`;
    } catch {
        const search = new URLSearchParams(params).toString();
        return search ? `${resolved}?${search}` : resolved;
    }
}

export function getInsightContent(record, fallbackTitle, fallbackMedia) {
    const title = String(record.insight_title || "").trim() || String(fallbackTitle || "").trim();
    const caption = String(record.insight_caption || "").trim();
    const image = String(record.insight_media || "").trim();

    if (!title && !caption && !image) {
        return null;
    }

    return {
        buttonLabel: title || String(fallbackTitle || "").trim() || "Insight",
        title: title || String(fallbackTitle || "").trim() || "Insight",
        caption,
        image: image || fallbackMedia,
    };
}

export function getInsightMediaPresentation({
    title = "",
    image = "",
    alt = "",
    fallbackMedia = DEFAULT_INSIGHT_MEDIA,
    media = null,
} = {}) {
    const sourceMedia = media && typeof media === "object" ? media : null;
    const assetType = String(sourceMedia?.asset_type || sourceMedia?.assetType || "").trim().toLowerCase();
    const provider = String(sourceMedia?.provider || "").trim().toLowerCase();
    const src = String(sourceMedia?.src || sourceMedia?.url || image || "").trim();
    const embedUrl = deriveInsightEmbedUrl({
        provider,
        src,
        embedUrl: String(sourceMedia?.embed_url || sourceMedia?.embedUrl || "").trim(),
    });
    const previewImage = String(sourceMedia?.preview_image || sourceMedia?.previewImage || "").trim();
    const normalizedAlt = String(sourceMedia?.alt_text || sourceMedia?.alt || alt || `${title} thumbnail`).trim();
    const hasVideoSemantics = assetType === "video" || assetType === "embed" || Boolean(embedUrl);

    if (hasVideoSemantics) {
        return {
            kind: "video",
            assetType: assetType || (embedUrl ? "embed" : "video"),
            provider,
            src,
            embedUrl,
            previewImage: previewImage || "",
            alt: normalizedAlt,
        };
    }

    if (assetType === "audio") {
        return {
            kind: "audio",
            assetType,
            provider,
            src,
            embedUrl: "",
            previewImage: previewImage || "",
            alt: normalizedAlt,
        };
    }

    return {
        kind: "image",
        assetType: assetType || "image",
        provider,
        src: src || fallbackMedia,
        embedUrl: "",
        previewImage: previewImage || src || fallbackMedia,
        alt: normalizedAlt,
    };
}

export function createInsightDropdown({
    wrapperClassName,
    buttonId,
    panelId,
    buttonClassName = "",
    headingTag = "h3",
    title,
    image,
    alt,
    caption,
    fallbackMedia,
    media = null,
}) {
    const insight = getInsightContent(
        {
            insight_title: title,
            insight_media: image,
            insight_caption: caption,
        },
        title,
        fallbackMedia
    );
    if (!insight) {
        return null;
    }

    const wrapper = document.createElement("div");
    wrapper.className = wrapperClassName;

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
    text.textContent = insight.buttonLabel;

    button.append(icon, text);

    const panel = document.createElement("section");
    panel.className = `key-insight-dropdown${buttonClassName.includes("section-insight-btn") ? " section-insight-dropdown" : ""}${buttonClassName.includes("book-insight-btn") ? " book-insight-dropdown" : ""}${buttonClassName.includes("chapter-insight-btn") ? " chapter-insight-dropdown" : ""}`;
    panel.id = panelId;
    panel.setAttribute("aria-labelledby", buttonId);

    const card = document.createElement("div");
    card.className = "video-player-card";

    const heading = document.createElement(headingTag);
    heading.className = "section-title";
    heading.textContent = insight.title;
    const mediaPresentation = getInsightMediaPresentation({
        title: insight.title,
        image: insight.image,
        alt,
        fallbackMedia,
        media,
    });

    const description = document.createElement("p");
    description.className = "video-caption";
    description.textContent = insight.caption;

    card.appendChild(heading);

    if (mediaPresentation.kind === "video" && mediaPresentation.embedUrl) {
        const frame = document.createElement("div");
        frame.className = "explanation-video-frame insight-video-frame";

        const iframe = document.createElement("iframe");
        iframe.src = mediaPresentation.embedUrl;
        iframe.title = insight.title || "Insight video";
        iframe.loading = "lazy";
        iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
        iframe.referrerPolicy = "strict-origin-when-cross-origin";
        iframe.allowFullscreen = true;
        frame.appendChild(iframe);
        card.appendChild(frame);
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

        if (mediaPresentation.kind === "video") {
            const playButton = document.createElement("button");
            playButton.className = "play-button";
            playButton.type = "button";
            playButton.setAttribute("aria-label", `Play ${insight.title.toLowerCase()} video`);
            playButton.tabIndex = -1;
            playButton.setAttribute("aria-hidden", "true");
            player.appendChild(playButton);
        }

        card.appendChild(player);
    }

    if (mediaPresentation.src && mediaPresentation.kind !== "image" && mediaPresentation.kind !== "video") {
        const link = document.createElement("a");
        link.className = "btn btn-primary explanation-video-link";
        link.href = mediaPresentation.src;
        link.target = "_blank";
        link.rel = "noreferrer";
        link.textContent = "Open Media";
        card.appendChild(link);
    }

    card.appendChild(description);
    panel.appendChild(card);
    wrapper.append(button, panel);
    return wrapper;
}
