import { useEffect, useMemo, useState } from 'react';
import { usePage } from '@inertiajs/react';
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
import type {
    LinkTarget,
    RouteTargetKey,
    SharedLinkTargetOptions,
    ScriptureTargetKind,
} from '@/types';
import {
    SHARED_ROUTE_TARGET_OPTIONS,
    SHARED_SCRIPTURE_TARGET_KIND_OPTIONS,
} from '@/lib/link-target-options';
import {
    createDefaultLinkTarget,
    parseLinkTargetInput,
    resolveLinkTargetHref,
} from '@/lib/link-targets';

type Props = {
    value: LinkTarget;
    onChange: (next: LinkTarget) => void;
    idPrefix: string;
    errors?: Record<string, string | undefined>;
    cmsPages?: Array<{
        slug: string;
        title: string;
    }>;
    routeOptions?: Record<string, string>;
    scriptureTargetKinds?: Record<string, string>;
    books?: Array<{
        slug: string;
        title: string;
    }>;
    dictionaryEntries?: Array<{
        slug: string;
        title: string;
    }>;
    topics?: Array<{
        slug: string;
        title: string;
    }>;
    characters?: Array<{
        slug: string;
        title: string;
    }>;
};

function selectValue(value: string | null | undefined): string {
    return value ?? '__none__';
}

