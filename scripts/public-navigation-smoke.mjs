const BASE_URL = process.env.SMOKE_BASE_URL ?? 'http://127.0.0.1:8000';
const DEBUG_URL = process.env.SMOKE_DEBUG_URL ?? 'http://127.0.0.1:9222';

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
            this.socket.addEventListener('close', resolve, { once: true });
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

        return result?.result?.value;
    }

    async once(method, timeoutMs = 10000) {
        return new Promise((resolve, reject) => {
            const listener = (params) => {
                clearTimeout(timeout);
                this.off(method, listener);
                resolve(params);
            };

            const timeout = setTimeout(() => {
                this.off(method, listener);
                reject(new Error(`Timed out waiting for ${method}.`));
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

async function clickButtonWithText(client, text, rootSelector = 'document') {
    const clicked = await client.evaluate(`(() => {
        const root = ${rootSelector === 'document' ? 'document' : `document.querySelector(${JSON.stringify(rootSelector)})`};
        if (!root) return false;
        const button = [...root.querySelectorAll('button, a')]
            .find((candidate) => candidate.textContent?.trim()?.includes(${JSON.stringify(text)}));
        if (!button) return false;
        button.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, composed: true }));
        return true;
    })()`);

    if (!clicked) {
        throw new Error(`Could not find clickable text "${text}".`);
    }
}

async function clickSelector(client, selector) {
    const clicked = await client.evaluate(`(() => {
        const element = document.querySelector(${JSON.stringify(selector)});
        if (!(element instanceof HTMLElement)) return false;
        element.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, composed: true }));
        return true;
    })()`);

    if (!clicked) {
        throw new Error(`Could not click selector "${selector}".`);
    }
}

async function clickDesktopTriggerWithText(client, text) {
    const clicked = await client.evaluate(`(() => {
        const trigger = [...document.querySelectorAll('[data-site-nav-trigger^="desktop-"]')]
            .find((candidate) => candidate.textContent?.trim()?.includes(${JSON.stringify(text)}));
        if (!(trigger instanceof HTMLElement)) return false;
        trigger.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, composed: true }));
        return true;
    })()`);

    if (!clicked) {
        throw new Error(`Could not click desktop trigger "${text}".`);
    }
}

async function main() {
    const webSocketUrl = await getChromeTarget();
    const client = new CdpClient(webSocketUrl);
    await client.connect();

    try {
        await client.send('Page.enable');
        await client.send('Runtime.enable');
        await client.send('Emulation.setDeviceMetricsOverride', {
            width: 1440,
            height: 900,
            deviceScaleFactor: 1,
            mobile: false,
        });

        await client.navigate(BASE_URL);
        await client.waitFor(
            'document.body.innerText.includes("Scripture Platform") && Boolean(document.querySelector(\'[data-site-nav-trigger^="desktop-"]\'))',
            10000,
        );
        await client.waitFor(
            `(() => ![...document.querySelectorAll('[data-site-nav-dropdown]')]
                .some((element) => getComputedStyle(element).display !== 'none'))()`,
            10000,
        );
        await clickDesktopTriggerWithText(client, 'Scripture');
        await client.waitFor(
            `(() => [...document.querySelectorAll('[data-site-nav-dropdown]')]
                .some((element) => getComputedStyle(element).display !== 'none'))()`,
            10000,
        );
        await clickButtonWithText(client, 'Books', '[data-site-nav-dropdown]');
        await client.waitFor('location.pathname === "/books"', 10000);
        await client.waitFor(
            `(() => ![...document.querySelectorAll('[data-site-nav-dropdown]')]
                .some((element) => getComputedStyle(element).display !== 'none'))()`,
            10000,
        );
        await clickDesktopTriggerWithText(client, 'Scripture');
        await client.waitFor(
            `(() => [...document.querySelectorAll('[data-site-nav-dropdown]')]
                .some((element) => getComputedStyle(element).display !== 'none'))()`,
            10000,
        );

        await client.send('Emulation.setDeviceMetricsOverride', {
            width: 390,
            height: 844,
            deviceScaleFactor: 2,
            mobile: true,
        });

        await client.navigate(BASE_URL);
        await client.waitFor(
            'document.body.innerText.includes("Menu") && document.body.innerText.includes("Scripture Platform")',
            10000,
        );

        await clickButtonWithText(client, 'Menu');
        await client.waitFor('Boolean(document.querySelector("[data-site-nav-panel=\\"0\\"]"))', 10000);
        await clickButtonWithText(client, 'Study', '[data-site-nav-panel="0"]');
        await client.waitFor(
            'document.querySelector("[data-site-nav-panel=\\"1\\"]")?.innerText?.includes("Reference")',
            10000,
        );
        await clickButtonWithText(client, 'Reference', '[data-site-nav-panel="1"]');
        await client.waitFor(
            'document.querySelector("[data-site-nav-panel=\\"2\\"]")?.innerText?.includes("Dictionary")',
            10000,
        );

        console.log('Public navigation smoke passed.');
    } finally {
        await client.close();
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
