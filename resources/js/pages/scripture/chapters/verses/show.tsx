import { Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { AdminModuleHostGroup } from '@/admin/core/AdminModuleHostGroup';
import {
    resolveVerseHeaderSurfaces,
    resolveVerseRelationSurfaces,
} from '@/admin/integrations/scripture/verses';
import { ScriptureEntityRegion } from '@/components/scripture/scripture-entity-region';
import { VerseCharactersSection } from '@/components/scripture/verse/VerseCharactersSection';
import { VerseCommentariesSection } from '@/components/scripture/verse/VerseCommentariesSection';
import { VerseDictionaryTermsSection } from '@/components/scripture/verse/VerseDictionaryTermsSection';
import { VerseRecitationsSection } from '@/components/scripture/verse/VerseRecitationsSection';
import { VerseStudyNotesSection } from '@/components/scripture/verse/VerseStudyNotesSection';
import { VerseSupplementaryCmsSection } from '@/components/scripture/verse/VerseSupplementaryCmsSection';
import { VerseTopicsSection } from '@/components/scripture/verse/VerseTopicsSection';
import { VerseTranslationsSection } from '@/components/scripture/verse/VerseTranslationsSection';
import {
    ChronicleEditorialGrid,
    ChronicleOrnament,
    ChroniclePaperPanel,
    ChronicleSideRail,
} from '@/components/site/chronicle-primitives';
import { useVisibleAdminControls } from '@/hooks/use-admin-context';
import ScriptureLayout from '@/layouts/scripture-layout';
import { verseLabel } from '@/lib/scripture';
import { UniversalSectionStack } from '@/rendering/core';
import {
    buildVerseShowDescriptorModel,
    verseNavLabel,
} from '@/rendering/scripture/adapters/verse-show-page-adapter';
import type { VerseShowProps } from '@/types';

const ADMIN_PANEL_CLASS_NAME =
    'chronicle-admin-surface flex flex-wrap items-center gap-1.5 p-1';

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
    const verseTitle = verseLabel(verse.number);
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
    const pageModel = buildVerseShowDescriptorModel({
        book,
        bookSection: book_section,
        chapter,
        chapterSection: chapter_section,
        verse,
        translations,
        commentaries,
        verseMeta: verse_meta,
        dictionaryTerms: dictionary_terms,
        recitations,
        topics,
        characters,
        cmsRegions: cms_regions,
        showAdminControls,
        verseIntroSurface,
        verseMetaSurface,
    });
    const { translationsSurface, commentariesSurface } =
        resolveVerseRelationSurfaces({
            verse,
            verseTitle: pageModel.verseTitle,
            translationsAdmin: admin?.translations,
            commentariesAdmin: admin?.commentaries,
            fullEditHref: admin?.full_edit_href ?? null,
            enabled: showAdminControls,
        });

    return (
        <ScriptureLayout
            title={`${pageModel.verseTitle} - ${pageModel.chapterTitle}`}
            breadcrumbs={pageModel.breadcrumbs}
        >
            <ChronicleEditorialGrid>
                <main className="space-y-5">
                    <ScriptureEntityRegion
                        meta={{
                            ...pageModel.supportEntity,
                            region: 'page_intro',
                            capabilityHint: 'intro',
                        }}
                        asChild
                    >
                        <ChroniclePaperPanel
                            variant="feature"
                            className="relative overflow-hidden p-5 text-center sm:p-8"
                        >
                            <div
                                aria-hidden="true"
                                className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-[radial-gradient(circle_at_25%_90%,rgba(173,122,44,0.18),transparent_14rem),radial-gradient(circle_at_78%_78%,rgba(104,69,31,0.12),transparent_12rem)]"
                            />
                            <div className="relative mx-auto max-w-4xl space-y-5">
                                <div className="space-y-3">
                                    <p className="chronicle-kicker">
                                        Sacred Verse
                                    </p>
                                    <h1 className="chronicle-title text-4xl leading-none text-[color:var(--chronicle-gold)] sm:text-5xl">
                                        {pageModel.referenceTitle}
                                    </h1>
                                    <ChronicleOrnament className="justify-center" />
                                    <p className="chronicle-verse-title mx-auto max-w-3xl">
                                        {verse.text}
                                    </p>
                                    <p className="font-serif text-lg text-[color:var(--chronicle-brown)] italic">
                                        From {pageModel.chapterSectionTitle}
                                    </p>
                                </div>

                                <AdminModuleHostGroup
                                    surfaces={[
                                        verseIdentitySurface,
                                        verseIntroSurface,
                                    ]}
                                    className={`${ADMIN_PANEL_CLASS_NAME} justify-center`}
                                />

                                <UniversalSectionStack
                                    sections={pageModel.introSections}
                                    renderContext={pageModel.mainRenderContext}
                                />

                                <div className="grid gap-3 pt-2 sm:grid-cols-2">
                                    {previous_verse && (
                                        <Link
                                            href={previous_verse.href}
                                            className="chronicle-panel group rounded-sm p-4 text-left transition-colors hover:border-[color:var(--chronicle-gold)] hover:bg-[rgba(173,122,44,0.08)]"
                                        >
                                            <span className="chronicle-kicker inline-flex items-center gap-1">
                                                <ChevronLeft className="size-3.5" />
                                                Previous Verse
                                            </span>
                                            <p className="mt-2 font-serif text-lg text-[color:var(--chronicle-ink)]">
                                                {verseNavLabel(previous_verse)}
                                            </p>
                                        </Link>
                                    )}
                                    {next_verse && (
                                        <Link
                                            href={next_verse.href}
                                            className="chronicle-panel group rounded-sm p-4 text-left transition-colors hover:border-[color:var(--chronicle-gold)] hover:bg-[rgba(173,122,44,0.08)] sm:text-right"
                                        >
                                            <span className="chronicle-kicker inline-flex items-center gap-1">
                                                Next Verse
                                                <ChevronRight className="size-3.5" />
                                            </span>
                                            <p className="mt-2 font-serif text-lg text-[color:var(--chronicle-ink)]">
                                                {verseNavLabel(next_verse)}
                                            </p>
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </ChroniclePaperPanel>
                    </ScriptureEntityRegion>

                    {(translations.length > 0 || translationsSurface) && (
                        <VerseTranslationsSection
                            entityMeta={pageModel.supportEntity}
                            translations={translations}
                            translationsSurface={translationsSurface}
                        />
                    )}

                    {(commentaries.length > 0 || commentariesSurface) && (
                        <VerseCommentariesSection
                            entityMeta={pageModel.supportEntity}
                            commentaries={commentaries}
                            commentariesSurface={commentariesSurface}
                        />
                    )}

                    {pageModel.hasCompanionSections && (
                        <div className="grid gap-4 xl:grid-cols-2">
                            {(pageModel.hasVerseMeta || verseMetaSurface) && (
                                <VerseStudyNotesSection
                                    entityMeta={pageModel.supportEntity}
                                    verseMeta={verse_meta}
                                    metaBadges={pageModel.metaBadges}
                                    keywords={pageModel.keywords}
                                    studyFlags={pageModel.studyFlags}
                                    verseMetaSurface={verseMetaSurface}
                                />
                            )}

                            {dictionary_terms.length > 0 && (
                                <VerseDictionaryTermsSection
                                    entityMeta={pageModel.supportEntity}
                                    dictionaryTerms={dictionary_terms}
                                />
                            )}

                            {recitations.length > 0 && (
                                <VerseRecitationsSection
                                    entityMeta={pageModel.supportEntity}
                                    recitations={recitations}
                                />
                            )}

                            {topics.length > 0 && (
                                <VerseTopicsSection
                                    entityMeta={pageModel.supportEntity}
                                    topics={topics}
                                />
                            )}

                            {characters.length > 0 && (
                                <VerseCharactersSection
                                    entityMeta={pageModel.supportEntity}
                                    characters={characters}
                                />
                            )}
                        </div>
                    )}

                    {pageModel.shouldShowUniversalCmsRegion && pageModel.universalCmsRegion && (
                        <VerseSupplementaryCmsSection
                            entityMeta={pageModel.supportEntity}
                            region={pageModel.universalCmsRegion}
                        />
                    )}
                </main>

                <ChronicleSideRail>
                    <UniversalSectionStack
                        sections={pageModel.railSections}
                        renderContext={pageModel.railRenderContext}
                    />
                </ChronicleSideRail>
            </ChronicleEditorialGrid>
        </ScriptureLayout>
    );
}
