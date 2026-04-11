import { usePage } from '@inertiajs/react';
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
import { createDefaultLinkTarget, updateLinkTargetType } from '@/lib/link-targets';
import type { CmsModuleEditorProps } from '../../core/module-types';
import type { SharedLinkTargetOptions } from '@/types';
import {
    createDefaultCardListItem,
    getCardListColumns,
    getCardListEyebrow,
    getCardListIntro,
    getCardListItems,
    getCardListLayout,
    getCardListTitle,
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
        ((page.props as typeof page.props & {
            linkTargetOptions?: SharedLinkTargetOptions | null;
        }).linkTargetOptions as SharedLinkTargetOptions | null | undefined) ??
        null;

    const updateItems = (nextItems: ReturnType<typeof getCardListItems>) =>
        onChange({
            ...value,
            data: {
                ...value.data,
                items: nextItems,
            },
        });

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
                        <div className="flex items-center justify-between gap-3">
                            <p className="text-sm font-medium text-foreground">
                                Card {index + 1}
                            </p>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                disabled={items.length === 1}
                                onClick={() =>
                                    updateItems(
                                        items.filter(
                                            (_, itemIndex) => itemIndex !== index,
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
                                                          eyebrow: event.target
                                                              .value,
                                                      }
                                                    : entry,
                                            ),
                                        )
                                    }
                                    placeholder="Read"
                                />
                            </div>

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
                                                          event.target.value,
                                                  }
                                                : entry,
                                        ),
                                    )
                                }
                                placeholder="Learn more"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label
                                htmlFor={`${idPrefix}-card-list-item-target-type-${index}`}
                            >
                                Destination type
                            </Label>
                            <Select
                                value={
                                    (item.target ?? createDefaultLinkTarget('url'))
                                        .type
                                }
                                onValueChange={(nextValue) =>
                                    updateItems(
                                        items.map((entry, itemIndex) =>
                                            itemIndex === index
                                                ? {
                                                      ...entry,
                                                      target: updateLinkTargetType(
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
                                    id={`${idPrefix}-card-list-item-target-type-${index}`}
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

                        <LinkTargetFields
                            idPrefix={`${idPrefix}-card-list-item-target-${index}`}
                            value={item.target ?? createDefaultLinkTarget('url')}
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
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}
