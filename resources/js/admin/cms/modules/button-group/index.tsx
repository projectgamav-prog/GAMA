import InputError from '@/components/input-error';
import { Button, buttonVariants } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type {
    CmsModuleEditorProps,
    CmsModuleManifest,
    CmsModuleRendererProps,
} from '../../core/module-types';

type ButtonVariant = 'default' | 'secondary' | 'outline' | 'ghost';

type ButtonGroupLayout = 'auto' | 'stack' | 'inline';

type ButtonGroupAlignment = 'start' | 'center' | 'end' | 'stretch';

type ButtonItem = {
    label: string;
    href: string;
    variant: ButtonVariant;
    open_in_new_tab: boolean;
};

const defaultButton = (): ButtonItem => ({
    label: 'New button',
    href: '#',
    variant: 'default',
    open_in_new_tab: false,
});

const getButtons = (data: Record<string, unknown>): ButtonItem[] => {
    const buttons = Array.isArray(data.buttons) ? data.buttons : [];

    return buttons.map((button) => {
        if (! button || typeof button !== 'object') {
            return defaultButton();
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

const getLayout = (
    config: Record<string, unknown>,
): ButtonGroupLayout => {
    const layout = config.layout;

    return layout === 'stack' || layout === 'inline' ? layout : 'auto';
};

const getAlignment = (
    config: Record<string, unknown>,
): ButtonGroupAlignment => {
    const alignment = config.alignment;

    return alignment === 'center'
        || alignment === 'end'
        || alignment === 'stretch'
        ? alignment
        : 'start';
};

const alignmentClass = (
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

function ButtonGroupRenderer({ value, mode }: CmsModuleRendererProps) {
    const buttons = getButtons(value.data);
    const layout = getLayout(value.config);
    const alignment = getAlignment(value.config);

    const containerClass =
        layout === 'stack'
            ? 'grid grid-cols-1 gap-3'
            : layout === 'inline'
              ? 'flex flex-wrap gap-3'
              : cn(
                    'grid gap-3',
                    buttons.length <= 1 && 'grid-cols-1',
                    buttons.length === 2 && 'sm:grid-cols-2',
                    buttons.length >= 3 && 'sm:grid-cols-2 xl:grid-cols-3',
                );

    return (
        <div
            className={cn(
                containerClass,
                alignmentClass(layout, alignment),
                mode === 'admin' &&
                    'rounded-2xl border border-border/60 bg-background/70 p-4',
            )}
        >
            {buttons.map((button, index) => (
                <a
                    key={`${button.label}-${index}`}
                    href={button.href || '#'}
                    target={button.open_in_new_tab ? '_blank' : undefined}
                    rel={
                        button.open_in_new_tab
                            ? 'noreferrer noopener'
                            : undefined
                    }
                    className={cn(
                        buttonVariants({ variant: button.variant }),
                        'h-auto min-h-11 whitespace-normal px-4 py-3 text-center leading-5',
                        layout !== 'inline' && 'w-full',
                    )}
                >
                    {button.label}
                </a>
            ))}
        </div>
    );
}

function ButtonGroupEditor({
    value,
    onChange,
    errors,
}: CmsModuleEditorProps) {
    const buttons = getButtons(value.data);
    const layout = getLayout(value.config);
    const alignment = getAlignment(value.config);

    const updateButtons = (nextButtons: ButtonItem[]) =>
        onChange({
            ...value,
            data: {
                ...value.data,
                buttons: nextButtons,
            },
        });

    return (
        <div className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                    <Label htmlFor="cms-button-layout">Layout</Label>
                    <Select
                        value={layout}
                        onValueChange={(nextValue) =>
                            onChange({
                                ...value,
                                config: {
                                    ...value.config,
                                    layout: nextValue,
                                },
                            })
                        }
                    >
                        <SelectTrigger id="cms-button-layout" className="w-full">
                            <SelectValue placeholder="Choose layout" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="auto">Auto grid</SelectItem>
                            <SelectItem value="stack">Stacked</SelectItem>
                            <SelectItem value="inline">Inline wrap</SelectItem>
                        </SelectContent>
                    </Select>
                    <InputError message={errors['config_json.layout']} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="cms-button-alignment">Alignment</Label>
                    <Select
                        value={alignment}
                        onValueChange={(nextValue) =>
                            onChange({
                                ...value,
                                config: {
                                    ...value.config,
                                    alignment: nextValue,
                                },
                            })
                        }
                    >
                        <SelectTrigger
                            id="cms-button-alignment"
                            className="w-full"
                        >
                            <SelectValue placeholder="Choose alignment" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="start">Start</SelectItem>
                            <SelectItem value="center">Center</SelectItem>
                            <SelectItem value="end">End</SelectItem>
                            <SelectItem value="stretch">Stretch</SelectItem>
                        </SelectContent>
                    </Select>
                    <InputError message={errors['config_json.alignment']} />
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <p className="text-sm font-medium text-foreground">
                            Buttons
                        </p>
                        <p className="text-xs leading-5 text-muted-foreground">
                            Keep action buttons together inside the current
                            container. Create a new container instead when the
                            action set should become its own card.
                        </p>
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => updateButtons([...buttons, defaultButton()])}
                    >
                        Add button
                    </Button>
                </div>

                <InputError message={errors['data_json.buttons']} />

                {buttons.map((button, index) => (
                    <div
                        key={`${index}-${button.label}`}
                        className="space-y-4 rounded-2xl border border-border/70 bg-muted/20 p-4"
                    >
                        <div className="flex items-center justify-between gap-3">
                            <p className="text-sm font-medium text-foreground">
                                Button {index + 1}
                            </p>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                disabled={buttons.length === 1}
                                onClick={() =>
                                    updateButtons(
                                        buttons.filter(
                                            (_, buttonIndex) =>
                                                buttonIndex !== index,
                                        ),
                                    )
                                }
                            >
                                Remove
                            </Button>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="grid gap-2">
                                <Label htmlFor={`cms-button-label-${index}`}>
                                    Label
                                </Label>
                                <Input
                                    id={`cms-button-label-${index}`}
                                    value={button.label}
                                    onChange={(event) =>
                                        updateButtons(
                                            buttons.map((entry, buttonIndex) =>
                                                buttonIndex === index
                                                    ? {
                                                          ...entry,
                                                          label: event.target.value,
                                                      }
                                                    : entry,
                                            ),
                                        )
                                    }
                                />
                                <InputError
                                    message={
                                        errors[
                                            `data_json.buttons.${index}.label`
                                        ]
                                    }
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor={`cms-button-href-${index}`}>
                                    Destination
                                </Label>
                                <Input
                                    id={`cms-button-href-${index}`}
                                    value={button.href}
                                    onChange={(event) =>
                                        updateButtons(
                                            buttons.map((entry, buttonIndex) =>
                                                buttonIndex === index
                                                    ? {
                                                          ...entry,
                                                          href: event.target.value,
                                                      }
                                                    : entry,
                                            ),
                                        )
                                    }
                                    placeholder="/pages/about"
                                />
                                <InputError
                                    message={
                                        errors[
                                            `data_json.buttons.${index}.href`
                                        ]
                                    }
                                />
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
                            <div className="grid gap-2">
                                <Label htmlFor={`cms-button-variant-${index}`}>
                                    Style
                                </Label>
                                <Select
                                    value={button.variant}
                                    onValueChange={(nextValue) =>
                                        updateButtons(
                                            buttons.map((entry, buttonIndex) =>
                                                buttonIndex === index
                                                    ? {
                                                          ...entry,
                                                          variant:
                                                              nextValue as ButtonVariant,
                                                      }
                                                    : entry,
                                            ),
                                        )
                                    }
                                >
                                    <SelectTrigger
                                        id={`cms-button-variant-${index}`}
                                        className="w-full"
                                    >
                                        <SelectValue placeholder="Choose style" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="default">
                                            Default
                                        </SelectItem>
                                        <SelectItem value="secondary">
                                            Secondary
                                        </SelectItem>
                                        <SelectItem value="outline">
                                            Outline
                                        </SelectItem>
                                        <SelectItem value="ghost">
                                            Ghost
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                <InputError
                                    message={
                                        errors[
                                            `data_json.buttons.${index}.variant`
                                        ]
                                    }
                                />
                            </div>

                            <label className="flex items-center gap-3 rounded-xl border border-border/70 px-4 py-2 text-sm text-foreground">
                                <Checkbox
                                    checked={button.open_in_new_tab}
                                    onCheckedChange={(checked) =>
                                        updateButtons(
                                            buttons.map((entry, buttonIndex) =>
                                                buttonIndex === index
                                                    ? {
                                                          ...entry,
                                                          open_in_new_tab:
                                                              checked === true,
                                                      }
                                                    : entry,
                                            ),
                                        )
                                    }
                                />
                                Open in new tab
                            </label>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export const buttonGroupModule: CmsModuleManifest = {
    key: 'button_group',
    label: 'Button Group',
    category: 'actions',
    description:
        'One or more CTA buttons that stay grouped inside the current container.',
    defaultData: {
        buttons: [defaultButton()],
    },
    defaultConfig: {
        layout: 'auto',
        alignment: 'stretch',
    },
    Renderer: ButtonGroupRenderer,
    Editor: ButtonGroupEditor,
};
