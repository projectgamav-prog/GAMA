const BASE_URL = process.env.SMOKE_BASE_URL ?? 'http://127.0.0.1:8000';
const DEBUG_URL = process.env.SMOKE_DEBUG_URL ?? 'http://127.0.0.1:9222';
const LOGIN_EMAIL = process.env.SMOKE_EMAIL ?? 'admin@example.com';
const LOGIN_PASSWORD = process.env.SMOKE_PASSWORD ?? 'password';

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

class CdpClient {
    constructor(webSocketUrl) {
        this.webSocketUrl = webSocketUrl;
        this.socket = null;
        this.nextId = 1;
        this.pending = new Map();
        this.eventListeners = new Map();
    }

    async connect() {
        this.socket = new WebSocket(this.webSocketUrl);

        await new Promise((resolve, reject) => {
            const timeout = setTimeout(
                () => reject(new Error('Timed out connecting to Chrome CDP.')),
                10000,
            );

            this.socket.addEventListener('open', () => {
                clearTimeout(timeout);
                resolve();
            });

            this.socket.addEventListener('error', (event) => {
                clearTimeout(timeout);
                reject(event.error ?? new Error('Chrome CDP connection failed.'));
            });
        });

        this.socket.addEventListener('message', (event) => {
            const message = JSON.parse(event.data);

            if (typeof message.id === 'number') {
                const pending = this.pending.get(message.id);

                if (!pending) {
                    return;
                }

                this.pending.delete(message.id);

                if (message.error) {
                    pending.reject(
                        new Error(
                            `CDP ${pending.method} failed: ${message.error.message}`,
                        ),
                    );
                    return;
                }

                pending.resolve(message.result ?? null);
                return;
            }

            if (!message.method) {
                return;
            }

            const listeners = this.eventListeners.get(message.method) ?? [];

            for (const listener of listeners) {
                listener(message.params ?? {});
            }
        });
    }

    async close() {
        if (!this.socket) {
            return;
        }

        await new Promise((resolve) => {
            this.socket.addEventListener('close', () => resolve(), {
                once: true,
            });
            this.socket.close();
        });
    }

    send(method, params = {}) {
        const id = this.nextId++;

        return new Promise((resolve, reject) => {
            this.pending.set(id, { resolve, reject, method });
            this.socket.send(JSON.stringify({ id, method, params }));
        });
    }

    once(method, timeoutMs = 10000) {
        return new Promise((resolve, reject) => {
            const listener = (params) => {
                clearTimeout(timeout);
                this.off(method, listener);
                resolve(params);
            };

            const timeout = setTimeout(() => {
                this.off(method, listener);
                reject(new Error(`Timed out waiting for CDP event ${method}.`));
            }, timeoutMs);

            this.on(method, listener);
        });
    }

    on(method, listener) {
        const listeners = this.eventListeners.get(method) ?? [];
        listeners.push(listener);
        this.eventListeners.set(method, listeners);
    }

    off(method, listener) {
        const listeners = this.eventListeners.get(method) ?? [];
        this.eventListeners.set(
            method,
            listeners.filter((candidate) => candidate !== listener),
        );
    }

    async navigate(url) {
        const loadPromise = this.once('Page.loadEventFired', 20000).catch(
            () => null,
        );
        await this.send('Page.navigate', { url });
        await loadPromise;
        await this.waitFor(
            'document.readyState === "complete" || document.readyState === "interactive"',
            10000,
        );
    }

    async evaluate(expression) {
        const result = await this.send('Runtime.evaluate', {
            expression,
            awaitPromise: true,
            returnByValue: true,
        });

        if (result?.exceptionDetails) {
            throw new Error(
                `Page evaluation failed: ${result.exceptionDetails.text ?? expression}`,
            );
        }

        return result?.result?.value;
    }

    async waitFor(expression, timeoutMs = 10000) {
        const start = Date.now();

        while (Date.now() - start < timeoutMs) {
            if (await this.evaluate(expression)) {
                return;
            }

            await wait(100);
        }

        throw new Error(`Timed out waiting for condition: ${expression}`);
    }
}

