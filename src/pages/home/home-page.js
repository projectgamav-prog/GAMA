import { createSharedPageDefinition } from "../shared-page.js";

export const HOME_PAGE_DEFINITION = createSharedPageDefinition({
    id: "home",
    title: "Bhagavad Gita | Home",
    bodyDataset: {
        navSection: "home",
        footerVariant: "home",
    },
    render() {
        return `
            <main>
                <section class="hero">
                    <span class="lotus-large" aria-hidden="true"></span>
                    <h1>Bhagavad Gita</h1>
                    <p class="subtitle">Eternal Wisdom for Modern Life</p>
                    <a class="btn btn-primary" href="#" data-route="chapters.index">Start Reading</a>
                </section>

                <section class="content-block">
                    <h2 class="section-title">Today's Verse</h2>
                    <article class="verse-card">
                        <p class="verse-label">Verse 2.47</p>
                        <p class="verse-sanskrit">???????????????????<br>?? ????? ????? ?</p>
                        <p class="verse-translation">
                            You have a right to perform your duty,<br>
                            but not to the fruits of your actions.
                        </p>
                        <a class="btn btn-secondary" href="#" data-route="explanations.index">Read Explanation</a>
                    </article>
                </section>

                <section class="content-block">
                    <h2 class="section-title">Explore Chapters</h2>
                    <div class="chapter-grid">
                        <article class="chapter-card">
                            <span class="lotus-small" aria-hidden="true"></span>
                            <p class="chapter-title">Chapter 1</p>
                            <p class="chapter-name">Arjuna Vishada Yoga</p>
                            <a href="#" data-route="chapters.index" class="chapter-link">View Chapter</a>
                        </article>
                        <article class="chapter-card">
                            <span class="lotus-small" aria-hidden="true"></span>
                            <p class="chapter-title">Chapter 2</p>
                            <p class="chapter-name">Sankhya Yoga</p>
                            <a href="#" data-route="chapters.index" class="chapter-link">View Chapter</a>
                        </article>
                        <article class="chapter-card">
                            <span class="lotus-small" aria-hidden="true"></span>
                            <p class="chapter-title">Chapter 3</p>
                            <p class="chapter-name">Karma Yoga</p>
                            <a href="#" data-route="chapters.index" class="chapter-link">View Chapter</a>
                        </article>
                    </div>
                </section>

                <section class="journey">
                    <h2>Begin Your Journey</h2>
                    <p>Explore the timeless wisdom of the Bhagavad Gita.</p>
                    <a class="btn btn-primary" href="#" data-route="chapters.index">Start Reading</a>
                </section>
            </main>
        `;
    },
});

export { HOME_PAGE_DEFINITION as PAGE_DEFINITION };
