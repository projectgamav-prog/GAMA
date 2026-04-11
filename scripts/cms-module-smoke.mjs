const BASE_URL = process.env.SMOKE_BASE_URL ?? 'http://127.0.0.1:8000';
const DEBUG_URL = process.env.SMOKE_DEBUG_URL ?? 'http://127.0.0.1:9222';
const LOGIN_EMAIL = process.env.SMOKE_EMAIL ?? 'admin@example.com';
const LOGIN_PASSWORD = process.env.SMOKE_PASSWORD ?? 'password';
const PAGE_PATH = process.env.SMOKE_CMS_PAGE_PATH ?? '/cms/pages/platform-guide';

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

class CdpClient {
    constructor(webSocketUrl) {
        this.webSocketUrl = webSocketUrl;
        this.socket = null;
        this.nextId = 1;
        this.pending = new Map();
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

            if (typeof message.id !== 'number') {
                return;
            }

            const pending = this.pending.get(message.id);

            if (!pending) {
                return;
            }

            this.pending.delete(message.id);

            if (message.error) {
                pending.reject(
                    new Error(`CDP ${pending.method} failed: ${message.error.message}`),
                );
                return;
            }

            pending.resolve(message.result ?? null);
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
    const escapedSelector = escapeForTemplateLiteral(selector);
    const clicked = await client.evaluate(`(() => {
        const element = document.querySelector(\`${escapedSelector}\`);
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
    await client.evaluate(`(() => {
        const form = document.querySelector('form');
        if (!(form instanceof HTMLFormElement)) return false;
        form.requestSubmit();
        return true;
    })()`);
    await client.waitFor('location.pathname !== "/login"', 15000);
}

async function getWorkspaceBlockId(client, moduleKey) {
    const blockId = await client.evaluate(`(() => {
        const block = document.querySelector('[data-cms-workspace-block-module="${moduleKey}"]');
        return block?.getAttribute('data-cms-workspace-block') ?? null;
    })()`);

    if (!blockId) {
        throw new Error(`Could not find a workspace block for module ${moduleKey}.`);
    }

    return blockId;
}

async function main() {
    const webSocketUrl = await getChromeTarget();
    const client = new CdpClient(webSocketUrl);
    await client.connect();

    try {
        await client.send('Page.enable');
        await client.send('Runtime.enable');
        await client.send('Network.enable');
        await client.send('Emulation.setDeviceMetricsOverride', {
            width: 1440,
            height: 900,
            deviceScaleFactor: 1,
            mobile: false,
        });

        await login(client);
        await client.navigate(`${BASE_URL}${PAGE_PATH}`);
        await client.waitFor('document.body.innerText.includes("CMS Composition")', 15000);

        const richTextBlockId = await getWorkspaceBlockId(client, 'rich_text');
        await setInputValue(
            client,
            `#block-${richTextBlockId}-rich-text-title`,
            'Smoke-tested prose section',
        );
        await setInputValue(
            client,
            `#block-${richTextBlockId}-rich-text-body`,
            '## Writing flow\n\nThis body was updated through the browser smoke.\n\n- First point\n- Second point',
        );
        await clickSelector(
            client,
            `[data-cms-workspace-block-save="${richTextBlockId}"]`,
        );
        await client.waitFor(
            'document.body.innerText.includes("Smoke-tested prose section")',
            15000,
        );

        const buttonBlockId = await getWorkspaceBlockId(client, 'button_group');
        await setInputValue(
            client,
            `#block-${buttonBlockId}-button-label-0`,
            'Open Bhagavad Gita',
        );
        await setInputValue(
            client,
            `[data-link-target-quick-input="block-${buttonBlockId}-button-target-0"]`,
            '/books/bhagavad-gita',
        );
        await clickSelector(
            client,
            `[data-link-target-quick-apply="block-${buttonBlockId}-button-target-0"]`,
        );
        await clickSelector(
            client,
            `[data-cms-workspace-block-save="${buttonBlockId}"]`,
        );

        await client.waitFor(
            `(() => {
                const block = document.querySelector('[data-cms-workspace-block="${buttonBlockId}"]');
                if (!(block instanceof HTMLElement)) return false;
                const link = block.querySelector('a[href="/books/bhagavad-gita"]');
                return block.innerText.includes('Open Bhagavad Gita') && link instanceof HTMLAnchorElement;
            })()`,
            15000,
        );

        console.log('CMS module smoke passed.');
    } finally {
        await client.close();
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