function escapeForTemplateLiteral(value) {
    return value.replaceAll('\\', '\\\\').replaceAll('`', '\\`');
}

async function getChromeTarget() {
    const targets = await fetch(`${DEBUG_URL}/json/list`).then((response) =>
        response.json(),
    );
    const pageTarget = targets.find(
        (target) => target.type === 'page' && target.webSocketDebuggerUrl,
    );

    if (!pageTarget) {
        throw new Error('No Chrome page target is available on the debug port.');
    }

    return pageTarget.webSocketDebuggerUrl;
}

async function clickButtonWithText(client, text, rootSelector = null) {
    const targetText = escapeForTemplateLiteral(text);
    const scopedRoot = rootSelector
        ? `document.querySelector(\`${escapeForTemplateLiteral(rootSelector)}\`)`
        : 'document';

    const clicked = await client.evaluate(`(() => {
        const root = ${scopedRoot};
        if (!root) return false;
        const button = [...root.querySelectorAll('button, a')]
            .find((candidate) => candidate.textContent?.trim() === \`${targetText}\`);
        if (!button) return false;
        button.click();
        return true;
    })()`);

    if (!clicked) {
        throw new Error(
            `Could not find clickable text "${text}"${rootSelector ? ` inside ${rootSelector}` : ''}.`,
        );
    }
}

async function setFieldValue(client, selector, value) {
    const escapedSelector = escapeForTemplateLiteral(selector);
    const escapedValue = escapeForTemplateLiteral(value);

    const updated = await client.evaluate(`(() => {
        const element = document.querySelector(\`${escapedSelector}\`);
        if (!(element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement)) {
            return false;
        }
        const prototype = element instanceof HTMLTextAreaElement
            ? HTMLTextAreaElement.prototype
            : HTMLInputElement.prototype;
        const descriptor = Object.getOwnPropertyDescriptor(prototype, 'value');
        descriptor?.set?.call(element, \`${escapedValue}\`);
        element.dispatchEvent(new Event('input', { bubbles: true }));
        element.dispatchEvent(new Event('change', { bubbles: true }));
        return true;
    })()`);

    if (!updated) {
        throw new Error(`Could not set field ${selector}.`);
    }
}

async function clickSelector(client, selector) {
    const escapedSelector = escapeForTemplateLiteral(selector);
    const clicked = await client.evaluate(`(() => {
        const element = document.querySelector(\`${escapedSelector}\`);
        if (!(element instanceof HTMLElement)) {
            return false;
        }
        element.click();
        return true;
    })()`);

    if (!clicked) {
        throw new Error(`Could not click selector ${selector}.`);
    }
}

async function getFieldValue(client, selector) {
    const escapedSelector = escapeForTemplateLiteral(selector);

    return client.evaluate(`(() => {
        const element = document.querySelector(\`${escapedSelector}\`);
        if (!(element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement)) {
            return null;
        }
        return element.value;
    })()`);
}

async function toggleScriptureAdminControls(client) {
    await client.send('Network.setCookie', {
        name: 'admin_context_visible',
        value: '1',
        url: BASE_URL,
    });

    await client.navigate(await client.evaluate('location.href'));

    const needsToggle = await client.evaluate(`(() => {
        const button = document.querySelector('[data-admin-visibility-toggle="scripture"]');
        return button instanceof HTMLElement && button.textContent?.includes('Show controls');
    })()`);

    if (!needsToggle) {
        return;
    }

    await clickButtonWithText(client, 'Show controls');
    await client.waitFor(
        `(() => {
            const button = document.querySelector('[data-admin-visibility-toggle="scripture"]');
            return button instanceof HTMLElement && button.textContent?.includes('Hide controls');
        })()`,
        10000,
    );
}

async function login(client) {
    await client.navigate(`${BASE_URL}/login`);
    const needsLogin = await client.evaluate(
        'Boolean(document.querySelector("#email"))',
    );

    if (!needsLogin) {
        return;
    }

    await setFieldValue(client, '#email', LOGIN_EMAIL);
    await setFieldValue(client, '#password', LOGIN_PASSWORD);
    await clickButtonWithText(client, 'Log in');
    await client.waitFor('location.pathname !== "/login"', 15000);
}

