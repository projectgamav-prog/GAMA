import { createSharedPageDefinition } from "../shared-page.js";

const AUTH_STATE_EVENT = "auth:statechange";

function initializeProfilePage() {
    const body = document.body;
    if (!body) return;
    const storage = window.authStorage;
    if (!storage) return;

    const heroCard = document.getElementById("profileHeroCard");
    const detailGrid = document.getElementById("profileDetailGrid");
    const emptyState = document.getElementById("profileEmptyState");
    const loginButton = document.getElementById("profileLoginBtn");
    const avatar = document.getElementById("profileAvatar");
    const heading = document.getElementById("profileHeading");
    const summary = document.getElementById("profileSummary");
    const chips = document.getElementById("profileChips");
    const fullName = document.getElementById("profileFullName");
    const username = document.getElementById("profileUsername");
    const email = document.getElementById("profileEmail");
    const interestsText = document.getElementById("profileInterestsText");
    const interestChips = document.getElementById("profileInterestChips");
    const createdAt = document.getElementById("profileCreatedAt");
    const loggedInAt = document.getElementById("profileLoggedInAt");

    function formatDate(value) {
        if (!value) return "Not available";
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return "Not available";
        return new Intl.DateTimeFormat("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
        }).format(date);
    }

    function createChip(label) {
        const chip = document.createElement("span");
        chip.className = "profile-chip";
        chip.textContent = label;
        return chip;
    }

    function setLoggedOutState() {
        heroCard.hidden = true;
        detailGrid.hidden = true;
        emptyState.hidden = false;
    }

    function setLoggedInState(user) {
        const session = storage.getSession();
        const userInterests = Array.isArray(user.interests) ? user.interests : [];
        const roleIds = storage.getRoleIds ? storage.getRoleIds() : [];

        emptyState.hidden = true;
        heroCard.hidden = false;
        detailGrid.hidden = false;

        avatar.textContent = (user.username || user.fullName || "P").slice(0, 1).toUpperCase();
        heading.textContent = user.fullName || "Your Profile";
        summary.textContent = `Signed in as @${user.username}. This profile reflects your active server-backed session${roleIds.length ? ` and ${roleIds.join(", ")} role${roleIds.length === 1 ? "" : "s"}` : ""}.`;

        chips.replaceChildren(
            createChip(user.username ? `@${user.username}` : "Account"),
            createChip(user.email || "Email unavailable"),
            createChip(userInterests.length ? `${userInterests.length} Interests` : "No Interests")
        );

        fullName.textContent = user.fullName || "Not available";
        username.textContent = user.username ? `@${user.username}` : "Not available";
        email.textContent = user.email || "Not available";

        interestsText.textContent = userInterests.length
            ? "These topics help shape future personalization in this prototype."
            : "No interests selected yet.";
        interestChips.replaceChildren();
        if (userInterests.length) {
            userInterests.forEach((interest) => interestChips.appendChild(createChip(interest)));
        } else {
            interestChips.appendChild(createChip("No interests selected"));
        }

        createdAt.textContent = formatDate(user.createdAt);
        loggedInAt.textContent = formatDate(session?.loggedInAt);
    }

    function openLoginModal() {
        if (!window.authUI?.openLoginModal) return;
        window.authUI.openLoginModal();
    }

    function renderFromUser(user) {
        if (!user) {
            setLoggedOutState();
            openLoginModal();
            return;
        }

        setLoggedInState(user);
    }

    loginButton?.addEventListener("click", () => {
        openLoginModal();
    });

    window.addEventListener(AUTH_STATE_EVENT, (event) => {
        const user = event.detail?.user || null;
        renderFromUser(user);
    });

    storage.ready.finally(() => {
        renderFromUser(storage.toPublicUser(storage.getCurrentUser()));
    });
}

export const PROFILE_PAGE_DEFINITION = createSharedPageDefinition({
    id: "profile",
    title: "Bhagavad Gita | Profile",
    bodyClasses: ["profile-page"],
    bodyDataset: {
        navSection: "education",
        footerVariant: "profile",
    },
    shellClassName: "profile-shell",
    render() {
        return `
            <main class="profile-main">
                <nav class="profile-breadcrumb" aria-label="Breadcrumb">
                    <a href="#" data-route="home">Home</a>
                    <span>&gt;</span>
                    <span>Profile</span>
                </nav>

                <section class="profile-hero-card" id="profileHeroCard" hidden>
                    <div class="profile-avatar-large" id="profileAvatar" aria-hidden="true">P</div>
                    <div class="profile-hero-content">
                        <p class="profile-eyebrow">Logged-in Account</p>
                        <h1 id="profileHeading">Your Profile</h1>
                        <p class="profile-summary" id="profileSummary">Your account details will appear here.</p>
                        <div class="profile-chip-list" id="profileChips"></div>
                    </div>
                </section>

                <section class="profile-detail-grid" id="profileDetailGrid" hidden>
                    <article class="profile-detail-panel">
                        <p class="profile-panel-label">Account Info</p>
                        <h2>Identity</h2>
                        <dl class="profile-meta-list">
                            <div class="profile-meta-row">
                                <dt>Full Name</dt>
                                <dd id="profileFullName">-</dd>
                            </div>
                            <div class="profile-meta-row">
                                <dt>Username</dt>
                                <dd id="profileUsername">-</dd>
                            </div>
                            <div class="profile-meta-row">
                                <dt>Email</dt>
                                <dd id="profileEmail">-</dd>
                            </div>
                        </dl>
                    </article>

                    <article class="profile-detail-panel">
                        <p class="profile-panel-label">Interests</p>
                        <h2>Learning Preferences</h2>
                        <p id="profileInterestsText">Your chosen interests will appear here.</p>
                        <div class="profile-chip-list" id="profileInterestChips"></div>
                    </article>

                    <article class="profile-detail-panel">
                        <p class="profile-panel-label">Status</p>
                        <h2>Prototype Account</h2>
                        <dl class="profile-meta-list">
                            <div class="profile-meta-row">
                                <dt>Created</dt>
                                <dd id="profileCreatedAt">-</dd>
                            </div>
                            <div class="profile-meta-row">
                                <dt>Logged In</dt>
                                <dd id="profileLoggedInAt">-</dd>
                            </div>
                        </dl>
                        <p>This is a frontend-only prototype account stored in your browser.</p>
                    </article>
                </section>

                <section class="profile-empty-state" id="profileEmptyState" hidden>
                    <div class="profile-avatar-large" aria-hidden="true">?</div>
                    <p class="profile-eyebrow">Sign In Required</p>
                    <h1>Your profile is ready when you log in</h1>
                    <p>Stay on this page and sign in to load your saved account details from this browser.</p>
                    <button class="profile-login-btn" id="profileLoginBtn" type="button">Open Login</button>
                </section>
            </main>
        `;
    },
    init: initializeProfilePage,
});

export { PROFILE_PAGE_DEFINITION as PAGE_DEFINITION };
