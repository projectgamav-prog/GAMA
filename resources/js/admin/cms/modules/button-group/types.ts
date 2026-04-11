import {
    createDefaultLinkTarget,
    normalizeLinkTarget,
    resolveLinkTargetHref,
} from '@/lib/link-targets';
import type { LinkTarget } from '@/types';

export type ButtonVariant = 'default' | 'secondary' | 'outline' | 'ghost';

export type ButtonGroupLayout = 'auto' | 'stack' | 'inline';

export type ButtonGroupAlignment = 'start' | 'center' | 'end' | 'stretch';

export type ButtonItem = {
    label: string;
    target: LinkTarget;
    variant: ButtonVariant;
    open_in_new_tab: boolean;
};

export type ButtonGroupData = {
    buttons: ButtonItem[];
};

export type ButtonGroupConfig = {
    layout: ButtonGroupLayout;
    alignment: ButtonGroupAlignment;
};

export const createDefaultButton = (): ButtonItem => ({
    label: 'New button',
    target: createDefaultLinkTarget('url'),
    variant: 'default',
    open_in_new_tab: false,
});

export const getButtonGroupButtons = (
    data: Record<string, unknown>,
): ButtonItem[] => {
    const buttons = Array.isArray(data.buttons) ? data.buttons : [];

    return buttons.map((button) => {
        if (!button || typeof button !== 'object') {
            return createDefaultButton();
        }

        const destinationType =
            button.destination_type === 'cms_page' ||
            button.destination_type === 'scripture_route' ||
            button.destination_type === 'url'
                ? button.destination_type
                : 'href' in button
                  ? 'url'
                  : 'url';
        const legacyHref = normalizeLegacyString(button.href);
        const openInNewTab = Boolean(button.open_in_new_tab);

        return {
            label:
                typeof button.label === 'string' ? button.label : 'New button',
            target:
                normalizeLinkTarget(button.target) ??
                (destinationType === 'cms_page'
                    ? {
                          type: 'cms_page',
                          value: {
                              slug: normalizeLegacyString(
                                  button.cms_page_slug,
                              ),
                          },
                          behavior: {
                              new_tab: openInNewTab,
                          },
                      }
                    : destinationType === 'scripture_route'
                      ? {
                            type: 'url',
                            value: {
                                url: normalizeLegacyString(
                                    button.scripture_path,
                                ),
                            },
                            behavior: {
                                new_tab: openInNewTab,
                            },
                        }
                      : {
                            type: 'url',
                            value: {
                                url:
                                    normalizeLegacyString(button.url)
                                    ?? legacyHref,
                            },
                            behavior: {
                                new_tab: openInNewTab,
                            },
                        }),
            variant:
                button.variant === 'secondary' ||
                button.variant === 'outline' ||
                button.variant === 'ghost'
                    ? button.variant
                    : 'default',
            open_in_new_tab: openInNewTab,
        };
    });
};

export function resolveButtonHref(button: ButtonItem): string {
    return resolveLinkTargetHref(button.target) ?? '#';
}

export const getButtonGroupLayout = (
    config: Record<string, unknown>,
): ButtonGroupLayout => {
    const layout = config.layout;

    return layout === 'stack' || layout === 'inline' ? layout : 'auto';
};

export const getButtonGroupAlignment = (
    config: Record<string, unknown>,
): ButtonGroupAlignment => {
    const alignment = config.alignment;

    return alignment === 'center' ||
        alignment === 'end' ||
        alignment === 'stretch'
        ? alignment
        : 'start';
};

export const getButtonGroupAlignmentClass = (
    layout: ButtonGroupLayout,
    alignment: ButtonGroupAlignment,
): string => {
    if (layout === 'inline') {
        return {
            start: 'justify-start',
            center: 'justify-center',
            end: 'justify-end',
            stretch: 'w-full [&>*]:flex-1',
        }[alignment];
    }

    return {
        start: 'justify-items-start',
        center: 'justify-items-center',
        end: 'justify-items-end',
        stretch: 'justify-items-stretch',
    }[alignment];
};

function normalizeLegacyString(value: unknown): string | null {
    if (typeof value !== 'string') {
        return null;
    }

    const trimmed = value.trim();

    return trimmed === '' ? null : trimmed;
}
