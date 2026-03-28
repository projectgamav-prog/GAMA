import { Link } from '@inertiajs/react';
import {
    ArrowLeft,
    ArrowRight,
    BookOpenText,
    Headphones,
    Languages,
    MessageSquareQuote,
    Sparkles,
    Tag,
    Users,
} from 'lucide-react';
import { AdminModuleHost } from '@/admin/core/AdminModuleHost';
import {
    resolveVerseHeaderSurfaces,
} from '@/admin/integrations/scripture/verses';
import { ScriptureActionRow } from '@/components/scripture/scripture-action-row';
import { ScriptureAdminModeBar } from '@/components/scripture/scripture-admin-mode-bar';
import { ScriptureEntityRegion } from '@/components/scripture/scripture-entity-region';
import { ScripturePageIntroCard } from '@/components/scripture/scripture-page-intro-card';
import { ScriptureSection } from '@/components/scripture/scripture-section';
import { ScriptureVerseContentBlockRegion } from '@/components/scripture/scripture-verse-content-block-region';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useVisibleAdminControls } from '@/hooks/use-admin-context';
import ScriptureLayout from '@/layouts/scripture-layout';
import { chapterLabel, sectionLabel, verseLabel } from '@/lib/scripture';
import { cn } from '@/lib/utils';
import type { BreadcrumbItem, VerseShowProps } from '@/types';

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

