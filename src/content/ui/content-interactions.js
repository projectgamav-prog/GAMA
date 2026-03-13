function wrapChildren(container, className) {
    let inner = container.querySelector(`:scope > .${className}`);

    if (inner) return inner;

    inner = document.createElement("div");
    inner.className = className;

    while (container.firstChild) {
        inner.appendChild(container.firstChild);
    }

    container.appendChild(inner);
    return inner;
}

function initializeSectionCard(card, sectionCards) {
    if (card.dataset.contentSectionBound === "true") return;

    const summary = card.querySelector(".verse-group-summary, .chapter-group-summary");
    const body = card.querySelector(".verse-group-body, .chapter-group-body");

    if (!summary || !body) return;

    let collapseToggle = summary.querySelector(".section-collapse-toggle");
    if (!collapseToggle) {
        collapseToggle = document.createElement("button");
        collapseToggle.type = "button";
        collapseToggle.className = "section-collapse-toggle";
        collapseToggle.setAttribute("aria-label", "Toggle section");
        const meta = summary.querySelector(".verse-group-meta, .chapter-group-meta");
        if (meta) {
            meta.insertAdjacentElement("afterend", collapseToggle);
        } else {
            summary.appendChild(collapseToggle);
        }
    }

    if (card.open) {
        card.classList.add("is-expanded");
    }

    let isTransitioning = false;
    let pinnedViewportTop = null;
    let pinFrameId = null;

    function stopPinning() {
        if (pinFrameId !== null) {
            cancelAnimationFrame(pinFrameId);
            pinFrameId = null;
        }
    }

    function pinSectionInView() {
        if (pinnedViewportTop === null) return;

        const currentViewportTop = summary.getBoundingClientRect().top;
        const delta = currentViewportTop - pinnedViewportTop;

        if (Math.abs(delta) > 0.5) {
            window.scrollTo(0, Math.max(0, window.scrollY + delta));
        }

        pinFrameId = requestAnimationFrame(pinSectionInView);
    }

    function finishClose() {
        card.open = false;
        isTransitioning = false;
        stopPinning();
        pinnedViewportTop = null;
    }

    function closeCard() {
        if (!card.classList.contains("is-expanded") || isTransitioning) return;

        isTransitioning = true;

        const handleClose = (transitionEvent) => {
            if (transitionEvent.propertyName !== "grid-template-rows") return;

            body.removeEventListener("transitionend", handleClose);
            finishClose();
        };

        body.addEventListener("transitionend", handleClose);
        card.classList.remove("is-expanded");
    }

    function openCard() {
        if (isTransitioning || card.classList.contains("is-expanded")) return;

        pinnedViewportTop = summary.getBoundingClientRect().top;
        stopPinning();
        pinSectionInView();

        isTransitioning = true;

        const handleOpen = (transitionEvent) => {
            if (transitionEvent.propertyName !== "grid-template-rows") return;

            body.removeEventListener("transitionend", handleOpen);
            isTransitioning = false;
            stopPinning();
            pinnedViewportTop = null;
        };

        sectionCards.forEach((otherCard) => {
            if (otherCard === card) return;

            if (otherCard.classList.contains("is-expanded")) {
                otherCard.classList.remove("is-expanded");
                const otherBody = otherCard.querySelector(".verse-group-body, .chapter-group-body");

                if (otherBody) {
                    const handleOtherClose = (otherTransitionEvent) => {
                        if (otherTransitionEvent.propertyName !== "grid-template-rows") return;

                        otherBody.removeEventListener("transitionend", handleOtherClose);
                        otherCard.open = false;
                    };

                    otherBody.addEventListener("transitionend", handleOtherClose);
                }
            }
        });

        body.addEventListener("transitionend", handleOpen);
        card.open = true;
        body.offsetHeight;
        card.classList.add("is-expanded");
    }

    collapseToggle.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();

        if (isTransitioning) return;

        if (!card.classList.contains("is-expanded")) {
            openCard();
            return;
        }

        pinnedViewportTop = summary.getBoundingClientRect().top;
        stopPinning();
        pinSectionInView();
        closeCard();
    });

    summary.addEventListener("click", (event) => {
        event.preventDefault();
        openCard();
    });

    card.dataset.contentSectionBound = "true";
}

function initializeInsightToggle(toggle) {
    if (toggle.dataset.contentInsightBound === "true") return;

    const panelId = toggle.getAttribute("aria-controls");
    const panel = panelId ? document.getElementById(panelId) : null;

    if (!panel) return;

    wrapChildren(panel, "key-insight-inner");
    panel.classList.remove("is-open");
    panel.setAttribute("aria-hidden", "true");

    toggle.addEventListener("click", () => {
        const nextExpanded = toggle.getAttribute("aria-expanded") !== "true";

        toggle.setAttribute("aria-expanded", String(nextExpanded));
        toggle.classList.toggle("is-open", nextExpanded);
        panel.classList.toggle("is-open", nextExpanded);
        panel.setAttribute("aria-hidden", String(!nextExpanded));
    });

    toggle.dataset.contentInsightBound = "true";
}

export function initializeContentInteractions(root = document) {
    const scope = root && typeof root.querySelectorAll === "function" ? root : document;
    const sectionCards = Array.from(scope.querySelectorAll(".verse-group-card, .chapter-group-card"));

    sectionCards.forEach((card) => {
        initializeSectionCard(card, sectionCards);
    });

    scope.querySelectorAll(".verse-group-body, .chapter-group-body").forEach((body) => {
        wrapChildren(body, "verse-group-body-inner");
    });

    scope.querySelectorAll(".insight-btn[aria-controls]").forEach((toggle) => {
        initializeInsightToggle(toggle);
    });
}

window.initializeContentInteractions = initializeContentInteractions;
initializeContentInteractions(document);