async function smokeBookIdentity(client) {
    await client.navigate(`${BASE_URL}/books/bhagavad-gita`);
    await toggleScriptureAdminControls(client);
    await clickButtonWithText(client, 'Edit Book');
    await client.waitFor('Boolean(document.querySelector("#book_identity_title"))', 10000);

    const original = {
        slug: await getFieldValue(client, '#book_identity_slug'),
        number: await getFieldValue(client, '#book_identity_number'),
        title: await getFieldValue(client, '#book_identity_title'),
    };
    const nextTitle = `${original.title} Smoke`;

    await setFieldValue(client, '#book_identity_title', nextTitle);
    await client.evaluate(
        'document.querySelector(\'[data-scripture-editor-action="save"]\')?.click()',
    );
    await client.waitFor(
        `document.body.innerText.includes(${JSON.stringify(nextTitle)}) &&
        !document.querySelector("#book_identity_title")`,
        15000,
    );

    await clickButtonWithText(client, 'Edit Book');
    await client.waitFor('Boolean(document.querySelector("#book_identity_title"))', 10000);
    await setFieldValue(client, '#book_identity_slug', original.slug ?? '');
    await setFieldValue(client, '#book_identity_number', original.number ?? '');
    await setFieldValue(client, '#book_identity_title', original.title ?? '');
    await client.evaluate(
        'document.querySelector(\'[data-scripture-editor-action="save"]\')?.click()',
    );
    await client.waitFor(
        `document.body.innerText.includes(${JSON.stringify(original.title)}) &&
        !document.querySelector("#book_identity_title")`,
        15000,
    );
}

async function smokeBookIntro(client) {
    await client.navigate(`${BASE_URL}/books/bhagavad-gita`);
    await toggleScriptureAdminControls(client);
    await clickSelector(
        client,
        '[data-admin-entity="book"][data-admin-region-key="book_intro"][data-admin-action-key$=":edit_intro"]',
    );

    await client.waitFor(
        'Boolean(document.querySelector("#book_intro_description"))',
        10000,
    );

    const original = await getFieldValue(client, '#book_intro_description');
    const nextValue = `${original ?? ''} Smoke`;

    await setFieldValue(client, '#book_intro_description', nextValue);
    await client.evaluate(
        'document.querySelector(\'[data-scripture-editor-action="save"]\')?.click()',
    );
    await client.waitFor(
        '!document.querySelector("#book_intro_description")',
        15000,
    );

    await clickSelector(
        client,
        '[data-admin-entity="book"][data-admin-region-key="book_intro"][data-admin-action-key$=":edit_intro"]',
    );
    await client.waitFor(
        'Boolean(document.querySelector("#book_intro_description"))',
        10000,
    );
    await client.waitFor(
        `document.querySelector("#book_intro_description")?.value === ${JSON.stringify(nextValue)}`,
        10000,
    );
    await setFieldValue(client, '#book_intro_description', original ?? '');
    await client.evaluate(
        'document.querySelector(\'[data-scripture-editor-action="save"]\')?.click()',
    );
    await client.waitFor('!document.querySelector("#book_intro_description")', 15000);
}

async function getFirstChapterRowSelector(client) {
    const selector = await client.evaluate(`(() => {
        const node = document.querySelector('[data-scripture-admin-scope="chapter-row"]');
        if (!node) return null;
        return '[data-scripture-admin-scope="chapter-row"][data-entity-slug="' + node.getAttribute('data-entity-slug') + '"]';
    })()`);

    if (!selector) {
        throw new Error('No chapter-row admin scope is visible on the book page.');
    }

    return selector;
}

