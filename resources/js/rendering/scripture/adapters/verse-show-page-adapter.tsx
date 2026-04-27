import { Link } from '@inertiajs/react';
import {
    BookOpenText,
    Headphones,
    Languages,
    MessageSquareQuote,
    ScrollText,
    Sparkles,
    Tags,
    Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    createCompactListSection,
    createPaperPanelSection,
    type UniversalSectionDescriptor,
} from '@/rendering/core';
import { createScriptureIntroTextSection } from '@/rendering/scripture/scripture-section-descriptors';
import { chapterLabel, sectionLabel, verseLabel } from '@/lib/scripture';
import type { AdminSurfaceContract } from '@/admin/surfaces/core/surface-contracts';
import type {
    BreadcrumbItem,
    ScriptureEntityRegionInput,
    ScriptureVerse,
    VerseShowProps,
} from '@/types';

const getStringList = (values: unknown[] | null): string[] => {
    if (!Array.isArray(values)) {
        return [];
    }

    return values
        .filter(
            (value): value is string =>
                typeof value === 'string' && value.trim().length > 0,
        )
        .map((value) => value.trim());
};

export const verseNavLabel = (verse: ScriptureVerse): string =>
    verseLabel(verse.number);

export function buildVerseShowDescriptorModel({
    book,
    bookSection,
    chapter,
    chapterSection,
    verse,
    translations,
    commentaries,
    verseMeta,
    dictionaryTerms,
    recitations,
    topics,
    characters,
    cmsRegions,
    showAdminControls,
    verseIntroSurface,
    verseMetaSurface,
}: {
    book: VerseShowProps['book'];
    bookSection: VerseShowProps['book_section'];
    chapter: VerseShowProps['chapter'];
    chapterSection: VerseShowProps['chapter_section'];
    verse: VerseShowProps['verse'];
    translations: VerseShowProps['translations'];
    commentaries: VerseShowProps['commentaries'];
    verseMeta: VerseShowProps['verse_meta'];
    dictionaryTerms: VerseShowProps['dictionary_terms'];
    recitations: VerseShowProps['recitations'];
    topics: VerseShowProps['topics'];
    characters: VerseShowProps['characters'];
    cmsRegions: NonNullable<VerseShowProps['cms_regions']>;
    showAdminControls: boolean;
    verseIntroSurface?: AdminSurfaceContract | null;
    verseMetaSurface?: AdminSurfaceContract | null;
}) {
    const universalCmsRegion = cmsRegions[0] ?? null;
    const shouldShowUniversalCmsRegion =
        universalCmsRegion !== null &&
        (universalCmsRegion.containers.length > 0 ||
            (showAdminControls && universalCmsRegion.admin !== null));
    const chapterTitle = chapterLabel(chapter.number, chapter.title);
    const bookSectionTitle = sectionLabel(
        bookSection.number,
        bookSection.title,
    );
    const chapterSectionTitle = sectionLabel(
        chapterSection.number,
        chapterSection.title,
    );
    const verseTitle = verseLabel(verse.number);
    const referenceTitle = verse.number
        ? `${chapterTitle}:${verse.number}`
        : `${chapterTitle} ${verseTitle}`;
    const verseEntity: ScriptureEntityRegionInput = {
        entityType: 'verse',
        entityId: verse.id,
        entityLabel: verseTitle,
        parentEntityType: 'chapter_section',
        parentEntityId: chapterSection.id,
        region: 'page_intro',
        capabilityHint: 'intro',
    };
    const supportEntity = {
        entityType: 'verse' as const,
        entityId: verse.id,
        entityLabel: verseTitle,
        parentEntityType: 'chapter_section' as const,
        parentEntityId: chapterSection.id,
    };
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: book.title,
            href: book.href,
        },
        {
            title: bookSectionTitle,
            href: bookSection.href,
        },
        {
            title: chapterTitle,
            href: chapter.href,
        },
        {
            title: chapterSectionTitle,
            href: chapterSection.href,
        },
        {
            title: verseTitle,
            href: verse.href ?? chapter.href,
        },
    ];
    const metaBadges = [
        verseMeta?.is_featured ? 'Featured' : null,
        verseMeta?.difficulty_level ?? null,
        verseMeta?.teaching_mode ?? null,
        verseMeta?.narrative_phase ?? null,
        verseMeta?.scene_location ?? null,
        verseMeta && verseMeta.memorization_priority > 0
            ? `Memorization ${verseMeta.memorization_priority}`
            : null,
    ].filter((value): value is string => value !== null);
    const keywords = getStringList(verseMeta?.keywords_json ?? null);
    const studyFlags = getStringList(verseMeta?.study_flags_json ?? null);
    const hasVerseMeta =
        verseMeta !== null &&
        (metaBadges.length > 0 ||
            verseMeta.summary_short !== null ||
            keywords.length > 0 ||
            studyFlags.length > 0);
    const hasCompanionSections =
        hasVerseMeta ||
        dictionaryTerms.length > 0 ||
        recitations.length > 0 ||
        topics.length > 0 ||
        characters.length > 0 ||
        verseMetaSurface !== null;
    const railSections: UniversalSectionDescriptor[] = [
        createCompactListSection({
            id: 'verse-context',
            content: {
                title: 'Verse Context',
                items: [
                    {
                        label: book.title,
                        meta: 'Book',
                        icon: BookOpenText,
                        href: book.href,
                    },
                    {
                        label: chapterTitle,
                        meta: 'Chapter',
                        icon: ScrollText,
                        href: chapter.href,
                    },
                    {
                        label: chapterSectionTitle,
                        meta: 'Section',
                        icon: Sparkles,
                        href: chapterSection.href,
                    },
                ],
            },
        }),
        createPaperPanelSection({
            id: 'verse-reading-actions',
            content: {
                eyebrow: 'Reading Actions',
                children: (
                    <div className="flex flex-col gap-2">
                        <Button
                            asChild
                            variant="outline"
                            className="chronicle-button-outline justify-start rounded-sm"
                        >
                            <Link href={chapterSection.href}>
                                Back to verse list
                            </Link>
                        </Button>
                        <Button
                            asChild
                            variant="outline"
                            className="chronicle-button-outline justify-start rounded-sm"
                        >
                            <Link href={bookSection.href}>
                                Back to chapter list
                            </Link>
                        </Button>
                    </div>
                ),
            },
        }),
    ];

    if (
        dictionaryTerms.length > 0 ||
        topics.length > 0 ||
        characters.length > 0
    ) {
        railSections.push(
            createCompactListSection({
                id: 'verse-study-companion',
                content: {
                    eyebrow: 'Study Companion',
                    items: [
                        ...(dictionaryTerms.length > 0
                            ? [
                                  {
                                      label: 'Dictionary terms',
                                      meta: dictionaryTerms.length,
                                      icon: Tags,
                                  },
                              ]
                            : []),
                        ...(topics.length > 0
                            ? [
                                  {
                                      label: 'Related topics',
                                      meta: topics.length,
                                      icon: Sparkles,
                                  },
                              ]
                            : []),
                        ...(characters.length > 0
                            ? [
                                  {
                                      label: 'Characters',
                                      meta: characters.length,
                                      icon: Users,
                                  },
                              ]
                            : []),
                    ],
                },
            }),
        );
    }

    if (recitations.length > 0) {
        railSections.push(
            createCompactListSection({
                id: 'verse-recitations',
                content: {
                    eyebrow: 'Recitations / Listen',
                    items: recitations.slice(0, 4).map((item) => ({
                        label: item.reciter_name,
                        meta: item.language_code ?? item.style ?? 'Audio',
                        icon: Headphones,
                    })),
                },
            }),
        );
    }

    railSections.push(
        createCompactListSection({
            id: 'verse-reference-material',
            content: {
                eyebrow: 'Reference Material',
                items: [
                    {
                        label: 'Translations',
                        meta: translations.length,
                        icon: Languages,
                    },
                    {
                        label: 'Commentaries',
                        meta: commentaries.length,
                        icon: MessageSquareQuote,
                    },
                    {
                        label: 'Study notes',
                        meta: hasVerseMeta ? 'Ready' : 'Soon',
                        icon: Sparkles,
                    },
                ],
            },
        }),
    );

    return {
        universalCmsRegion,
        shouldShowUniversalCmsRegion,
        chapterTitle,
        chapterSectionTitle,
        verseTitle,
        referenceTitle,
        verseEntity,
        supportEntity,
        breadcrumbs,
        metaBadges,
        keywords,
        studyFlags,
        hasVerseMeta,
        hasCompanionSections,
        mainRenderContext: {
            page: {
                pageKey: 'scripture.chapters.verses.show.main',
                title: `${verseTitle} - ${chapterTitle}`,
                breadcrumbs,
                layout: 'scripture' as const,
            },
        },
        railRenderContext: {
            page: {
                pageKey: 'scripture.chapters.verses.show.rail',
                title: `${verseTitle} - ${chapterTitle}`,
                breadcrumbs,
                layout: 'scripture' as const,
            },
        },
        introSections: [
            createScriptureIntroTextSection({
                id: 'verse-introduction',
                label: 'Verse Introduction',
                block: verse.intro_block,
                adminSurface: verseIntroSurface,
                variant: 'header',
                className: 'text-left',
            }),
        ],
        railSections,
    };
}
