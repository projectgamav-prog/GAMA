import { usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import {
    clearScriptureAdminNavigationParams,
    getScriptureAdminTargetSelectors,
    parseScriptureAdminNavigationTarget,
} from '@/lib/scripture-admin-navigation';

export function useScriptureAdminTargetNavigation() {
    const page = usePage();

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        const target = parseScriptureAdminNavigationTarget(page.url);

        if (target === null) {
            return;
        }

        const frame = window.requestAnimationFrame(() => {
            const element = getScriptureAdminTargetSelectors(target)
                .map((selector) =>
                    document.querySelector<HTMLElement>(selector),
                )
                .find((candidate): candidate is HTMLElement =>
                    candidate instanceof HTMLElement,
                );

            if (element) {
                element.scrollIntoView({
                    block: 'start',
                    behavior: 'auto',
                });
            }

            const nextUrl = clearScriptureAdminNavigationParams(
                window.location.href,
            );

            window.history.replaceState(window.history.state, '', nextUrl);
        });

        return () => window.cancelAnimationFrame(frame);
    }, [page.url]);
}