async function smokeChapterRowIdentity(client) {
    await client.navigate(`${BASE_URL}/books/bhagavad-gita`);
    await toggleScriptureAdminControls(client);
    const rowSelector = await getFirstChapterRowSelector(client);
    await clickButtonWithText(client, 'Edit Chapter', rowSelector);
    await client.waitFor(
        'Boolean(document.querySelector("#chapter_identity_title"))',
        10000,
    );

    const original = {
        slug: await getFieldValue(client, '#chapter_identity_slug'),
        number: await getFieldValue(client, '#chapter_identity_number'),
        title: await getFieldValue(client, '#chapter_identity_title'),
    };
    const next = {
        slug: `${original.slug}-smoke`,
        number: `${original.number}S`,
        title: `${original.title} Smoke`,
    };

    await setFieldValue(client, '#chapter_identity_slug', next.slug);
    await setFieldValue(client, '#chapter_identity_number', next.number);
    await setFieldValue(client, '#chapter_identity_title', next.title);
    await client.evaluate(
        'document.querySelector(\'[data-scripture-editor-action="save"]\')?.click()',
    );
    await client.waitFor(
        `document.body.innerText.includes(${JSON.stringify(next.title)}) &&
        !document.querySelector("#chapter_identity_title")`,
        15000,
    );

    const updatedRowSelector = `[data-scripture-admin-scope="chapter-row"][data-entity-slug="${next.slug}"]`;
    await client.waitFor(`Boolean(document.querySelector(${JSON.stringify(updatedRowSelector)}))`, 10000);
    await clickButtonWithText(client, 'Edit Chapter', updatedRowSelector);
    await client.waitFor(
        'Boolean(document.querySelector("#chapter_identity_title"))',
        10000,
    );
    await setFieldValue(client, '#chapter_identity_slug', original.slug ?? '');
    await setFieldValue(client, '#chapter_identity_number', original.number ?? '');
    await setFieldValue(client, '#chapter_identity_title', original.title ?? '');
    await client.evaluate(
        'document.querySelector(\'[data-scripture-editor-action="save"]\')?.click()',
    );
    await client.waitFor(
        `document.body.innerText.includes(${JSON.stringify(original.title)}) &&
        !document.querySelector("#chapter_identity_title")`,
        15000,
    );
}

async function getFirstVersePageUrl(client) {
    const href = await client.evaluate(`(() => {
        const link = document.querySelector('[data-scripture-admin-scope="chapter-row"]')?.closest('.space-y-3, .rounded-lg')?.querySelector('a[href*="/chapters/"]');
        return link?.getAttribute('href') ?? null;
    })()`);

    if (!href) {
        throw new Error('Could not resolve a chapter page URL from the book page.');
    }

    return href.startsWith('http') ? href : `${BASE_URL}${href}`;
}

async function smokeVerseRowIdentity(client) {
    await client.navigate(`${BASE_URL}/books/bhagavad-gita`);
    const chapterUrl = await getFirstVersePageUrl(client);
    await client.navigate(chapterUrl);
    await toggleScriptureAdminControls(client);

    const rowSelector = await client.evaluate(`(() => {
        const node = document.querySelector('[data-scripture-admin-scope="verse-row"]');
        if (!node) return null;
        return '[data-scripture-admin-scope="verse-row"][data-entity-slug="' + node.getAttribute('data-entity-slug') + '"]';
    })()`);

    if (!rowSelector) {
        throw new Error('No verse-row admin scope is visible on the chapter page.');
    }

    await clickButtonWithText(client, 'Edit Verse', rowSelector);
    await client.waitFor(
        'Boolean(document.querySelector("#verse_identity_text"))',
        10000,
    );

    const original = {
        slug: await getFieldValue(client, '#verse_identity_slug'),
        number: await getFieldValue(client, '#verse_identity_number'),
        text: await getFieldValue(client, '#verse_identity_text'),
    };
    const next = {
        slug: `${original.slug}-smoke`,
        number: `${original.number}S`,
        text: `${original.text} Smoke`,
    };

    await setFieldValue(client, '#verse_identity_slug', next.slug);
    await setFieldValue(client, '#verse_identity_number', next.number);
    await setFieldValue(client, '#verse_identity_text', next.text);
    await client.evaluate(
        'document.querySelector(\'[data-scripture-editor-action="save"]\')?.click()',
    );
    await client.waitFor(
        `document.body.innerText.includes(${JSON.stringify(next.text)}) &&
        !document.querySelector("#verse_identity_text")`,
        15000,
    );

    const updatedRowSelector = `[data-scripture-admin-scope="verse-row"][data-entity-slug="${next.slug}"]`;
    await client.waitFor(`Boolean(document.querySelector(${JSON.stringify(updatedRowSelector)}))`, 10000);
    await clickButtonWithText(client, 'Edit Verse', updatedRowSelector);
    await client.waitFor(
        'Boolean(document.querySelector("#verse_identity_text"))',
        10000,
    );
    await setFieldValue(client, '#verse_identity_slug', original.slug ?? '');
    await setFieldValue(client, '#verse_identity_number', original.number ?? '');
    await setFieldValue(client, '#verse_identity_text', original.text ?? '');
    await client.evaluate(
        'document.querySelector(\'[data-scripture-editor-action="save"]\')?.click()',
    );
    await client.waitFor(
        `document.body.innerText.includes(${JSON.stringify(original.text)}) &&
        !document.querySelector("#verse_identity_text")`,
        15000,
    );
}

