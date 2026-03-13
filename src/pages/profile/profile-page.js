(() => {
    const AUTH_STATE_EVENT = "auth:statechange";

    const body = document.body;
    if (!body || !body.classList.contains("profile-page")) return;
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
})();
