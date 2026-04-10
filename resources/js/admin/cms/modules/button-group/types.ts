export type ButtonVariant = 'default' | 'secondary' | 'outline' | 'ghost';

export type ButtonGroupLayout = 'auto' | 'stack' | 'inline';

export type ButtonGroupAlignment = 'start' | 'center' | 'end' | 'stretch';

export type ButtonItem = {
    label: string;
    href: string;
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
    href: '#',
    variant: 'default',
    open_in_new_tab: false,
});

export const getButtonGroupButtons = (
    data: Record<string, unknown>,
): ButtonItem[] => {
    const buttons = Array.isArray(data.buttons) ? data.buttons : [];

    return buttons.map((button) => {
        if (! button || typeof button !== 'object') {
            return createDefaultButton();
        }

        return {
            label:
                typeof button.label === 'string' ? button.label : 'New button',
            href: typeof button.href === 'string' ? button.href : '#',
            variant:
                button.variant === 'secondary'
                || button.variant === 'outline'
                || button.variant === 'ghost'
                    ? button.variant
                    : 'default',
            open_in_new_tab: Boolean(button.open_in_new_tab),
        };
    });
};

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

    return alignment === 'center'
        || alignment === 'end'
        || alignment === 'stretch'
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
