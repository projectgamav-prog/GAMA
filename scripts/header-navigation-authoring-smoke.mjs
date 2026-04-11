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

    async navigate(url) {
        await this.send('Page.navigate', { url });
        await this.waitFor(
            'document.readyState === "complete" || document.readyState === "interactive"',
            15000,
        );
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

async function clickSelector(client, selector) {
    const escaped = escapeForTemplateLiteral(selector);
    const clicked = await client.evaluate(`(() => {
        const element = document.querySelector(\`${escaped}\`);
        if (!(element instanceof HTMLElement)) return false;
        element.click();
        return true;
    })()`);

    if (!clicked) {
        throw new Error(`Could not click selector ${selector}.`);
    }
}

async function setInputValue(client, selector, value) {
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

async function getItemIdByLabel(client, label) {
    const escapedLabel = escapeForTemplateLiteral(label);
    const id = await client.evaluate(`(() => {
        const node = [...document.querySelectorAll('[data-header-nav-item]')]
            .find((candidate) => candidate.getAttribute('data-header-nav-label') === \`${escapedLabel}\`);
        return node?.getAttribute('data-header-nav-item') ?? null;
    })()`);

    if (!id) {
        throw new Error(`Could not find navigation item labeled "${label}".`);
    }

    return id;
}

async function login(client) {
    await client.navigate(`${BASE_URL}/login`);
    const needsLogin = await client.evaluate(
        'Boolean(document.querySelector("#email"))',
    );

    if (!needsLogin) {
        return;
    }

    await setInputValue(client, '#email', LOGIN_EMAIL);
    await setInputValue(client, '#password', LOGIN_PASSWORD);
    await clickSelector(client, 'button[type="submit"]');
    await client.waitFor('location.pathname !== "/login"', 15000);
}

async function toggleAdminControls(client) {
    const needsToggle = await client.evaluate(`(() => {
        const button = document.querySelector('[data-admin-visibility-toggle="scripture"]');
        return button instanceof HTMLElement && button.textContent?.includes('Show controls');
    })()`);

    if (!needsToggle) {
        return;
    }

    await clickSelector(client, '[data-admin-visibility-toggle="scripture"]');
    await client.waitFor(`(() => {
        const button = document.querySelector('[data-admin-visibility-toggle="scripture"]');
        return button instanceof HTMLElement && button.textContent?.includes('Hide controls');
    })()`, 10000);
}

async function enableDesktopMode(client) {
    await client.send('Page.enable');
    await client.send('Runtime.enable');
    await client.send('Network.enable');
    await client.send('Emulation.setDeviceMetricsOverride', {
        width: 1440,
        height: 900,
        deviceScaleFactor: 1,
        mobile: false,
    });
}

async function prepareHome(client) {
    await client.navigate(BASE_URL);
    await client.evaluate('window.confirm = () => true');
    await toggleAdminControls(client);
    await client.waitFor(
        'Boolean(document.querySelector("[data-header-nav-list=\\"root\\"]"))',
        10000,
    );
}

async function smokeInlineEdit(client) {
    const scriptureId = await getItemIdByLabel(client, 'Scripture');
    const editSelector = `[data-header-nav-item="${scriptureId}"] [data-header-nav-action="edit-item"]`;

    await clickSelector(client, editSelector);
    await client.waitFor(
        `Boolean(document.querySelector('[data-header-nav-edit-label="${scriptureId}"]'))`,
        10000,
    );

    await setInputValue(
        client,
        `[data-header-nav-edit-label="${scriptureId}"]`,
        'Scripture Smoke',
    );
    await clickSelector(
        client,
        `[data-header-nav-item-id="${scriptureId}"][data-header-nav-action="save-edit"]`,
    );
    await client.waitFor(
        `Boolean(document.querySelector('[data-header-nav-item="${scriptureId}"][data-header-nav-label="Scripture Smoke"]'))`,
        15000,
    );

    await clickSelector(
        client,
        `[data-header-nav-item="${scriptureId}"] [data-header-nav-action="edit-item"]`,
    );
    await client.waitFor(
        `Boolean(document.querySelector('[data-header-nav-edit-label="${scriptureId}"]'))`,
        10000,
    );
    await setInputValue(
        client,
        `[data-header-nav-edit-label="${scriptureId}"]`,
        'Scripture',
    );
    await clickSelector(
        client,
        `[data-header-nav-item-id="${scriptureId}"][data-header-nav-action="save-edit"]`,
    );
    await client.waitFor(
        `Boolean(document.querySelector('[data-header-nav-item="${scriptureId}"][data-header-nav-label="Scripture"]'))`,
        15000,
    );
}

async function smokeRootAddMoveDelete(client) {
    await clickSelector(client, '[data-header-nav-action="add-root-item"]');
    await client.waitFor(
        'Boolean(document.querySelector(\'[data-header-nav-draft-label="root"]\'))',
        10000,
    );
    await setInputValue(
        client,
        '[data-header-nav-draft-label="root"]',
        'Header Smoke',
    );
    await clickSelector(
        client,
        '[data-header-nav-action="save-draft"][data-header-nav-parent-id="root"]',
    );
    await client.waitFor(
        `Boolean([...document.querySelectorAll('[data-header-nav-item]')].find((node) => node.getAttribute('data-header-nav-label') === 'Header Smoke'))`,
        15000,
    );

    const createdId = await getItemIdByLabel(client, 'Header Smoke');
    const beforeMove = await client.evaluate(`(() => [...document.querySelectorAll('[data-header-nav-list="root"] > [data-header-nav-item]')]
        .map((node) => node.getAttribute('data-header-nav-label')))()`);

    await clickSelector(
        client,
        `[data-header-nav-item-id="${createdId}"][data-header-nav-action="move-up"]`,
    );
    await client.waitFor(
        `(() => {
            const labels = [...document.querySelectorAll('[data-header-nav-list="root"] > [data-header-nav-item]')]
                .map((node) => node.getAttribute('data-header-nav-label'));
            return labels.join('|') !== ${JSON.stringify(beforeMove.join('|'))};
        })()`,
        15000,
    );

    await clickSelector(
        client,
        `[data-header-nav-item-id="${createdId}"][data-header-nav-action="delete-item"]`,
    );
    await client.waitFor(
        `!Boolean([...document.querySelectorAll('[data-header-nav-item]')].find((node) => node.getAttribute('data-header-nav-label') === 'Header Smoke'))`,
        15000,
    );
}

async function smokeChildAddDelete(client) {
    const studyId = await getItemIdByLabel(client, 'Study');

    await clickSelector(
        client,
        `[data-header-nav-item-id="${studyId}"][data-header-nav-action="add-child"]`,
    );
    await client.waitFor(
        `Boolean(document.querySelector('[data-header-nav-children="${studyId}"] [data-header-nav-draft-parent="${studyId}"]'))`,
        10000,
    );
    await setInputValue(
        client,
        `[data-header-nav-children="${studyId}"] [data-header-nav-draft-label="${studyId}"]`,
        'Study Smoke Child',
    );
    await clickSelector(
        client,
        `[data-header-nav-children="${studyId}"] [data-header-nav-action="save-draft"][data-header-nav-parent-id="${studyId}"]`,
    );
    await client.waitFor(
        `Boolean(document.querySelector('[data-header-nav-children="${studyId}"] [data-header-nav-label="Study Smoke Child"]'))`,
        15000,
    );

    const childId = await client.evaluate(`(() => {
        const node = document.querySelector('[data-header-nav-children="${studyId}"] [data-header-nav-label="Study Smoke Child"]');
        return node?.getAttribute('data-header-nav-item') ?? null;
    })()`);

    if (!childId) {
        throw new Error('Could not resolve the newly created child navigation item.');
    }

    await clickSelector(
        client,
        `[data-header-nav-item-id="${childId}"][data-header-nav-action="delete-item"]`,
    );
    await client.waitFor(
        `!Boolean(document.querySelector('[data-header-nav-children="${studyId}"] [data-header-nav-label="Study Smoke Child"]'))`,
        15000,
    );
}

async function main() {
    const webSocketUrl = await getChromeTarget();
    const client = new CdpClient(webSocketUrl);
    await client.connect();

    try {
        await enableDesktopMode(client);
        await login(client);
        await prepareHome(client);
        await smokeInlineEdit(client);
        await smokeRootAddMoveDelete(client);
        await smokeChildAddDelete(client);

        console.log('Header navigation authoring smoke passed.');
    } finally {
        await client.close();
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
