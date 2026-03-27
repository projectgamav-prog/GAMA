import { Link } from '@inertiajs/react';
import { SquareArrowOutUpRight } from 'lucide-react';
import {
    ChapterContentBlockEditorCard,
    CreateChapterContentBlockCard,
    ProtectedChapterContentBlockCard,
} from '@/components/scripture/chapter-admin-content-block-cards';
import { ScripturePageIntroCard } from '@/components/scripture/scripture-page-intro-card';
import { ScriptureSection } from '@/components/scripture/scripture-section';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import ScriptureLayout from '@/layouts/scripture-layout';
import {
    chapterLabel,
    isGenericSectionLabel,
    sectionLabel,
} from '@/lib/scripture';
import type { BreadcrumbItem, ChapterFullEditProps } from '@/types';

export default function ChapterFullEdit({
    book,
    book_section,
    chapter,
    admin_entity,
    admin_content_block_store_href,
    next_content_block_sort_order,
    admin_content_blocks,
    protected_content_blocks,
}: ChapterFullEditProps) {
    const fields = admin_entity.fields;
    const chapterTitle = chapterLabel(chapter.number, chapter.title);
    const rawBookSectionTitle = sectionLabel(
        book_section.number,
        book_section.title,
    );
    const bookSectionTitle = isGenericSectionLabel(
        book_section.slug,
        book_section.title,
    )
        ? 'Main section'
        : rawBookSectionTitle;
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
            title: `${chapterTitle} Full edit`,
            href: chapter.admin_full_edit_href,
        },
    ];

    return (
        <ScriptureLayout
            title={`Full edit - ${chapterTitle}`}
            breadcrumbs={breadcrumbs}
        >
            <ScripturePageIntroCard
                badges={
                    <>
                        <Badge variant="outline">Protected editor</Badge>
                        <Badge variant="secondary">Chapter</Badge>
                    </>
                }
                title={`Full edit: ${chapterTitle}`}
                description="Use this deeper editorial workspace to manage chapter-owned text note blocks without changing canonical chapter identity or navigation."
                headerAction={
                    <Button asChild variant="outline" size="sm">
                        <Link href={chapter.href}>
                            <SquareArrowOutUpRight className="size-4" />
                            Back to chapter page
                        </Link>
                    </Button>
                }
                contentClassName="space-y-5"
            >
                <div className="rounded-2xl border border-border/70 bg-muted/20 px-5 py-5 sm:px-6 sm:py-6">
                    <p className="text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">
                        Canonical chapter context
                    </p>
                    <p className="mt-4 text-xl font-semibold sm:text-2xl">
                        {chapterTitle}
                    </p>
                    <p className="mt-3 text-sm text-muted-foreground">
                        {book.title}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {bookSectionTitle}
                    </p>
                </div>
            </ScripturePageIntroCard>

            <ScriptureSection
                id="block-manager"
                title="Note Blocks"
                description="Manage chapter-owned text note blocks, including drafts that stay hidden from the public chapter page."
                action={
                    <div className="flex flex-wrap gap-2">
                        <Badge variant="outline">
                            {admin_content_blocks.length} editable
                        </Badge>
                        <Badge variant="outline">
                            {protected_content_blocks.length} protected
                        </Badge>
                    </div>
                }
            >
                <div className="space-y-4">
                    <CreateChapterContentBlockCard
                        storeHref={admin_content_block_store_href}
                        nextSortOrder={next_content_block_sort_order}
                        titleField={fields.content_block_title}
                        bodyField={fields.content_block_body}
                        regionField={fields.content_block_region}
                        sortOrderField={fields.content_block_sort_order}
                        statusField={fields.content_block_status}
                    />

                    {admin_content_blocks.map((block) => (
                        <ChapterContentBlockEditorCard
                            key={block.id}
                            block={block}
                            titleField={fields.content_block_title}
                            bodyField={fields.content_block_body}
                            regionField={fields.content_block_region}
                            sortOrderField={fields.content_block_sort_order}
                            statusField={fields.content_block_status}
                        />
                    ))}

                    {protected_content_blocks.map((block) => (
                        <ProtectedChapterContentBlockCard
                            key={block.id}
                            block={block}
                        />
                    ))}
                </div>
            </ScriptureSection>
        </ScriptureLayout>
    );
}
