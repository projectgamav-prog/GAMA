export type ButtonVariant = 'default' | 'secondary' | 'outline' | 'ghost';

export type ButtonGroupLayout = 'auto' | 'stack' | 'inline';

export type ButtonGroupAlignment = 'start' | 'center' | 'end' | 'stretch';

export type ButtonDestinationType = 'url' | 'cms_page' | 'scripture_route';

export type ButtonItem = {
    label: string;
    destination_type: ButtonDestinationType;
    url: string | null;
    cms_page_slug: string | null;
    scripture_path: string | null;
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
    destination_type: 'url',
    url: '',
    cms_page_slug: null,
    scripture_path: null,
    variant: 'default',
    open_in_new_tab: false,
});

function normalizeString(value: unknown): string | null {
    if (typeof value !== 'string') {
        return null;
    }

    const trimmed = value.trim();

    return trimmed === '' ? null : trimmed;
}

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
        const legacyHref = normalizeString(button.href);

        return {
            label:
                typeof button.label === 'string' ? button.label : 'New button',
            destination_type: destinationType,
            url:
                destinationType === 'url'
                    ? normalizeString(button.url) ?? legacyHref
                    : normalizeString(button.url),
            cms_page_slug: normalizeString(button.cms_page_slug),
            scripture_path: normalizeString(button.scripture_path),
            variant:
                button.variant === 'secondary' ||
                button.variant === 'outline' ||
                button.variant === 'ghost'
                    ? button.variant
                    : 'default',
            open_in_new_tab: Boolean(button.open_in_new_tab),
        };
    });
};

export function resolveButtonHref(button: ButtonItem): string {
    if (button.destination_type === 'cms_page') {
        return button.cms_page_slug ? `/pages/${button.cms_page_slug}` : '#';
    }

    if (button.destination_type === 'scripture_route') {
        return button.scripture_path?.startsWith('/')
            ? button.scripture_path
            : '#';
    }

    return button.url ?? '#';
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