export function LinkTargetFields({
    value,
    onChange,
    idPrefix,
    errors = {},
    cmsPages,
    routeOptions,
    scriptureTargetKinds,
    books,
    dictionaryEntries,
    topics,
    characters,
}: Props) {
    const page = usePage();
    const sharedOptions =
        ((page.props as typeof page.props & {
            linkTargetOptions?: SharedLinkTargetOptions | null;
        }).linkTargetOptions as SharedLinkTargetOptions | null | undefined) ??
        null;
    const target = value ?? createDefaultLinkTarget('url');
    const effectiveOptions = useMemo<SharedLinkTargetOptions>(
        () => ({
            route_options:
                routeOptions ??
                sharedOptions?.route_options ??
                SHARED_ROUTE_TARGET_OPTIONS,
            scripture_target_kinds:
                scriptureTargetKinds ??
                sharedOptions?.scripture_target_kinds ??
                SHARED_SCRIPTURE_TARGET_KIND_OPTIONS,
            cms_pages: cmsPages ?? sharedOptions?.cms_pages ?? [],
            books: books ?? sharedOptions?.books ?? [],
            dictionary_entries:
                dictionaryEntries ?? sharedOptions?.dictionary_entries ?? [],
            topics: topics ?? sharedOptions?.topics ?? [],
            characters: characters ?? sharedOptions?.characters ?? [],
        }),
        [
            books,
            characters,
            cmsPages,
            dictionaryEntries,
            routeOptions,
            scriptureTargetKinds,
            sharedOptions,
            topics,
        ],
    );
    const [quickTargetInput, setQuickTargetInput] = useState(
        resolveLinkTargetHref(target) ?? '',
    );
    const [quickTargetFeedback, setQuickTargetFeedback] = useState<string | null>(
        null,
    );

    useEffect(() => {
        setQuickTargetInput(resolveLinkTargetHref(target) ?? '');
    }, [target]);

    const applyQuickTarget = () => {
        const parsed = parseLinkTargetInput(quickTargetInput);

        if (!parsed) {
            setQuickTargetFeedback(
                'Enter a full URL or a site path like /pages/platform-guide or /books/bhagavad-gita.',
            );
            return;
        }

        onChange(parsed);
        setQuickTargetFeedback(
            parsed.type === 'url'
                ? 'Resolved as a direct URL.'
                : parsed.type === 'cms_page'
                  ? 'Resolved as a CMS page target.'
                  : parsed.type === 'route'
                    ? 'Resolved as an internal route.'
                    : 'Resolved as a scripture destination.',
        );
    };

    const handleScriptureKindChange = (nextKind: ScriptureTargetKind) => {
        if (nextKind === 'book') {
            onChange({
                ...target,
                type: 'scripture',
                value: {
                    kind: nextKind,
                    book_slug:
                        target.type === 'scripture' && target.value.kind === 'book'
                            ? target.value.book_slug ?? effectiveOptions.books[0]?.slug ?? null
                            : effectiveOptions.books[0]?.slug ?? null,
                    book_section_slug: null,
                    chapter_slug: null,
                    chapter_section_slug: null,
                    verse_slug: null,
                    entry_slug: null,
                },
            });

            return;
        }

        if (nextKind === 'dictionary_entry' || nextKind === 'topic' || nextKind === 'character') {
            const entryOptions =
                nextKind === 'dictionary_entry'
                    ? effectiveOptions.dictionary_entries
                    : nextKind === 'topic'
                      ? effectiveOptions.topics
                      : effectiveOptions.characters;

            onChange({
                ...target,
                type: 'scripture',
                value: {
                    kind: nextKind,
                    book_slug: null,
                    book_section_slug: null,
                    chapter_slug: null,
                    chapter_section_slug: null,
                    verse_slug: null,
                    entry_slug: entryOptions[0]?.slug ?? null,
                },
            });

            return;
        }

        onChange({
            ...target,
            type: 'scripture',
            value: {
                kind: nextKind,
                book_slug: effectiveOptions.books[0]?.slug ?? null,
                book_section_slug: null,
                chapter_slug: null,
                chapter_section_slug: null,
                verse_slug: null,
                entry_slug: null,
            },
        });
    };

    return (
        <div className="space-y-4">
            <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                <div className="grid gap-2">
                    <Label htmlFor={`${idPrefix}-quick-target`}>
                        Paste a URL or site path
                    </Label>
                    <div className="flex flex-wrap gap-2">
                        <Input
                            id={`${idPrefix}-quick-target`}
                            data-link-target-quick-input={idPrefix}
                            value={quickTargetInput}
                            onChange={(event) => {
                                setQuickTargetInput(event.target.value);
                                setQuickTargetFeedback(null);
                            }}
                            placeholder="/pages/platform-guide or /books/bhagavad-gita"
                        />
                        <Button
                            type="button"
                            variant="outline"
                            onClick={applyQuickTarget}
                            data-link-target-quick-apply={idPrefix}
                        >
                            Apply
                        </Button>
                    </div>
                    <p className="text-xs leading-5 text-muted-foreground">
                        This keeps the structured target model intact, but it
                        lets you paste common destinations instead of rebuilding
                        them field by field.
                    </p>
                    {quickTargetFeedback ? (
                        <p className="text-xs text-muted-foreground">
                            {quickTargetFeedback}
                        </p>
                    ) : null}
                </div>
            </div>

            {target.type === 'url' && (
                <div className="grid gap-2">
                    <Label htmlFor={`${idPrefix}-url`}>URL</Label>
                    <Input
                        id={`${idPrefix}-url`}
                        value={target.value.url ?? ''}
                        onChange={(event) =>
                            onChange({
                                ...target,
                                value: {
                                    url: event.target.value,
                                },
                            })
                        }
                        placeholder="https://example.com"
                    />
                    <InputError message={errors.url} />
                </div>
            )}

            {target.type === 'cms_page' && (
                <div className="grid gap-2">
                    <Label htmlFor={`${idPrefix}-cms-page`}>CMS page</Label>
                    {effectiveOptions.cms_pages.length > 0 ? (
                        <Select
                            value={selectValue(target.value.slug)}
                            onValueChange={(nextValue) =>
                                onChange({
                                    ...target,
                                    value: {
                                        slug:
                                            nextValue === '__none__'
                                                ? null
                                                : nextValue,
                                    },
                                })
                            }
                        >
                            <SelectTrigger
                                id={`${idPrefix}-cms-page`}
                                className="w-full"
                            >
                                <SelectValue placeholder="Choose a CMS page" />
                            </SelectTrigger>
                            <SelectContent>
                                {effectiveOptions.cms_pages.map((pageOption) => (
                                    <SelectItem
                                        key={pageOption.slug}
                                        value={pageOption.slug}
                                    >
                                        {pageOption.title}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    ) : (
                        <Input
                            id={`${idPrefix}-cms-page`}
                            value={target.value.slug ?? ''}
                            onChange={(event) =>
                                onChange({
                                    ...target,
                                    value: {
                                        slug: event.target.value,
                                    },
                                })
                            }
                            placeholder="page-slug"
                        />
                    )}
                    <InputError message={errors.slug} />
                </div>
            )}

            {target.type === 'route' && (
                <div className="grid gap-2">
                    <Label htmlFor={`${idPrefix}-route-key`}>Route</Label>
                    <Select
                        value={selectValue(target.value.key)}
                        onValueChange={(nextValue) =>
                            onChange({
                                ...target,
                                value: {
                                    key:
                                        nextValue === '__none__'
                                            ? null
                                            : (nextValue as RouteTargetKey),
                                },
                            })
                        }
                    >
                        <SelectTrigger
                            id={`${idPrefix}-route-key`}
                            className="w-full"
                        >
                            <SelectValue placeholder="Choose an internal route" />
                        </SelectTrigger>
                        <SelectContent>
                            {Object.entries(effectiveOptions.route_options).map(
                                ([key, label]) => (
                                    <SelectItem key={key} value={key}>
                                        {label}
                                    </SelectItem>
                                ),
                            )}
                        </SelectContent>
                    </Select>
                    <InputError message={errors.key} />
                </div>
            )}

            {target.type === 'scripture' && (
                <div className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor={`${idPrefix}-scripture-kind`}>
                            Scripture target
                        </Label>
                        <Select
                            value={selectValue(target.value.kind)}
                            onValueChange={(nextValue) =>
                                handleScriptureKindChange(
                                    nextValue as ScriptureTargetKind,
                                )
                            }
                        >
                            <SelectTrigger
                                id={`${idPrefix}-scripture-kind`}
                                className="w-full"
                            >
                                <SelectValue placeholder="Choose a scripture target" />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.entries(
                                    effectiveOptions.scripture_target_kinds,
                                ).map(([key, label]) => (
                                    <SelectItem key={key} value={key}>
                                        {label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError message={errors.kind} />
                    </div>

                    {(target.value.kind === 'book' ||
                        target.value.kind === 'chapter' ||
                        target.value.kind === 'verse') && (
                        <div className="grid gap-2">
                            <Label htmlFor={`${idPrefix}-book-slug`}>
                                Book
                            </Label>
                            {effectiveOptions.books.length > 0 ? (
                                <Select
                                    value={selectValue(target.value.book_slug)}
                                    onValueChange={(nextValue) =>
                                        onChange({
                                            ...target,
                                            value: {
                                                ...target.value,
                                                book_slug:
                                                    nextValue === '__none__'
                                                        ? null
                                                        : nextValue,
                                            },
                                        })
                                    }
                                >
                                    <SelectTrigger
                                        id={`${idPrefix}-book-slug`}
                                        className="w-full"
                                    >
                                        <SelectValue placeholder="Choose a book" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {effectiveOptions.books.map((book) => (
                                            <SelectItem
                                                key={book.slug}
                                                value={book.slug}
                                            >
                                                {book.title}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            ) : (
                                <Input
                                    id={`${idPrefix}-book-slug`}
                                    value={target.value.book_slug ?? ''}
                                    onChange={(event) =>
                                        onChange({
                                            ...target,
                                            value: {
                                                ...target.value,
                                                book_slug: event.target.value,
                                            },
                                        })
                                    }
                                    placeholder="bhagavad-gita"
                                />
                            )}
                            <InputError message={errors.book_slug} />
                        </div>
                    )}

                    {(target.value.kind === 'chapter' ||
                        target.value.kind === 'verse') && (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor={`${idPrefix}-book-section-slug`}>
                                    Book section slug
                                </Label>
                                <Input
                                    id={`${idPrefix}-book-section-slug`}
                                    value={target.value.book_section_slug ?? ''}
                                    onChange={(event) =>
                                        onChange({
                                            ...target,
                                            value: {
                                                ...target.value,
                                                book_section_slug:
                                                    event.target.value,
                                            },
                                        })
                                    }
                                    placeholder="main"
                                />
                                <InputError message={errors.book_section_slug} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor={`${idPrefix}-chapter-slug`}>
                                    Chapter slug
                                </Label>
                                <Input
                                    id={`${idPrefix}-chapter-slug`}
                                    value={target.value.chapter_slug ?? ''}
                                    onChange={(event) =>
                                        onChange({
                                            ...target,
                                            value: {
                                                ...target.value,
                                                chapter_slug: event.target.value,
                                            },
                                        })
                                    }
                                    placeholder="chapter-2"
                                />
                                <InputError message={errors.chapter_slug} />
                            </div>
                        </>
                    )}

                    {target.value.kind === 'verse' && (
                        <>
                            <div className="grid gap-2">
                                <Label
                                    htmlFor={`${idPrefix}-chapter-section-slug`}
                                >
                                    Chapter section slug
                                </Label>
                                <Input
                                    id={`${idPrefix}-chapter-section-slug`}
                                    value={
                                        target.value.chapter_section_slug ?? ''
                                    }
                                    onChange={(event) =>
                                        onChange({
                                            ...target,
                                            value: {
                                                ...target.value,
                                                chapter_section_slug:
                                                    event.target.value,
                                            },
                                        })
                                    }
                                    placeholder="main"
                                />
                                <InputError
                                    message={errors.chapter_section_slug}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor={`${idPrefix}-verse-slug`}>
                                    Verse slug
                                </Label>
                                <Input
                                    id={`${idPrefix}-verse-slug`}
                                    value={target.value.verse_slug ?? ''}
                                    onChange={(event) =>
                                        onChange({
                                            ...target,
                                            value: {
                                                ...target.value,
                                                verse_slug: event.target.value,
                                            },
                                        })
                                    }
                                    placeholder="verse-1"
                                />
                                <InputError message={errors.verse_slug} />
                            </div>
                        </>
                    )}

                    {(target.value.kind === 'dictionary_entry' ||
                        target.value.kind === 'topic' ||
                        target.value.kind === 'character') && (
                        <div className="grid gap-2">
                            <Label htmlFor={`${idPrefix}-entry-slug`}>
                                Entry
                            </Label>
                            {(target.value.kind === 'dictionary_entry'
                                ? effectiveOptions.dictionary_entries
                                : target.value.kind === 'topic'
                                  ? effectiveOptions.topics
                                  : effectiveOptions.characters).length > 0 ? (
                                <Select
                                    value={selectValue(target.value.entry_slug)}
                                    onValueChange={(nextValue) =>
                                        onChange({
                                            ...target,
                                            value: {
                                                ...target.value,
                                                entry_slug:
                                                    nextValue === '__none__'
                                                        ? null
                                                        : nextValue,
                                            },
                                        })
                                    }
                                >
                                    <SelectTrigger
                                        id={`${idPrefix}-entry-slug`}
                                        className="w-full"
                                    >
                                        <SelectValue placeholder="Choose an entry" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(target.value.kind === 'dictionary_entry'
                                            ? effectiveOptions.dictionary_entries
                                            : target.value.kind === 'topic'
                                              ? effectiveOptions.topics
                                              : effectiveOptions.characters
                                        ).map((entry) => (
                                            <SelectItem
                                                key={entry.slug}
                                                value={entry.slug}
                                            >
                                                {entry.title}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            ) : (
                                <Input
                                    id={`${idPrefix}-entry-slug`}
                                    value={target.value.entry_slug ?? ''}
                                    onChange={(event) =>
                                        onChange({
                                            ...target,
                                            value: {
                                                ...target.value,
                                                entry_slug: event.target.value,
                                            },
                                        })
                                    }
                                    placeholder={
                                        target.value.kind === 'dictionary_entry'
                                            ? 'dharma'
                                            : target.value.kind === 'topic'
                                              ? 'karma-yoga'
                                              : 'arjuna'
                                    }
                                />
                            )}
                            <InputError message={errors.entry_slug} />
                        </div>
                    )}

                    <div className="rounded-2xl border border-border/70 bg-background px-4 py-4">
                        <p className="text-xs leading-5 text-muted-foreground">
                            For deeper scripture targets, you can still paste a
                            full internal path above to fill the structured
                            fields quickly.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
