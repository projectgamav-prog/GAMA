import { AdminModuleHost } from '@/admin/core/AdminModuleHost';
import {
    resolveBookChapterGroupsSurface,
    resolveBookSectionActionsSurface,
    resolveBookSectionChapterGroupSurface,
} from '@/admin/integrations/sections';
import { ScriptureBookChapterListRow } from '@/components/scripture/chapter/ScriptureBookChapterListRow';
import {
    SCRIPTURE_INLINE_ADMIN_PANEL_CLASS_NAME,
    ScriptureSectionGroupWrapper,
} from '@/components/scripture/scripture-section-group-wrapper';
import { ScriptureSection } from '@/components/scripture/scripture-section';
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

    return (
        <ScriptureSection
            entityMeta={{
                entityType: 'book',
                entityId: book.id,
                entityLabel: book.title,
                region: 'chapter_list',
                capabilityHint: 'navigation',
            }}
            title="Chapter List"
            description={
                hidesGenericSingleSection
                    ? 'Browse this book chapter by chapter.'
                    : 'Browse chapters grouped by their canonical book section.'
            }
        >
            {chapterGroupsSurface && (
                <div className="mb-4">
                    <AdminModuleHost
                        surface={chapterGroupsSurface}
                        className={panelClassName}
                    />
                </div>
            )}
            <div className="space-y-4">
                {bookSections.map((section) => {
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
                        <ScriptureSectionGroupWrapper
                            key={section.id}
                            id={sectionAnchorId(section.slug)}
                            entityMeta={{
                                entityType: 'book_section',
                                entityId: section.id,
                                entityLabel: sectionTitle,
                                region: 'chapter_list_section',
                                capabilityHint: 'navigation',
                            }}
                            title={sectionTitle}
                            meta={
                                <span>
                                    {section.chapters.length} chapter
                                    {section.chapters.length === 1 ? '' : 's'}
                                </span>
                            }
                            introBlock={section.intro_block}
                            adminSurfaces={[
                                sectionGroupSurface,
                                sectionActionsSurface,
                            ]}
                            panelClassName={panelClassName}
                        >
                            <div className="grid gap-3 md:grid-cols-2">
                                {section.chapters.map((chapter) => (
                                    <ScriptureBookChapterListRow
                                        key={chapter.id}
                                        chapter={chapter}
                                        showAdminControls={showAdminControls}
                                        returnToHref={book.href}
                                        panelClassName={panelClassName}
                                    />
                                ))}
                            </div>
                        </ScriptureSectionGroupWrapper>
                    );
                })}
            </div>
        </ScriptureSection>
    );
}