async function smokeMediaSlotEditor(client) {
    await client.navigate(`${BASE_URL}/books/bhagavad-gita`);
    await toggleScriptureAdminControls(client);

    const label = await client.evaluate(`(() => {
        const button = [...document.querySelectorAll('button, a')]
            .find((candidate) => {
                const text = candidate.textContent?.trim();
                return text === 'Edit Media' || text === 'Add Media';
            });
        return button?.textContent?.trim() ?? null;
    })()`);

    if (!label) {
        return { skipped: true, reason: 'No active media-slot surface was visible on the book page.' };
    }

    await clickButtonWithText(client, label);

    const assignmentId = await client.evaluate(`(() => {
        const button = document.querySelector('[data-book-media-action="save"][data-book-media-assignment-id]');
        return button?.getAttribute('data-book-media-assignment-id') ?? null;
    })()`);

    if (!assignmentId) {
        return { skipped: true, reason: 'Media surface was available, but no persisted assignment card was present to edit.' };
    }

    const editableCardSelector = `#book_media_title_${assignmentId}`;

    await client.waitFor(`Boolean(document.querySelector(${JSON.stringify(editableCardSelector)}))`, 10000);
    const original = await getFieldValue(client, editableCardSelector);
    const nextValue = `${original ?? ''} Smoke`;

    await setFieldValue(client, editableCardSelector, nextValue);
    await client.evaluate(`document.querySelector('[data-book-media-action="save"][data-book-media-assignment-id="${assignmentId}"]')?.click()`);
    await client.waitFor(
        `Boolean(document.querySelector(${JSON.stringify(editableCardSelector)})) &&
        document.querySelector(${JSON.stringify(editableCardSelector)})?.value === ${JSON.stringify(nextValue)}`,
        15000,
    );

    await setFieldValue(client, editableCardSelector, original ?? '');
    await client.evaluate(`document.querySelector('[data-book-media-action="save"][data-book-media-assignment-id="${assignmentId}"]')?.click()`);
    await client.waitFor(
        `Boolean(document.querySelector(${JSON.stringify(editableCardSelector)})) &&
        document.querySelector(${JSON.stringify(editableCardSelector)})?.value === ${JSON.stringify(original ?? '')}`,
        15000,
    );

    return { skipped: false };
}

async function main() {
    const webSocketUrl = await getChromeTarget();
    const client = new CdpClient(webSocketUrl);
    await client.connect();

    try {
        await client.send('Page.enable');
        await client.send('Runtime.enable');
        await client.send('Network.enable');

        await login(client);
        await smokeBookIdentity(client);
        await smokeChapterRowIdentity(client);
        await smokeVerseRowIdentity(client);
        await smokeBookIntro(client);
        const mediaResult = await smokeMediaSlotEditor(client);

        if (mediaResult.skipped) {
            console.log(`SMOKE WARNING: ${mediaResult.reason}`);
        }

        console.log('Scripture admin inline smoke passed.');
    } finally {
        await client.close();
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
