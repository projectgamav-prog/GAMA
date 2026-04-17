import { AdminModuleHostGroup } from '@/admin/core/AdminModuleHostGroup';
import {
    resolveVerseHeaderSurfaces,
    resolveVerseRelationSurfaces,
} from '@/admin/integrations/scripture/verses';
import { ScriptureIntroBlock } from '@/components/scripture/scripture-intro-block';
import { ScripturePageIntroCard } from '@/components/scripture/scripture-page-intro-card';
import { ScriptureReadingNavigationActions } from '@/components/scripture/scripture-reading-navigation-actions';
import { ScriptureSection } from '@/components/scripture/scripture-section';
import { VerseCharactersSection } from '@/components/scripture/verse/VerseCharactersSection';
import { VerseCommentariesSection } from '@/components/scripture/verse/VerseCommentariesSection';
import { VerseDictionaryTermsSection } from '@/components/scripture/verse/VerseDictionaryTermsSection';
import { VerseRecitationsSection } from '@/components/scripture/verse/VerseRecitationsSection';
import { VerseStudyNotesSection } from '@/components/scripture/verse/VerseStudyNotesSection';
import { VerseSupplementaryCmsSection } from '@/components/scripture/verse/VerseSupplementaryCmsSection';
import { VerseTopicsSection } from '@/components/scripture/verse/VerseTopicsSection';
import { VerseTranslationsSection } from '@/components/scripture/verse/VerseTranslationsSection';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useVisibleAdminControls } from '@/hooks/use-admin-context';
import ScriptureLayout from '@/layouts/scripture-layout';
import { chapterLabel, sectionLabel, verseLabel } from '@/lib/scripture';
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
    cms_regions = [],
    admin,
}: VerseShowProps) {
    const showAdminControls = useVisibleAdminControls();
    const universalCmsRegion = cms_regions[0] ?? null;
    const shouldShowUniversalCmsRegion =
        universalCmsRegion !== null &&
        (universalCmsRegion.containers.length > 0 ||
            (showAdminControls && universalCmsRegion.admin !== null));
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
        identitySurface: verseIdentitySurface,
        introSurface: verseIntroSurface,
        metaSurface: verseMetaSurface,
    } = resolveVerseHeaderSurfaces({
        verse,
        verseTitle,
        verseMeta: verse_meta,
        characters,
        admin,
        enabled: showAdminControls,
    });
    const {
        translationsSurface,
        commentariesSurface,
    } = resolveVerseRelationSurfaces({
        verse,
        verseTitle,
        translationsAdmin: admin?.translations,
        commentariesAdmin: admin?.commentaries,
        fullEditHref: admin?.full_edit_href ?? null,
        enabled: showAdminControls,
    });
    const hasCompanionSections =
        hasVerseMeta ||
        dictionary_terms.length > 0 ||
        recitations.length > 0 ||
        topics.length > 0 ||
        characters.length > 0 ||
        verseMetaSurface !== null;
    return (
        <ScriptureLayout
            title={`${verseTitle} - ${chapterTitle}`}
            breadcrumbs={breadcrumbs}
        >
            <ScripturePageIntroCard
                entityMeta={{
                    ...verseEntity,
                    region: 'page_intro',
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
                <AdminModuleHostGroup
                    surfaces={[verseIdentitySurface, verseIntroSurface]}
                />

                <ScriptureIntroBlock
                    label="Verse Introduction"
                    block={verse.intro_block}
                />

                <div className="rounded-2xl border border-border/70 bg-muted/20 px-5 py-5 sm:px-6 sm:py-6">
                    <p className="text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">
                        Canonical Verse
                    </p>
                    <p className="mt-4 text-xl leading-10 sm:text-2xl sm:leading-[3rem]">
                        {verse.text}
                    </p>
                </div>

                <Separator />

                <ScriptureReadingNavigationActions
                    actions={[
                        ...(previous_verse
                            ? [
                                  {
                                      actionKey: 'go_to_previous_verse' as const,
                                      href: previous_verse.href,
                                  },
                              ]
                            : []),
                        ...(next_verse
                            ? [
                                  {
                                      actionKey: 'go_to_next_verse' as const,
                                      href: next_verse.href,
                                  },
                              ]
                            : []),
                        {
                            actionKey: 'back_to_verse_list' as const,
                            href: chapter_section.href,
                        },
                        {
                            actionKey: 'back_to_chapter_list' as const,
                            href: book_section.href,
                        },
                    ]}
                />
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
                        {(hasVerseMeta || verseMetaSurface) && (
                            <VerseStudyNotesSection
                                entityMeta={verseEntity}
                                verseMeta={verse_meta}
                                metaBadges={metaBadges}
                                keywords={keywords}
                                studyFlags={studyFlags}
                                verseMetaSurface={verseMetaSurface}
                            />
                        )}

                        {dictionary_terms.length > 0 && (
                            <VerseDictionaryTermsSection
                                entityMeta={verseEntity}
                                dictionaryTerms={dictionary_terms}
                            />
                        )}

                        {recitations.length > 0 && (
                            <VerseRecitationsSection
                                entityMeta={verseEntity}
                                recitations={recitations}
                            />
                        )}

                        {topics.length > 0 && (
                            <VerseTopicsSection
                                entityMeta={verseEntity}
                                topics={topics}
                            />
                        )}

                        {characters.length > 0 && (
                            <VerseCharactersSection
                                entityMeta={verseEntity}
                                characters={characters}
                            />
                        )}
                    </div>
                </ScriptureSection>
            )}

            {(translations.length > 0 || translationsSurface) && (
                <VerseTranslationsSection
                    entityMeta={verseEntity}
                    translations={translations}
                    translationsSurface={translationsSurface}
                />
            )}

            {(commentaries.length > 0 || commentariesSurface) && (
                <VerseCommentariesSection
                    entityMeta={verseEntity}
                    commentaries={commentaries}
                    commentariesSurface={commentariesSurface}
                />
            )}

            {shouldShowUniversalCmsRegion && universalCmsRegion && (
                <VerseSupplementaryCmsSection
                    entityMeta={verseEntity}
                    region={universalCmsRegion}
                />
            )}
        </ScriptureLayout>
    );
}

