import { useState } from 'react';
import { usePage } from '@inertiajs/react';
import { Copy, MoveDown, MoveUp, Sparkles } from 'lucide-react';
import { LinkTargetFields } from '@/components/navigation/link-target-fields';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
    SHARED_ROUTE_TARGET_OPTIONS,
    SHARED_SCRIPTURE_TARGET_KIND_OPTIONS,
} from '@/lib/link-target-options';
import {
    createDefaultLinkTarget,
    describeLinkTarget,
} from '@/lib/link-targets';
import type { CmsModuleEditorProps } from '../../core/module-types';
import type { LinkTarget, SharedLinkTargetOptions } from '@/types';
import {
    createDefaultCardListItem,
    getCardListColumns,
    getCardListEyebrow,
    getCardListIntro,
    getCardListItems,
    getCardListLayout,
    getCardListTitle,
    resolveCardListItemHref,
} from './types';

export function CardListEditor({
    value,
    onChange,
    idPrefix,
    errors,
}: CmsModuleEditorProps) {
    const page = usePage();
    const items = getCardListItems(value.data);
    const layout = getCardListLayout(value.config);
    const columns = getCardListColumns(value.config);
    const sharedTargetOptions =
        ((
            page.props as typeof page.props & {
                linkTargetOptions?: SharedLinkTargetOptions | null;
            }
        ).linkTargetOptions as SharedLinkTargetOptions | null | undefined) ??
        null;
    const [openAdvancedItems, setOpenAdvancedItems] = useState<number[]>([]);

    const updateItems = (nextItems: ReturnType<typeof getCardListItems>) =>
        onChange({
            ...value,
            data: {
                ...value.data,
                items: nextItems,
            },
        });

    const toggleAdvancedItem = (index: number) =>
        setOpenAdvancedItems((current) =>
            current.includes(index)
                ? current.filter((entry) => entry !== index)
                : [...current, index],
        );

    const duplicateItem = (index: number) => {
        const item = items[index];

        if (!item) {
            return;
        }

        updateItems([
            ...items.slice(0, index + 1),
            {
                ...item,
                target: item.target ? cloneLinkTarget(item.target) : null,
            },
            ...items.slice(index + 1),
        ]);
    };

    const moveItem = (index: number, direction: -1 | 1) => {
        const nextIndex = index + direction;

        if (nextIndex < 0 || nextIndex >= items.length) {
            return;
        }

        const nextItems = [...items];
        const [movedItem] = nextItems.splice(index, 1);

        nextItems.splice(nextIndex, 0, movedItem);
        updateItems(nextItems);
    };

    return (
        <div className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                    <Label htmlFor={`${idPrefix}-card-list-eyebrow`}>
                        Eyebrow
                    </Label>
                    <Input
                        id={`${idPrefix}-card-list-eyebrow`}
                        value={getCardListEyebrow(value.data)}
                        onChange={(event) =>
                            onChange({
                                ...value,
                                data: {
                                    ...value.data,
                                    eyebrow: event.target.value,
                                },
                            })
                        }
                        placeholder="Explore more"
                    />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor={`${idPrefix}-card-list-title`}>
                        Section title
                    </Label>
                    <Input
                        id={`${idPrefix}-card-list-title`}
                        value={getCardListTitle(value.data)}
                        onChange={(event) =>
                            onChange({
                                ...value,
                                data: {
                                    ...value.data,
                                    title: event.target.value,
                                },
                            })
                        }
                        placeholder="Highlights for readers"
                    />
                </div>
            </div>

            <div className="grid gap-2">
                <Label htmlFor={`${idPrefix}-card-list-intro`}>
                    Intro text
                </Label>
                <Textarea
                    id={`${idPrefix}-card-list-intro`}
                    className="min-h-24"
                    value={getCardListIntro(value.data)}
                    onChange={(event) =>
                        onChange({
                            ...value,
                            data: {
                                ...value.data,
                                intro: event.target.value,
                            },
                        })
                    }
                    placeholder="Add a short summary before the cards."
                />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                    <Label htmlFor={`${idPrefix}-card-list-layout`}>
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
                            id={`${idPrefix}-card-list-layout`}
                            className="w-full"
                        >
                            <SelectValue placeholder="Choose layout" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="cards">Cards</SelectItem>
                            <SelectItem value="list">List</SelectItem>
                        </SelectContent>
                    </Select>
                    <InputError message={errors['config_json.layout']} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor={`${idPrefix}-card-list-columns`}>
                        Columns
                    </Label>
                    <Select
                        value={columns}
                        onValueChange={(nextValue) =>
                            onChange({
                                ...value,
                                config: {
                                    ...value.config,
                                    columns: nextValue,
                                },
                            })
                        }
                    >
                        <SelectTrigger
                            id={`${idPrefix}-card-list-columns`}
                            className="w-full"
                        >
                            <SelectValue placeholder="Choose column count" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="one">One</SelectItem>
                            <SelectItem value="two">Two</SelectItem>
                            <SelectItem value="three">Three</SelectItem>
                        </SelectContent>
                    </Select>
                    <InputError message={errors['config_json.columns']} />
                </div>
            </div>

            <div className="space-y-4">
                <div className="rounded-2xl border border-border/70 bg-background px-4 py-4">
                    <p className="text-sm leading-6 text-muted-foreground">
                        Start with the card title, body, CTA label, and
                        destination. Optional display polish can stay secondary
                        until the core reader path is right.
                    </p>
                </div>

                <div className="flex items-center justify-between gap-3">
                    <div>
                        <p className="text-sm font-medium text-foreground">
                            Cards
                        </p>
                        <p className="text-xs leading-5 text-muted-foreground">
                            Use this module for repeatable callouts, resource
                            lists, or simple grouped highlights inside a
                            declared supplemental region.
                        </p>
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                            updateItems([...items, createDefaultCardListItem()])
                        }
                    >
                        Add card
                    </Button>
                </div>

                <InputError message={errors['data_json.items']} />

                {items.map((item, index) => (
                    <div
                        key={`card-list-item-${index}`}
                        className="space-y-4 rounded-2xl border border-border/70 bg-muted/20 p-4"
                    >
                        <div className="space-y-3">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div>
                                    <p className="text-sm font-medium text-foreground">
                                        Card {index + 1}
                                    </p>
                                    <p className="text-xs leading-5 text-muted-foreground">
                                        {item.title.trim() || 'Untitled card'}
                                    </p>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => moveItem(index, -1)}
                                        disabled={index === 0}
                                    >
                                        <MoveUp className="size-4" />
                                        Up
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => moveItem(index, 1)}
                                        disabled={index === items.length - 1}
                                    >
                                        <MoveDown className="size-4" />
                                        Down
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => duplicateItem(index)}
                                    >
                                        <Copy className="size-4" />
                                        Duplicate
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        disabled={items.length === 1}
                                        onClick={() =>
                                            updateItems(
                                                items.filter(
                                                    (_, itemIndex) =>
                                                        itemIndex !== index,
                                                ),
                                            )
                                        }
                                    >
                                        Remove
                                    </Button>
                                </div>
                            </div>

                            <div className="rounded-xl border border-border/70 bg-background px-4 py-3">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="rounded-full border border-border/70 px-2 py-1 text-[11px] font-medium tracking-[0.12em] text-muted-foreground uppercase">
                                        {
                                            (
                                                item.target ??
                                                createDefaultLinkTarget('url')
                                            ).type
                                        }
                                    </span>
                                    {item.cta_label.trim() ? (
                                        <span className="rounded-full border border-border/70 px-2 py-1 text-[11px] font-medium tracking-[0.12em] text-muted-foreground uppercase">
                                            CTA: {item.cta_label.trim()}
                                        </span>
                                    ) : null}
                                    {item.eyebrow.trim() ? (
                                        <span className="rounded-full border border-border/70 px-2 py-1 text-[11px] font-medium tracking-[0.12em] text-muted-foreground uppercase">
                                            Eyebrow set
                                        </span>
                                    ) : null}
                                </div>
                                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                                    {describeLinkTarget(
                                        item.target,
                                        sharedTargetOptions,
                                    ) ??
                                        'No destination resolved yet. Paste a path or open the structured details below.'}
                                </p>
                                {describeLinkTarget(
                                    item.target,
                                    sharedTargetOptions,
                                ) !== resolveCardListItemHref(item) &&
                                resolveCardListItemHref(item) ? (
                                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                                        {resolveCardListItemHref(item)}
                                    </p>
                                ) : null}
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)]">
                            <div className="grid gap-2">
                                <Label
                                    htmlFor={`${idPrefix}-card-list-item-title-${index}`}
                                >
                                    Title
                                </Label>
                                <Input
                                    id={`${idPrefix}-card-list-item-title-${index}`}
                                    value={item.title}
                                    onChange={(event) =>
                                        updateItems(
                                            items.map((entry, itemIndex) =>
                                                itemIndex === index
                                                    ? {
                                                          ...entry,
                                                          title: event.target
                                                              .value,
                                                      }
                                                    : entry,
                                            ),
                                        )
                                    }
                                    placeholder="Explore the library"
                                />
                                <InputError
                                    message={
                                        errors[`data_json.items.${index}.title`]
                                    }
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label
                                    htmlFor={`${idPrefix}-card-list-item-cta-${index}`}
                                >
                                    CTA label
                                </Label>
                                <Input
                                    id={`${idPrefix}-card-list-item-cta-${index}`}
                                    value={item.cta_label}
                                    onChange={(event) =>
                                        updateItems(
                                            items.map((entry, itemIndex) =>
                                                itemIndex === index
                                                    ? {
                                                          ...entry,
                                                          cta_label:
                                                              event.target
                                                                  .value,
                                                      }
                                                    : entry,
                                            ),
                                        )
                                    }
                                    placeholder="Learn more"
                                />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label
                                htmlFor={`${idPrefix}-card-list-item-body-${index}`}
                            >
                                Body
                            </Label>
                            <Textarea
                                id={`${idPrefix}-card-list-item-body-${index}`}
                                className="min-h-24"
                                value={item.body}
                                onChange={(event) =>
                                    updateItems(
                                        items.map((entry, itemIndex) =>
                                            itemIndex === index
                                                ? {
                                                      ...entry,
                                                      body: event.target.value,
                                                  }
                                                : entry,
                                        ),
                                    )
                                }
                                placeholder="Explain why this card matters in the current region."
                            />
                        </div>

                        <div className="rounded-2xl border border-dashed border-border/70 bg-background/60 px-4 py-4">
                            <p className="text-sm font-medium text-foreground">
                                Destination
                            </p>
                            <p className="mt-1 text-xs leading-5 text-muted-foreground">
                                Choose the destination type here, then paste a
                                path or open the structured details below.
                            </p>
                        </div>

                        <LinkTargetFields
                            idPrefix={`${idPrefix}-card-list-item-target-${index}`}
                            value={
                                item.target ?? createDefaultLinkTarget('url')
                            }
                            onChange={(target) =>
                                updateItems(
                                    items.map((entry, itemIndex) =>
                                        itemIndex === index
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
                                    `data_json.items.${index}.target.value.url`
                                ],
                                slug: errors[
                                    `data_json.items.${index}.target.value.slug`
                                ],
                                key: errors[
                                    `data_json.items.${index}.target.value.key`
                                ],
                                kind: errors[
                                    `data_json.items.${index}.target.value.kind`
                                ],
                                book_slug:
                                    errors[
                                        `data_json.items.${index}.target.value.book_slug`
                                    ],
                                book_section_slug:
                                    errors[
                                        `data_json.items.${index}.target.value.book_section_slug`
                                    ],
                                chapter_slug:
                                    errors[
                                        `data_json.items.${index}.target.value.chapter_slug`
                                    ],
                                chapter_section_slug:
                                    errors[
                                        `data_json.items.${index}.target.value.chapter_section_slug`
                                    ],
                                verse_slug:
                                    errors[
                                        `data_json.items.${index}.target.value.verse_slug`
                                    ],
                                entry_slug:
                                    errors[
                                        `data_json.items.${index}.target.value.entry_slug`
                                    ],
                            }}
                            routeOptions={SHARED_ROUTE_TARGET_OPTIONS}
                            scriptureTargetKinds={
                                SHARED_SCRIPTURE_TARGET_KIND_OPTIONS
                            }
                            showTypeSelector
                            compactDetails
                        />

                        <div className="rounded-2xl border border-border/70 bg-background px-4 py-4">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div>
                                    <p className="text-sm font-medium text-foreground">
                                        Advanced card options
                                    </p>
                                    <p className="text-xs leading-5 text-muted-foreground">
                                        Use these only when the card needs an
                                        extra eyebrow or other optional display
                                        polish beyond the common reader path.
                                    </p>
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => toggleAdvancedItem(index)}
                                >
                                    <Sparkles className="size-4" />
                                    {openAdvancedItems.includes(index)
                                        ? 'Hide advanced'
                                        : 'Edit advanced'}
                                </Button>
                            </div>

                            {openAdvancedItems.includes(index) && (
                                <div className="mt-4 grid gap-2">
                                    <Label
                                        htmlFor={`${idPrefix}-card-list-item-eyebrow-${index}`}
                                    >
                                        Eyebrow
                                    </Label>
                                    <Input
                                        id={`${idPrefix}-card-list-item-eyebrow-${index}`}
                                        value={item.eyebrow}
                                        onChange={(event) =>
                                            updateItems(
                                                items.map((entry, itemIndex) =>
                                                    itemIndex === index
                                                        ? {
                                                              ...entry,
                                                              eyebrow:
                                                                  event.target
                                                                      .value,
                                                          }
                                                        : entry,
                                                ),
                                            )
                                        }
                                        placeholder="Read"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function cloneLinkTarget(target: LinkTarget): LinkTarget {
    if (target.type === 'cms_page') {
        return {
            ...target,
            value: { ...target.value },
            behavior: { ...target.behavior },
        };
    }

    if (target.type === 'route') {
        return {
            ...target,
            value: { ...target.value },
            behavior: { ...target.behavior },
        };
    }

    if (target.type === 'scripture') {
        return {
            ...target,
            value: { ...target.value },
            behavior: { ...target.behavior },
        };
    }

    return {
        ...target,
        value: { ...target.value },
        behavior: { ...target.behavior },
    };
}
