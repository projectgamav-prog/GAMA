import { Link } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';
import { AdminModuleHostGroup } from '@/admin/core/AdminModuleHostGroup';
import { resolveChapterHeaderSurfaces } from '@/admin/integrations/scripture/chapters';
import { ScriptureChapterVerseList } from '@/components/scripture/scripture-chapter-verse-list';
import {
    ChronicleEditorialGrid,
    ChronicleOrnament,
    ChroniclePaperPanel,
    ChronicleSideRail,
    ChronicleStatRow,
} from '@/components/site/chronicle-primitives';
import { Button } from '@/components/ui/button';
import { useVisibleAdminControls } from '@/hooks/use-admin-context';
import ScriptureLayout from '@/layouts/scripture-layout';
import { chapterLabel } from '@/lib/scripture';
import { UniversalSectionStack } from '@/rendering/core';
import { buildChapterShowDescriptorModel } from '@/rendering/scripture/adapters/chapter-show-page-adapter';
import type { ChapterShowProps } from '@/types';

const ADMIN_PANEL_CLASS_NAME =
    'chronicle-admin-surface flex flex-wrap items-center gap-1.5 p-1';

export default function ChapterShow({
    book,
    book_section,
    chapter,
    reader_languages,
    default_language,
    chapter_sections,
    admin,
    verse_admin_shared,
}: ChapterShowProps) {
    const showAdminControls = useVisibleAdminControls();
    const chapterTitle = chapterLabel(chapter.number, chapter.title);
    const {
        identitySurface: chapterIdentitySurface,
        introSurface: chapterIntroSurface,
        actionsSurface: chapterActionsSurface,
    } = resolveChapterHeaderSurfaces({
        chapter,
        chapterTitle,
        admin,
        enabled: showAdminControls,
    });
    const pageModel = buildChapterShowDescriptorModel({
        book,
        bookSection: book_section,
        chapter,
        readerLanguages: reader_languages,
        defaultLanguage: default_language,
        chapterSections: chapter_sections,
        chapterIntroSurface,
    });

    return (
        <ScriptureLayout
            title={pageModel.chapterTitle}
            breadcrumbs={pageModel.breadcrumbs}
        >
            <ChronicleEditorialGrid>
                <main className="space-y-5">
                    <ChroniclePaperPanel
                        variant="feature"
                        className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[14rem_minmax(0,1fr)]"
                    >
                        <div
                            aria-hidden="true"
                            className="min-h-48 rounded-sm border border-[color:var(--chronicle-border)] bg-[radial-gradient(circle_at_30%_20%,rgba(173,122,44,0.24),transparent_0.5rem),radial-gradient(circle_at_68%_70%,rgba(104,69,31,0.15),transparent_0.65rem),linear-gradient(145deg,rgba(255,248,235,0.45),rgba(173,122,44,0.12))]"
                        />

                        <div className="space-y-5">
                            <div className="space-y-3">
                                <p className="chronicle-kicker">
                                    Chapter Reading
                                </p>
                                <h1 className="chronicle-feature-title">
                                    {pageModel.chapterTitle}
                                </h1>
                                <div className="flex flex-wrap items-center gap-2 text-sm text-[color:var(--chronicle-brown)]">
                                    <span>{book.title}</span>
                                    {!pageModel.hidesGenericBookSection && (
                                        <>
                                            <span aria-hidden="true">/</span>
                                            <span>{pageModel.bookSectionTitle}</span>
                                        </>
                                    )}
                                    <span aria-hidden="true">/</span>
                                    <span>
                                        {pageModel.totalVerseCount} verse
                                        {pageModel.totalVerseCount === 1 ? '' : 's'}
                                    </span>
                                </div>
                                <ChronicleOrnament />
                                <p className="max-w-3xl text-base leading-7 text-[color:var(--chronicle-ink)]">
                                    Read the chapter introduction first, then
                                    continue through the grouped verse list in
                                    canonical order.
                                </p>
                            </div>

                            <ChronicleStatRow items={pageModel.statItems} />

                            <div className="space-y-4">
                                <UniversalSectionStack
                                    sections={pageModel.introSections}
                                    renderContext={pageModel.mainRenderContext}
                                />

                                <div className="flex flex-wrap gap-3">
                                    {pageModel.firstVerse?.explanation_href && (
                                        <Button
                                            asChild
                                            className="chronicle-button rounded-sm px-5"
                                        >
                                            <Link
                                                href={
                                                    pageModel.firstVerse.explanation_href
                                                }
                                            >
                                                Read First Verse
                                                <ChevronRight className="size-4" />
                                            </Link>
                                        </Button>
                                    )}
                                    <Button
                                        asChild
                                        variant="outline"
                                        className="chronicle-button-outline rounded-sm px-5"
                                    >
                                        <a href="#verse-list">
                                            Browse Verses
                                            <ChevronRight className="size-4" />
                                        </a>
                                    </Button>
                                </div>
                            </div>

                            <AdminModuleHostGroup
                                surfaces={[
                                    chapterIdentitySurface,
                                    chapterIntroSurface,
                                    chapterActionsSurface,
                                ]}
                                className={ADMIN_PANEL_CLASS_NAME}
                            />
                        </div>
                    </ChroniclePaperPanel>

                    <ScriptureChapterVerseList
                        chapter={chapter}
                        chapterSections={chapter_sections}
                        readerLanguages={reader_languages}
                        defaultLanguage={default_language}
                        showAdminControls={showAdminControls}
                        admin={admin}
                        verseAdminShared={verse_admin_shared}
                        panelClassName={ADMIN_PANEL_CLASS_NAME}
                    />
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
