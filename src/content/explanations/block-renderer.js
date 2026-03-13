function appendParagraphs(container, text) {
    const paragraphs = String(text || "")
        .split(/\n{2,}/)
        .map((paragraph) => paragraph.trim())
        .filter(Boolean);

    if (!paragraphs.length) {
        return;
    }

    paragraphs.forEach((paragraph) => {
        const element = document.createElement("p");
        element.textContent = paragraph;
        container.appendChild(element);
    });
}

function createBlockShell(block, extraClassName = "") {
    const article = document.createElement("article");
    article.className = ["explanation-block", extraClassName].filter(Boolean).join(" ");
    article.dataset.blockType = block.type;
    article.dataset.blockId = block.id;
    article.dataset.blockVisible = String(block.is_visible);
    return article;
}

function createTextSectionBlock(block) {
    const article = createBlockShell(block, "is-text-section");
    const data = block.data_json || {};

    if (data.title) {
        const title = document.createElement("h3");
        title.className = "explanation-block-title";
        title.textContent = data.title;
        article.appendChild(title);
    }

    const body = document.createElement("div");
    body.className = "explanation-text";
    appendParagraphs(body, data.body);
    article.appendChild(body);
    return article;
}

function createVideoBlock(block) {
    const article = createBlockShell(block, "is-video");
    const data = block.data_json || {};

    if (data.title) {
        const title = document.createElement("h3");
        title.className = "explanation-block-title";
        title.textContent = data.title;
        article.appendChild(title);
    }

    const card = document.createElement("div");
    card.className = "video-player-card explanation-video-card";

    if (data.embed_url) {
        const frame = document.createElement("div");
        frame.className = "explanation-video-frame";

        const iframe = document.createElement("iframe");
        iframe.src = data.embed_url;
        iframe.title = data.title || "Explanation video";
        iframe.loading = "lazy";
        iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
        iframe.referrerPolicy = "strict-origin-when-cross-origin";
        iframe.allowFullscreen = true;
        frame.appendChild(iframe);
        card.appendChild(frame);
    }

    if (data.url) {
        const link = document.createElement("a");
        link.className = "btn btn-primary explanation-video-link";
        link.href = data.url;
        link.target = "_blank";
        link.rel = "noreferrer";
        link.textContent = data.embed_url ? "Open Video Source" : "Watch Video";
        card.appendChild(link);
    }

    if (data.description) {
        const description = document.createElement("p");
        description.className = "video-caption";
        description.textContent = data.description;
        card.appendChild(description);
    }

    article.appendChild(card);
    return article;
}

function createImageBlock(block) {
    const article = createBlockShell(block, "is-image");
    const data = block.data_json || {};

    const imageCard = document.createElement("div");
    imageCard.className = "explanation-image-card";

    const image = document.createElement("img");
    image.src = data.src || "";
    image.alt = data.alt || data.caption || "Explanation image";
    image.loading = "lazy";
    imageCard.appendChild(image);
    article.appendChild(imageCard);

    if (data.caption) {
        const caption = document.createElement("div");
        caption.className = "explanation-text";
        appendParagraphs(caption, data.caption);
        article.appendChild(caption);
    }

    return article;
}

function createDividerBlock(block) {
    const article = createBlockShell(block, "is-divider");
    const divider = document.createElement("div");
    divider.className = "explanation-divider";
    if (block.data_json?.style) {
        divider.dataset.dividerStyle = block.data_json.style;
    }
    divider.setAttribute("aria-hidden", "true");
    article.appendChild(divider);
    return article;
}

function createBlockElement(block) {
    switch (block.type) {
        case "text_section":
            return createTextSectionBlock(block);
        case "video":
            return createVideoBlock(block);
        case "image":
            return createImageBlock(block);
        case "divider":
            return createDividerBlock(block);
        default:
            return null;
    }
}

export function renderExplanationBlocks({
    container,
    blocks = [],
    emptyMessage = "Editorial explanation for this verse is still being prepared.",
} = {}) {
    if (!(container instanceof HTMLElement)) {
        return;
    }

    container.replaceChildren();

    const records = Array.isArray(blocks) ? blocks : [];
    if (!records.length) {
        const emptyState = document.createElement("p");
        emptyState.className = "explanation-text explanation-empty-state";
        emptyState.textContent = emptyMessage;
        container.appendChild(emptyState);
        return;
    }

    records.forEach((block) => {
        const element = createBlockElement(block);
        if (element) {
            container.appendChild(element);
        }
    });
}
