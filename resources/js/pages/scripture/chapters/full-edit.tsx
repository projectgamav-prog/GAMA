import { Link, useForm } from '@inertiajs/react';
import { SquareArrowOutUpRight } from 'lucide-react';
import InputError from '@/components/input-error';
import {
    ChapterContentBlockEditorCard,
    CreateChapterContentBlockCard,
    ProtectedChapterContentBlockCard,
} from '@/components/scripture/chapter-admin-content-block-cards';
import { ScripturePageIntroCard } from '@/components/scripture/scripture-page-intro-card';
import { ScriptureSection } from '@/components/scripture/scripture-section';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useScriptureAdminTargetNavigation } from '@/hooks/use-scripture-admin-target-navigation';
import ScriptureLayout from '@/layouts/scripture-layout';
import {
    chapterLabel,
    isGenericSectionLabel,
    sectionLabel,
} from '@/lib/scripture';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { BreadcrumbItem, ChapterFullEditProps } from '@/types';

type ChapterIdentityEditorFormData = {
    slug: string;
    number: string;
    title: string;
};

function ChapterIdentityEditorCard({
    updateHref,
    chapter,
}: {
    updateHref: string;
    chapter: ChapterFullEditProps['chapter'];
}) {
    const form = useForm<ChapterIdentityEditorFormData>({
        slug: chapter.slug,
        number: chapter.number ?? '',
        title: chapter.title ?? '',
    });

    const submit = () => {
        form.patch(updateHref, {
            preserveScroll: true,
        });
    };

    return (
        <Card>
            <CardHeader className="gap-3">
                <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline">Chapter identity</Badge>
                    <Badge variant="secondary">Canonical</Badge>
                </div>
                <CardTitle>Chapter Identity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
                <div className="grid gap-2">
                    <Label htmlFor="chapter_identity_slug_full">Slug</Label>
                    <Input
                        id="chapter_identity_slug_full"
                        value={form.data.slug}
                        onChange={(event) =>
                            form.setData('slug', event.target.value)
                        }
                        placeholder="chapter-slug"
                    />
                    <InputError message={form.errors.slug} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="chapter_identity_number_full">Number</Label>
                    <Input
                        id="chapter_identity_number_full"
                        value={form.data.number}
                        onChange={(event) =>
                            form.setData('number', event.target.value)
                        }
                        placeholder="1"
                    />
                    <InputError message={form.errors.number} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="chapter_identity_title_full">Title</Label>
                    <Input
                        id="chapter_identity_title_full"
                        value={form.data.title}
                        onChange={(event) =>
                            form.setData('title', event.target.value)
                        }
                        placeholder="Chapter title"
                    />
                    <InputError message={form.errors.title} />
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        type="button"
                        onClick={submit}
                        disabled={form.processing}
                    >
                        Save chapter identity
                    </Button>
                    {form.recentlySuccessful && (
                        <p className="text-sm text-muted-foreground">Saved.</p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

export default function ChapterFullEdit({
    book,
    book_section,
    chapter,
    admin_entity,
    admin_identity_update_href,
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
    useScriptureAdminTargetNavigation();

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
                description="Use this deeper editorial workspace to manage chapter-owned intro and note blocks without changing canonical chapter identity or navigation."
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
                adminTargetSection="identity"
                title="Chapter Identity"
                description="Canonical chapter identity for this chapter. This stays lightweight, but it is now editable from the same protected workflow used by the public-page fallback."
            >
                <ChapterIdentityEditorCard
                    updateHref={admin_identity_update_href}
                    chapter={chapter}
                />
            </ScriptureSection>

            <ScriptureSection
                adminTargetSection="content_blocks"
                title="Intro & Note Blocks"
                description="Manage chapter-owned text, quote, and image intro or note blocks, including drafts that stay hidden from the public chapter page."
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
                        blockTypeField={fields.content_block_type}
                        titleField={fields.content_block_title}
                        bodyField={fields.content_block_body}
                        mediaUrlField={fields.content_block_media_url}
                        altTextField={fields.content_block_alt_text}
                        regionField={fields.content_block_region}
                        sortOrderField={fields.content_block_sort_order}
                        statusField={fields.content_block_status}
                    />

                    {admin_content_blocks.map((block) => (
                        <ChapterContentBlockEditorCard
                            key={block.id}
                            block={block}
                            blockTypeField={fields.content_block_type}
                            titleField={fields.content_block_title}
                            bodyField={fields.content_block_body}
                            mediaUrlField={fields.content_block_media_url}
                            altTextField={fields.content_block_alt_text}
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