export default function VerseShow({
    book,
    book_section,
    chapter,
    chapter_section,
    verse,
    previous_verse,
    next_verse,
    translations,
    commentaries,
    verse_meta,
    dictionary_terms,
    recitations,
    topics,
    characters,
    content_blocks,
    isAdmin,
    admin,
}: VerseShowProps) {
    const adminPanelClassName =
        'flex flex-wrap items-center gap-2 rounded-2xl border border-border/70 bg-muted/20 p-3';
    const showAdminControls = useVisibleAdminControls();
    const chapterTitle = chapterLabel(chapter.number, chapter.title);
    const bookSectionTitle = sectionLabel(
        book_section.number,
        book_section.title,
    );
    const chapterSectionTitle = sectionLabel(
        chapter_section.number,
        chapter_section.title,
    );
    const verseTitle = verseLabel(verse.number);
    const verseEntity = {
        entityType: 'verse' as const,
        entityId: verse.id,
        entityLabel: verseTitle,
        parentEntityType: 'chapter_section' as const,
        parentEntityId: chapter_section.id,
    };

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: book.title,
            href: book.href,
        },
        {
            title: bookSectionTitle,
            href: book_section.href,
        },
        {
            title: chapterTitle,
            href: chapter.href,
        },
        {
            title: chapterSectionTitle,
            href: chapter_section.href,
        },
        {
            title: verseTitle,
            href: chapter.href,
        },
    ];
    const metaBadges = [
        verse_meta?.is_featured ? 'Featured' : null,
        verse_meta?.difficulty_level ?? null,
        verse_meta?.teaching_mode ?? null,
        verse_meta?.narrative_phase ?? null,
        verse_meta?.scene_location ?? null,
        verse_meta && verse_meta.memorization_priority > 0
            ? `Memorization ${verse_meta.memorization_priority}`
            : null,
    ].filter((value): value is string => value !== null);
    const keywords = getStringList(verse_meta?.keywords_json ?? null);
    const studyFlags = getStringList(verse_meta?.study_flags_json ?? null);
    const hasVerseMeta =
        verse_meta !== null &&
        (metaBadges.length > 0 ||
            verse_meta.summary_short !== null ||
            keywords.length > 0 ||
            studyFlags.length > 0);
    const {
        introSurface: verseIntroSurface,
        metaSurface: verseNotesSurface,
    } = resolveVerseHeaderSurfaces({
        verse,
        verseMeta: verse_meta,
        characters,
        admin,
        enabled: showAdminControls,
    });
    const hasCompanionSections =
        hasVerseMeta ||
        dictionary_terms.length > 0 ||
        recitations.length > 0 ||
        topics.length > 0 ||
        characters.length > 0 ||
        verseNotesSurface !== null;
    const formatDuration = (durationSeconds: number | null): string | null => {
        if (durationSeconds === null || durationSeconds < 0) {
            return null;
        }

        const hours = Math.floor(durationSeconds / 3600);
        const minutes = Math.floor((durationSeconds % 3600) / 60);
        const seconds = durationSeconds % 60;

        if (hours > 0) {
            return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        }

        return `${minutes}:${String(seconds).padStart(2, '0')}`;
    };

    return (
        <ScriptureLayout
            title={`${verseTitle} - ${chapterTitle}`}
            breadcrumbs={breadcrumbs}
        >
            <ScriptureAdminModeBar />

            <ScripturePageIntroCard
                entityMeta={{
                    ...verseEntity,
                    region: 'verse_intro',
                    capabilityHint: 'intro',
                }}
                className="overflow-hidden"
                badges={
                    <>
                        <Badge variant="outline">Verse Details</Badge>
                        <Badge variant="secondary">{book.title}</Badge>
                        <Badge variant="secondary">{bookSectionTitle}</Badge>
                        <Badge variant="secondary">{chapterSectionTitle}</Badge>
                        <Badge variant="secondary">{verseTitle}</Badge>
                    </>
                }
                title={verseTitle}
                titleClassName="text-3xl sm:text-4xl"
                description={`${chapterTitle}. Read the canonical verse first, then move through translations, commentary, and attached study references in a calmer reading flow.`}
                contentClassName="space-y-6"
            >
                {verseIntroSurface && (
                    <AdminModuleHost
                        surface={verseIntroSurface}
                        className={adminPanelClassName}
                    />
                )}

                <div className="rounded-2xl border border-border/70 bg-muted/20 px-5 py-5 sm:px-6 sm:py-6">
                    <p className="text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">
                        Canonical Verse
                    </p>
                    <p className="mt-4 text-xl leading-10 sm:text-2xl sm:leading-[3rem]">
                        {verse.text}
                    </p>
                </div>

                <Separator />

                <ScriptureActionRow>
                    {previous_verse && (
                        <Button asChild variant="outline">
                            <Link href={previous_verse.href}>
                                <ArrowLeft className="size-4" />
                                Previous Verse
                            </Link>
                        </Button>
                    )}
                    {next_verse && (
                        <Button asChild>
                            <Link href={next_verse.href}>
                                Next Verse
                                <ArrowRight className="size-4" />
                            </Link>
                        </Button>
                    )}
                    <Button asChild variant="outline">
                        <Link href={chapter.verses_href ?? chapter.href}>
                            <ArrowLeft className="size-4" />
                            Back to Reader
                        </Link>
                    </Button>
                    <Button asChild variant="outline">
                        <Link href={chapter.href}>
                            <BookOpenText className="size-4" />
                            Back to Chapter
                        </Link>
                    </Button>
                </ScriptureActionRow>
            </ScripturePageIntroCard>

            {hasCompanionSections && (
                <ScriptureSection
                    entityMeta={{
                        ...verseEntity,
                        region: 'study_companion',
                        capabilityHint: 'relationships',
                    }}
                    title="Study Companion"
                    description="Supporting metadata and reference material grouped separately from the main reading flow."
                >
                    <div className="grid gap-4 xl:grid-cols-2">
                        {(hasVerseMeta || verseNotesSurface) && (
                            <ScriptureEntityRegion
                                meta={{
                                    ...verseEntity,
                                    region: 'verse_notes',
                                    capabilityHint: 'relationships',
                                }}
                                asChild
                            >
                                <Card>
                                    <CardHeader className="gap-3">
                                        <CardTitle className="flex items-center gap-2 text-xl">
                                            <Sparkles className="size-5" />
                                            Study Notes
                                        </CardTitle>
                                        <CardDescription>
                                            Compact verse-level study metadata
                                            and editorial cues.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-5">
                                        {verseNotesSurface && (
                                            <AdminModuleHost
                                                surface={verseNotesSurface}
                                                className={
                                                    adminPanelClassName
                                                }
                                            />
                                        )}

                                        {verse_meta?.summary_short && (
                                            <div className="rounded-xl bg-muted/30 px-4 py-4">
                                                <p className="text-sm leading-7">
                                                    {verse_meta.summary_short}
                                                </p>
                                            </div>
                                        )}

                                        {metaBadges.length > 0 && (
                                            <div className="space-y-2">
                                                <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                                                    Verse Metadata
                                                </p>
                                                <div className="flex flex-wrap gap-2">
                                                    {metaBadges.map((item) => (
                                                        <Badge
                                                            key={item}
                                                            variant="outline"
                                                        >
                                                            {item}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {keywords.length > 0 && (
                                            <div className="space-y-2">
                                                <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                                                    Keywords
                                                </p>
                                                <div className="flex flex-wrap gap-2">
                                                    {keywords.map(
                                                        (keyword) => (
                                                            <Badge
                                                                key={keyword}
                                                                variant="secondary"
                                                            >
                                                                {keyword}
                                                            </Badge>
                                                        ),
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {studyFlags.length > 0 && (
                                            <div className="space-y-2">
                                                <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                                                    Study Flags
                                                </p>
                                                <div className="flex flex-wrap gap-2">
                                                    {studyFlags.map((flag) => (
                                                        <Badge
                                                            key={flag}
                                                            variant="outline"
                                                        >
                                                            {flag}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </ScriptureEntityRegion>
                        )}

                        {dictionary_terms.length > 0 && (
                            <ScriptureEntityRegion
                                meta={{
                                    ...verseEntity,
                                    region: 'dictionary_terms',
                                    capabilityHint: 'relationships',
                                }}
                                asChild
                            >
                                <Card>
                                    <CardHeader className="gap-3">
                                        <CardTitle className="flex items-center gap-2 text-xl">
                                            <Tag className="size-5" />
                                            Dictionary Terms
                                        </CardTitle>
                                        <CardDescription>
                                            Linked study terms matched to this
                                            verse.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {dictionary_terms.map((term, index) => {
                                            const termLabel =
                                                term.dictionary_entry
                                                    ?.headword ??
                                                term.matched_text ??
                                                'Untitled term';
                                            const matchedText =
                                                term.matched_text &&
                                                term.matched_text !== termLabel
                                                    ? term.matched_text
                                                    : null;

                                            return (
                                                <ScriptureEntityRegion
                                                    key={term.id}
                                                    meta={{
                                                        entityType:
                                                            'verse_dictionary_term',
                                                        entityId: term.id,
                                                        entityLabel: termLabel,
                                                        region: 'dictionary_term',
                                                        capabilityHint:
                                                            'relationships',
                                                    }}
                                                    asChild
                                                >
                                                    <div
                                                        className={cn(
                                                            'space-y-3',
                                                            index > 0 &&
                                                                'border-t pt-4',
                                                        )}
                                                    >
                                                        <div className="space-y-1">
                                                            {term
                                                                .dictionary_entry
                                                                ?.href ? (
                                                                <Link
                                                                    href={
                                                                        term
                                                                            .dictionary_entry
                                                                            .href
                                                                    }
                                                                    className="inline-flex leading-none font-medium underline-offset-4 hover:text-primary hover:underline"
                                                                >
                                                                    {termLabel}
                                                                </Link>
                                                            ) : (
                                                                <p className="leading-none font-medium">
                                                                    {termLabel}
                                                                </p>
                                                            )}
                                                            {term
                                                                .dictionary_entry
                                                                ?.transliteration && (
                                                                <p className="text-sm text-muted-foreground">
                                                                    {
                                                                        term
                                                                            .dictionary_entry
                                                                            .transliteration
                                                                    }
                                                                </p>
                                                            )}
                                                        </div>
                                                        <div className="flex flex-wrap gap-2">
                                                            {term.language_code && (
                                                                <Badge variant="outline">
                                                                    {
                                                                        term.language_code
                                                                    }
                                                                </Badge>
                                                            )}
                                                            <Badge variant="secondary">
                                                                {
                                                                    term.match_type
                                                                }
                                                            </Badge>
                                                        </div>
                                                        {matchedText && (
                                                            <p className="text-sm text-muted-foreground">
                                                                Matched in
                                                                verse:{' '}
                                                                {matchedText}
                                                            </p>
                                                        )}
                                                        {term.dictionary_entry
                                                            ?.short_meaning && (
                                                            <p className="text-sm leading-6 text-muted-foreground">
                                                                {
                                                                    term
                                                                        .dictionary_entry
                                                                        .short_meaning
                                                                }
                                                            </p>
                                                        )}
                                                    </div>
                                                </ScriptureEntityRegion>
                                            );
                                        })}
                                    </CardContent>
                                </Card>
                            </ScriptureEntityRegion>
                        )}

                        {recitations.length > 0 && (
                            <ScriptureEntityRegion
                                meta={{
                                    ...verseEntity,
                                    region: 'recitations',
                                    capabilityHint: 'relationships',
                                }}
                                asChild
                            >
                                <Card>
                                    <CardHeader className="gap-3">
                                        <CardTitle className="flex items-center gap-2 text-xl">
                                            <Headphones className="size-5" />
                                            Recitations
                                        </CardTitle>
                                        <CardDescription>
                                            Available listening variants for
                                            this verse.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {recitations.map(
                                            (recitation, index) => {
                                                const mediaHref =
                                                    recitation.media?.url ??
                                                    recitation.media?.path ??
                                                    null;
                                                const durationLabel =
                                                    formatDuration(
                                                        recitation.duration_seconds,
                                                    );

                                                return (
                                                    <ScriptureEntityRegion
                                                        key={recitation.id}
                                                        meta={{
                                                            entityType:
                                                                'verse_recitation',
                                                            entityId:
                                                                recitation.id,
                                                            entityLabel:
                                                                recitation.reciter_name,
                                                            region: 'recitation',
                                                            capabilityHint:
                                                                'relationships',
                                                        }}
                                                        asChild
                                                    >
                                                        <div
                                                            className={cn(
                                                                'space-y-3',
                                                                index > 0 &&
                                                                    'border-t pt-4',
                                                            )}
                                                        >
                                                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                                                <div className="space-y-2">
                                                                    <div className="flex flex-wrap items-center gap-2">
                                                                        <span className="font-medium">
                                                                            {
                                                                                recitation.reciter_name
                                                                            }
                                                                        </span>
                                                                        {recitation.language_code && (
                                                                            <Badge variant="outline">
                                                                                {
                                                                                    recitation.language_code
                                                                                }
                                                                            </Badge>
                                                                        )}
                                                                        {recitation.style && (
                                                                            <Badge variant="secondary">
                                                                                {
                                                                                    recitation.style
                                                                                }
                                                                            </Badge>
                                                                        )}
                                                                        {durationLabel && (
                                                                            <Badge variant="outline">
                                                                                {
                                                                                    durationLabel
                                                                                }
                                                                            </Badge>
                                                                        )}
                                                                    </div>
                                                                    {recitation
                                                                        .media
                                                                        ?.title && (
                                                                        <p className="text-sm text-muted-foreground">
                                                                            {
                                                                                recitation
                                                                                    .media
                                                                                    .title
                                                                            }
                                                                        </p>
                                                                    )}
                                                                </div>
                                                                {mediaHref && (
                                                                    <Button
                                                                        asChild
                                                                        size="sm"
                                                                        variant="outline"
                                                                    >
                                                                        <a
                                                                            href={
                                                                                mediaHref
                                                                            }
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                        >
                                                                            Listen
                                                                        </a>
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </ScriptureEntityRegion>
                                                );
                                            },
                                        )}
                                    </CardContent>
                                </Card>
                            </ScriptureEntityRegion>
                        )}

                        {topics.length > 0 && (
                            <ScriptureEntityRegion
                                meta={{
                                    ...verseEntity,
                                    region: 'related_topics',
                                    capabilityHint: 'relationships',
                                }}
                                asChild
                            >
                                <Card>
                                    <CardHeader className="gap-3">
                                        <CardTitle className="flex items-center gap-2 text-xl">
                                            <Tag className="size-5" />
                                            Related Topics
                                        </CardTitle>
                                        <CardDescription>
                                            Editorial topic links associated
                                            with this verse.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {topics.map((assignment, index) => (
                                            <ScriptureEntityRegion
                                                key={assignment.id}
                                                meta={{
                                                    entityType:
                                                        'verse_topic_assignment',
                                                    entityId: assignment.id,
                                                    entityLabel:
                                                        assignment.topic?.name ??
                                                        'Untitled topic',
                                                    region: 'topic_assignment',
                                                    capabilityHint:
                                                        'relationships',
                                                }}
                                                asChild
                                            >
                                                <div
                                                    className={cn(
                                                        'space-y-2',
                                                        index > 0 &&
                                                            'border-t pt-4',
                                                    )}
                                                >
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        {assignment.topic
                                                            ?.href ? (
                                                            <Link
                                                                href={
                                                                    assignment
                                                                        .topic
                                                                        .href
                                                                }
                                                                className="font-medium underline-offset-4 hover:text-primary hover:underline"
                                                            >
                                                                {
                                                                    assignment
                                                                        .topic
                                                                        .name
                                                                }
                                                            </Link>
                                                        ) : (
                                                            <span className="font-medium">
                                                                {assignment
                                                                    .topic
                                                                    ?.name ??
                                                                    'Untitled topic'}
                                                            </span>
                                                        )}
                                                        {assignment.weight !==
                                                            null && (
                                                            <Badge variant="outline">
                                                                Weight{' '}
                                                                {
                                                                    assignment.weight
                                                                }
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    {assignment.notes && (
                                                        <p className="text-sm leading-6 text-muted-foreground">
                                                            {assignment.notes}
                                                        </p>
                                                    )}
                                                </div>
                                            </ScriptureEntityRegion>
                                        ))}
                                    </CardContent>
                                </Card>
                            </ScriptureEntityRegion>
                        )}

                        {characters.length > 0 && (
                            <ScriptureEntityRegion
                                meta={{
                                    ...verseEntity,
                                    region: 'related_characters',
                                    capabilityHint: 'relationships',
                                }}
                                asChild
                            >
                                <Card>
                                    <CardHeader className="gap-3">
                                        <CardTitle className="flex items-center gap-2 text-xl">
                                            <Users className="size-5" />
                                            Related Characters
                                        </CardTitle>
                                        <CardDescription>
                                            Character associations attached to
                                            this verse.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {characters.map((assignment, index) => (
                                            <ScriptureEntityRegion
                                                key={assignment.id}
                                                meta={{
                                                    entityType:
                                                        'verse_character_assignment',
                                                    entityId: assignment.id,
                                                    entityLabel:
                                                        assignment.character
                                                            ?.name ??
                                                        'Untitled character',
                                                    region: 'character_assignment',
                                                    capabilityHint:
                                                        'relationships',
                                                }}
                                                asChild
                                            >
                                                <div
                                                    className={cn(
                                                        'space-y-2',
                                                        index > 0 &&
                                                            'border-t pt-4',
                                                    )}
                                                >
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        {assignment.character
                                                            ?.href ? (
                                                            <Link
                                                                href={
                                                                    assignment
                                                                        .character
                                                                        .href
                                                                }
                                                                className="font-medium underline-offset-4 hover:text-primary hover:underline"
                                                            >
                                                                {
                                                                    assignment
                                                                        .character
                                                                        .name
                                                                }
                                                            </Link>
                                                        ) : (
                                                            <span className="font-medium">
                                                                {assignment
                                                                    .character
                                                                    ?.name ??
                                                                    'Untitled character'}
                                                            </span>
                                                        )}
                                                        {assignment.weight !==
                                                            null && (
                                                            <Badge variant="outline">
                                                                Weight{' '}
                                                                {
                                                                    assignment.weight
                                                                }
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    {assignment.notes && (
                                                        <p className="text-sm leading-6 text-muted-foreground">
                                                            {assignment.notes}
                                                        </p>
                                                    )}
                                                </div>
                                            </ScriptureEntityRegion>
                                        ))}
                                    </CardContent>
                                </Card>
                            </ScriptureEntityRegion>
                        )}
                    </div>
                </ScriptureSection>
            )}

            {translations.length > 0 && (
                <ScriptureSection
                    entityMeta={{
                        ...verseEntity,
                        region: 'translations',
                        capabilityHint: 'translation',
                    }}
                    title="Translations"
                    description="Supporting translations for this verse, kept separate from the canonical text above."
                    icon={Languages}
                    action={
                        <Badge variant="outline">
                            {translations.length} translation
                            {translations.length === 1 ? '' : 's'}
                        </Badge>
                    }
                >
                    <div className="space-y-4">
                        {translations.map((translation) => (
                            <ScriptureEntityRegion
                                key={translation.id}
                                meta={{
                                    entityType: 'verse_translation',
                                    entityId: translation.id,
                                    entityLabel: translation.source_name,
                                    region: 'translation_card',
                                    capabilityHint: 'translation',
                                }}
                                asChild
                            >
                                <Card className="overflow-hidden">
                                    <CardHeader className="gap-3 border-b bg-muted/20">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <Badge variant="outline">
                                                {translation.language_code}
                                            </Badge>
                                            <Badge variant="secondary">
                                                {translation.source_name}
                                            </Badge>
                                        </div>
                                        <CardTitle className="text-xl">
                                            {translation.source_name}
                                        </CardTitle>
                                        <CardDescription>
                                            Source key: {translation.source_key}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="pt-6">
                                        <p className="leading-8">
                                            {translation.text}
                                        </p>
                                    </CardContent>
                                </Card>
                            </ScriptureEntityRegion>
                        ))}
                    </div>
                </ScriptureSection>
            )}

            {commentaries.length > 0 && (
                <ScriptureSection
                    entityMeta={{
                        ...verseEntity,
                        region: 'commentaries',
                        capabilityHint: 'commentary',
                    }}
                    title="Commentaries"
                    description="Editorial commentary and source material attached directly to this verse."
                    icon={MessageSquareQuote}
                    action={
                        <Badge variant="outline">
                            {commentaries.length} commentary
                            {commentaries.length === 1 ? '' : 's'}
                        </Badge>
                    }
                >
                    <div className="space-y-4">
                        {commentaries.map((commentary) => (
                            <ScriptureEntityRegion
                                key={commentary.id}
                                meta={{
                                    entityType: 'verse_commentary',
                                    entityId: commentary.id,
                                    entityLabel:
                                        commentary.title ??
                                        commentary.source_name,
                                    region: 'commentary_card',
                                    capabilityHint: 'commentary',
                                }}
                                asChild
                            >
                                <Card className="overflow-hidden">
                                    <CardHeader className="gap-3 border-b bg-muted/20">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <Badge variant="outline">
                                                {commentary.language_code}
                                            </Badge>
                                            <Badge variant="secondary">
                                                {commentary.author_name ??
                                                    commentary.source_name}
                                            </Badge>
                                        </div>
                                        <CardTitle className="text-xl">
                                            {commentary.title ??
                                                commentary.source_name}
                                        </CardTitle>
                                        <CardDescription>
                                            <span>{commentary.source_name}</span>
                                            {commentary.source_key && (
                                                <span>
                                                    {' '}
                                                    - Source key:{' '}
                                                    {commentary.source_key}
                                                </span>
                                            )}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4 pt-6">
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <MessageSquareQuote className="size-4" />
                                            <span>Commentary</span>
                                        </div>
                                        <p className="leading-8">
                                            {commentary.body}
                                        </p>
                                    </CardContent>
                                </Card>
                            </ScriptureEntityRegion>
                        ))}
                    </div>
                </ScriptureSection>
            )}

            <ScriptureVerseContentBlockRegion
                verse={verse}
                verseTitle={verseTitle}
                blocks={content_blocks}
                showAdminControls={showAdminControls}
                admin={admin}
            />
        </ScriptureLayout>
    );
}

