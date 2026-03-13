export const DEFAULT_INSIGHT_MEDIA = "/assets/images/image.png";

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

    const player = document.createElement("div");
    player.className = "video-player";

    const imageElement = document.createElement("img");
    imageElement.src = insight.image;
    imageElement.alt = alt || `${insight.title} thumbnail`;
    imageElement.loading = "lazy";
    imageElement.onerror = () => {
        imageElement.src = fallbackMedia;
    };

    const playButton = document.createElement("button");
    playButton.className = "play-button";
    playButton.type = "button";
    playButton.setAttribute("aria-label", `Play ${insight.title.toLowerCase()} video`);

    player.append(imageElement, playButton);

    const description = document.createElement("p");
    description.className = "video-caption";
    description.textContent = insight.caption;

    card.append(heading, player, description);
    panel.appendChild(card);
    wrapper.append(button, panel);
    return wrapper;
}
