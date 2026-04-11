import { useState } from 'react';
import { usePage } from '@inertiajs/react';
import { LinkTargetFields } from '@/components/navigation/link-target-fields';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
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
import {
    createDefaultLinkTarget,
    updateLinkTargetType,
} from '@/lib/link-targets';
import type { SharedLinkTargetOptions } from '@/types';
import {
    SHARED_ROUTE_TARGET_OPTIONS,
    SHARED_SCRIPTURE_TARGET_KIND_OPTIONS,
} from '@/lib/link-target-options';
import type { CmsModuleEditorProps } from '../../core/module-types';
import {
    createDefaultButton,
    type ButtonItem,
    type ButtonVariant,
    getButtonGroupAlignment,
    getButtonGroupButtons,
    getButtonGroupLayout,
} from './types';

export function ButtonGroupEditor({
    value,
    onChange,
    idPrefix,
    errors,
}: CmsModuleEditorProps) {
    const page = usePage();
    const buttons = getButtonGroupButtons(value.data);
    const layout = getButtonGroupLayout(value.config);
    const alignment = getButtonGroupAlignment(value.config);
    const sharedTargetOptions =
        ((page.props as typeof page.props & {
            linkTargetOptions?: SharedLinkTargetOptions | null;
        }).linkTargetOptions as SharedLinkTargetOptions | null | undefined) ??
        null;
    const [activeStep, setActiveStep] = useState<'buttons' | 'layout'>(
        'buttons',
    );

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
            <div className="flex flex-wrap gap-2">
                <Button
                    type="button"
                    variant={activeStep === 'buttons' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveStep('buttons')}
                >
                    1. Buttons
                </Button>
                <Button
                    type="button"
                    variant={activeStep === 'layout' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveStep('layout')}
                >
                    2. Layout
                </Button>
            </div>

            {activeStep === 'buttons' ? (
                <div className="space-y-4">
                    <div className="rounded-2xl border border-border/70 bg-background px-4 py-4">
                        <p className="text-sm leading-6 text-muted-foreground">
                            Start with labels and destinations first. Layout can
                            stay hidden until the action content is right.
                        </p>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <p className="text-sm font-medium text-foreground">
                                Buttons
                            </p>
                            <p className="text-xs leading-5 text-muted-foreground">
                                Keep action buttons together inside the current
                                container. Create a new container instead when
                                the action set should become its own card.
                            </p>
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() =>
                                updateButtons([...buttons, createDefaultButton()])
                            }
                        >
                            Add button
                        </Button>
                    </div>

                    <InputError message={errors['data_json.buttons']} />

                    {buttons.map((button, index) => (
                        <div
                            key={`button-${index}`}
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
                                    <Label
                                        htmlFor={`${idPrefix}-button-label-${index}`}
                                    >
                                        Label
                                    </Label>
                                    <Input
                                        id={`${idPrefix}-button-label-${index}`}
                                        value={button.label}
                                        onChange={(event) =>
                                            updateButtons(
                                                buttons.map(
                                                    (entry, buttonIndex) =>
                                                        buttonIndex === index
                                                            ? {
                                                                  ...entry,
                                                                  label: event
                                                                      .target
                                                                      .value,
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
                                    <Label
                                        htmlFor={`${idPrefix}-button-destination-type-${index}`}
                                    >
                                        Destination type
                                    </Label>
                                    <Select
                                        value={button.target.type}
                                        onValueChange={(nextValue) =>
                                            updateButtons(
                                                buttons.map(
                                                    (entry, buttonIndex) =>
                                                        buttonIndex === index
                                                            ? {
                                                                  ...entry,
                                                                  target:
                                                                      updateLinkTargetType(
                                                                          entry.target,
                                                                          nextValue as
                                                                              | 'url'
                                                                              | 'cms_page'
                                                                              | 'route'
                                                                              | 'scripture',
                                                                          sharedTargetOptions,
                                                                      ),
                                                              }
                                                            : entry,
                                                ),
                                            )
                                        }
                                    >
                                        <SelectTrigger
                                            id={`${idPrefix}-button-destination-type-${index}`}
                                            className="w-full"
                                        >
                                            <SelectValue placeholder="Choose destination type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="url">
                                                External or direct URL
                                            </SelectItem>
                                            <SelectItem value="cms_page">
                                                CMS page
                                            </SelectItem>
                                            <SelectItem value="route">
                                                Internal route
                                            </SelectItem>
                                            <SelectItem value="scripture">
                                                Scripture target
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <LinkTargetFields
                                idPrefix={`${idPrefix}-button-target-${index}`}
                                value={button.target ?? createDefaultLinkTarget()}
                                onChange={(target) =>
                                    updateButtons(
                                        buttons.map((entry, buttonIndex) =>
                                            buttonIndex === index
                                                ? {
                                                      ...entry,
                                                      target,
                                                  }
                                                : entry,
                                        ),
                                    )
                                }
                                errors={{
                                    url: errors[
                                        `data_json.buttons.${index}.target.value.url`
                                    ],
                                    slug: errors[
                                        `data_json.buttons.${index}.target.value.slug`
                                    ],
                                    key: errors[
                                        `data_json.buttons.${index}.target.value.key`
                                    ],
                                    kind: errors[
                                        `data_json.buttons.${index}.target.value.kind`
                                    ],
                                    book_slug:
                                        errors[
                                            `data_json.buttons.${index}.target.value.book_slug`
                                        ],
                                    book_section_slug:
                                        errors[
                                            `data_json.buttons.${index}.target.value.book_section_slug`
                                        ],
                                    chapter_slug:
                                        errors[
                                            `data_json.buttons.${index}.target.value.chapter_slug`
                                        ],
                                    chapter_section_slug:
                                        errors[
                                            `data_json.buttons.${index}.target.value.chapter_section_slug`
                                        ],
                                    verse_slug:
                                        errors[
                                            `data_json.buttons.${index}.target.value.verse_slug`
                                        ],
                                    entry_slug:
                                        errors[
                                            `data_json.buttons.${index}.target.value.entry_slug`
                                        ],
                                }}
                                routeOptions={SHARED_ROUTE_TARGET_OPTIONS}
                                scriptureTargetKinds={
                                    SHARED_SCRIPTURE_TARGET_KIND_OPTIONS
                                }
                            />

                            <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
                                <div className="grid gap-2">
                                    <Label
                                        htmlFor={`${idPrefix}-button-variant-${index}`}
                                    >
                                        Style
                                    </Label>
                                    <Select
                                        value={button.variant}
                                        onValueChange={(nextValue) =>
                                            updateButtons(
                                                buttons.map(
                                                    (entry, buttonIndex) =>
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
                                            id={`${idPrefix}-button-variant-${index}`}
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
                                                buttons.map(
                                                    (entry, buttonIndex) =>
                                                        buttonIndex === index
                                                            ? {
                                                                  ...entry,
                                                                  open_in_new_tab:
                                                                      checked ===
                                                                      true,
                                                                  target: {
                                                                      ...entry.target,
                                                                      behavior: {
                                                                          ...entry
                                                                              .target
                                                                              .behavior,
                                                                          new_tab:
                                                                              checked ===
                                                                              true,
                                                                      },
                                                                  },
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

                    <div className="flex justify-end">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setActiveStep('layout')}
                        >
                            Next: Layout
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="space-y-5">
                    <div className="rounded-2xl border border-border/70 bg-background px-4 py-4">
                        <p className="text-sm leading-6 text-muted-foreground">
                            Adjust placement only after the current button set
                            is settled.
                        </p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor={`${idPrefix}-button-layout`}>
                                Layout
                            </Label>
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
                                <SelectTrigger
                                    id={`${idPrefix}-button-layout`}
                                    className="w-full"
                                >
                                    <SelectValue placeholder="Choose layout" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="auto">
                                        Auto grid
                                    </SelectItem>
                                    <SelectItem value="stack">
                                        Stacked
                                    </SelectItem>
                                    <SelectItem value="inline">
                                        Inline wrap
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            <InputError message={errors['config_json.layout']} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor={`${idPrefix}-button-alignment`}>
                                Alignment
                            </Label>
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
                                    id={`${idPrefix}-button-alignment`}
                                    className="w-full"
                                >
                                    <SelectValue placeholder="Choose alignment" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="start">Start</SelectItem>
                                    <SelectItem value="center">
                                        Center
                                    </SelectItem>
                                    <SelectItem value="end">End</SelectItem>
                                    <SelectItem value="stretch">
                                        Stretch
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            <InputError
                                message={errors['config_json.alignment']}
                            />
                        </div>
                    </div>

                    <div className="flex justify-start">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setActiveStep('buttons')}
                        >
                            Back to Buttons
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
