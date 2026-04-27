import { AdminModuleHost } from '@/admin/core/AdminModuleHost';
import { AdminModuleHostGroup } from '@/admin/core/AdminModuleHostGroup';
import {
    resolveBookChapterGroupsSurface,
    resolveBookSectionActionsSurface,
    resolveBookSectionChapterGroupSurface,
} from '@/admin/integrations/sections';
import { ScriptureBookChapterListRow } from '@/components/scripture/chapter/ScriptureBookChapterListRow';
import { ScriptureEntityRegion } from '@/components/scripture/scripture-entity-region';
import { ScriptureIntroDropdown } from '@/components/scripture/scripture-intro-dropdown';
import { SCRIPTURE_INLINE_ADMIN_PANEL_CLASS_NAME } from '@/components/scripture/scripture-section-group-wrapper';
import {
    ChroniclePaperPanel,
    ChronicleSectionHeading,
} from '@/components/site/chronicle-primitives';
import {
    hidesSingleGenericSection,
    sectionAnchorId,
    sectionLabel,
} from '@/lib/scripture';
import type {
    ScriptureBook,
    ScriptureBookAdmin,
    ScriptureBookSection,
    ScriptureChapter,
} from '@/types';

const DEFAULT_PANEL_CLASS_NAME = SCRIPTURE_INLINE_ADMIN_PANEL_CLASS_NAME;

type Props = {
    book: ScriptureBook;
    bookSections: Array<
        ScriptureBookSection & {
            chapters: ScriptureChapter[];
        }
    >;
    showAdminControls: boolean;
    admin?: ScriptureBookAdmin | null;
    panelClassName?: string;
};

export function ScriptureBookChapterList({
    book,
    bookSections,
    showAdminControls,
    admin,
    panelClassName = DEFAULT_PANEL_CLASS_NAME,
}: Props) {
    const hidesGenericSingleSection = hidesSingleGenericSection(bookSections);
    const chapterGroupsSurface = resolveBookChapterGroupsSurface({
        book,
        bookSections,
        admin,
        enabled: showAdminControls,
    });
    const chapterCount = bookSections.reduce(
        (total, section) => total + section.chapters.length,
        0,
    );

    return (
        <ScriptureEntityRegion
            meta={{
                entityType: 'book',
                entityId: book.id,
                entityLabel: book.title,
                region: 'chapter_list',
                capabilityHint: 'navigation',
            }}
            asChild
        >
            <section id="chapter-list" className="space-y-4">
                <ChronicleSectionHeading
                    title="Chapter List"
                    eyebrow={
                        hidesGenericSingleSection
                            ? 'Browse this book chapter by chapter'
                            : 'Browse chapters by canonical section'
                    }
                    action={
                        <span className="chronicle-link text-xs">
                            {chapterCount} chapter
                            {chapterCount === 1 ? '' : 's'}
                        </span>
                    }
                />

                {chapterGroupsSurface && (
                    <AdminModuleHost
                        surface={chapterGroupsSurface}
                        className={panelClassName}
                    />
                )}

                <div className="space-y-4">
                    {bookSections.map((section, index) => {
                        const sectionTitle = hidesGenericSingleSection
                            ? 'Chapters'
                            : sectionLabel(section.number, section.title);
                        const sectionGroupSurface =
                            resolveBookSectionChapterGroupSurface({
                                bookSection: section,
                                title: sectionTitle,
                                enabled: showAdminControls,
                            });
                        const sectionActionsSurface =
                            resolveBookSectionActionsSurface({
                                bookSection: section,
                                title: sectionTitle,
                                enabled: showAdminControls,
                            });

                        return (
                            <ScriptureEntityRegion
                                key={section.id}
                                meta={{
                                    entityType: 'book_section',
                                    entityId: section.id,
                                    entityLabel: sectionTitle,
                                    region: 'chapter_list_section',
                                    capabilityHint: 'navigation',
                                }}
                                asChild
                            >
                                <ChroniclePaperPanel
                                    id={sectionAnchorId(section.slug)}
                                    className="space-y-4 p-4 sm:p-5"
                                >
                                    <div className="grid gap-3 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-start">
                                        <div className="chronicle-title text-4xl leading-none text-[color:var(--chronicle-gold)]">
                                            {index + 1}
                                        </div>
                                        <div>
                                            <h3 className="chronicle-title text-3xl leading-tight">
                                                {sectionTitle}
                                            </h3>
                                            <p className="text-sm text-[color:var(--chronicle-brown)]">
                                                {section.chapters.length}{' '}
                                                chapter
                                                {section.chapters.length === 1
                                                    ? ''
                                                    : 's'}
                                            </p>
                                        </div>
                                        <AdminModuleHostGroup
                                            surfaces={[
                                                sectionGroupSurface,
                                                sectionActionsSurface,
                                            ]}
                                            className={panelClassName}
                                        />
                                    </div>

                                    <ScriptureIntroDropdown
                                        block={section.intro_block}
                                        contentLabel="Section Introduction"
                                    />

                                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                                        {section.chapters.map((chapter) => (
                                            <ScriptureBookChapterListRow
                                                key={chapter.id}
                                                chapter={chapter}
                                                showAdminControls={
                                                    showAdminControls
                                                }
                                                returnToHref={book.href}
                                                panelClassName={panelClassName}
                                            />
                                        ))}
                                    </div>
                                </ChroniclePaperPanel>
                            </ScriptureEntityRegion>
                        );
                    })}
                </div>
            </section>
        </ScriptureEntityRegion>
    );
}
