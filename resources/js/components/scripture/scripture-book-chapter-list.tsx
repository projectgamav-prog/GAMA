import { Link } from '@inertiajs/react';
import { BookOpenText } from 'lucide-react';
import { AdminModuleHost } from '@/admin/core/AdminModuleHost';
import {
    resolveBookChapterGroupsSurface,
    resolveBookSectionChapterGroupSurface,
} from '@/admin/integrations/sections';
import { ScriptureEntityRegion } from '@/components/scripture/scripture-entity-region';
import { ScriptureSection } from '@/components/scripture/scripture-section';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    chapterLabel,
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

const DEFAULT_PANEL_CLASS_NAME =
    'flex flex-wrap items-center gap-2 rounded-2xl border border-border/70 bg-muted/20 p-3';

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
                            <Card id={sectionAnchorId(section.slug)}>
                                <CardHeader className="space-y-3">
                                    {sectionGroupSurface && (
                                        <AdminModuleHost
                                            surface={sectionGroupSurface}
                                            className={panelClassName}
                                        />
                                    )}
                                    <div className="space-y-2">
                                        <CardTitle>{sectionTitle}</CardTitle>
                                        <CardDescription>
                                            {section.chapters.length} chapter
                                            {section.chapters.length === 1
                                                ? ''
                                                : 's'}
                                        </CardDescription>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-3 md:grid-cols-2">
                                        {section.chapters.map((chapter) => (
                                            <ScriptureEntityRegion
                                                key={chapter.id}
                                                meta={{
                                                    entityType: 'chapter',
                                                    entityId: chapter.id,
                                                    entityLabel: chapterLabel(
                                                        chapter.number,
                                                        chapter.title,
                                                    ),
                                                    region: 'chapter_list_row',
                                                    capabilityHint:
                                                        'navigation',
                                                }}
                                                asChild
                                            >
                                                <Link
                                                    href={chapter.href}
                                                    className="group rounded-lg border p-4 transition-colors hover:border-primary"
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <div className="rounded-md bg-primary/10 p-2 text-primary">
                                                            <BookOpenText className="size-4" />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <p className="font-medium group-hover:text-primary">
                                                                {chapterLabel(
                                                                    chapter.number,
                                                                    chapter.title,
                                                                )}
                                                            </p>
                                                            <p className="text-sm text-muted-foreground">
                                                                Read Chapter
                                                            </p>
                                                        </div>
                                                    </div>
                                                </Link>
                                            </ScriptureEntityRegion>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </ScriptureEntityRegion>
                    );
                })}
            </div>
        </ScriptureSection>
    );
}
