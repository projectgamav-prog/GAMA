import { Link, useForm } from '@inertiajs/react';
import { Plus, SquareArrowOutUpRight } from 'lucide-react';
import InputError from '@/components/input-error';
import { ScripturePageIntroCard } from '@/components/scripture/scripture-page-intro-card';
import { ScriptureSection } from '@/components/scripture/scripture-section';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import ScriptureLayout from '@/layouts/scripture-layout';
import {
    chapterLabel,
    isGenericSectionLabel,
    sectionLabel,
} from '@/lib/scripture';
import type {
    BreadcrumbItem,
    ChapterFullEditProps,
    ScriptureAdminContentBlock,
} from '@/types';

type CreateContentBlockFormData = {
    title: string;
    body: string;
    region: string;
    sort_order: string;
    status: 'draft' | 'published';
};

type UpdateContentBlockFormData = CreateContentBlockFormData;

function CreateChapterNoteCard({
    storeHref,
    nextSortOrder,
}: {
    storeHref: string;
    nextSortOrder: number;
}) {
    const form = useForm<CreateContentBlockFormData>({
        title: '',
        body: '',
        region: 'study',
        sort_order: String(nextSortOrder),
        status: 'draft',
    });

    const submit = () => {
        form.transform((data) => ({
            title: data.title,
            body: data.body,
            region: data.region,
            sort_order: Number(data.sort_order),
            status: data.status,
        }));

        form.post(storeHref, {
            preserveScroll: true,
            preserveState: false,
            onSuccess: () =>
                form.reset('title', 'body', 'region', 'status'),
        });
    };

    return (
        <Card>
            <CardHeader className="gap-3">
                <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline">Add note block</Badge>
                    <Badge variant="secondary">Text only</Badge>
                </div>
                <CardTitle>Create Chapter Note</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
                <div className="grid gap-2">
                    <Label htmlFor="new_chapter_block_title">Title</Label>
                    <Input
                        id="new_chapter_block_title"
                        value={form.data.title}
                        onChange={(event) =>
                            form.setData('title', event.target.value)
                        }
                        placeholder="Editorial note title"
                    />
                    <InputError message={form.errors.title} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="new_chapter_block_body">Body</Label>
                    <Textarea
                        id="new_chapter_block_body"
                        value={form.data.body}
                        onChange={(event) =>
                            form.setData('body', event.target.value)
                        }
                        rows={6}
                        placeholder="Write the note copy for this chapter."
                    />
                    <InputError message={form.errors.body} />
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <div className="grid gap-2">
                        <Label htmlFor="new_chapter_block_region">Region</Label>
                        <Input
                            id="new_chapter_block_region"
                            value={form.data.region}
                            onChange={(event) =>
                                form.setData('region', event.target.value)
                            }
                        />
                        <InputError message={form.errors.region} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="new_chapter_block_sort_order">
                            Sort order
                        </Label>
                        <Input
                            id="new_chapter_block_sort_order"
                            type="number"
                            min={0}
                            value={form.data.sort_order}
                            onChange={(event) =>
                                form.setData('sort_order', event.target.value)
                            }
                        />
                        <InputError message={form.errors.sort_order} />
                    </div>

                    <div className="grid gap-2">
                        <Label>Status</Label>
                        <Select
                            value={form.data.status}
                            onValueChange={(value) =>
                                form.setData(
                                    'status',
                                    value as 'draft' | 'published',
                                )
                            }
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Choose status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="draft">Draft</SelectItem>
                                <SelectItem value="published">
                                    Published
                                </SelectItem>
                            </SelectContent>
                        </Select>
                        <InputError message={form.errors.status} />
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        type="button"
                        onClick={submit}
                        disabled={form.processing}
                    >
                        <Plus className="size-4" />
                        Add note block
                    </Button>
                    {form.recentlySuccessful && (
                        <p className="text-sm text-muted-foreground">
                            Note block added.
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

function ChapterContentBlockEditorCard({
    block,
}: {
    block: ScriptureAdminContentBlock;
}) {
    const form = useForm<UpdateContentBlockFormData>({
        title: block.title ?? '',
        body: block.body ?? '',
        region: block.region,
        sort_order: String(block.sort_order),
        status: block.status,
    });

    const submit = () => {
        form.transform((data) => ({
            title: data.title,
            body: data.body,
            region: data.region,
            sort_order: Number(data.sort_order),
            status: data.status,
        }));

        form.patch(block.update_href, {
            preserveScroll: true,
        });
    };

    return (
        <Card id={`block-${block.id}`}>
            <CardHeader className="gap-3">
                <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline">{block.region}</Badge>
                    <Badge variant="secondary">{block.block_type}</Badge>
                    <Badge variant="outline">{block.status}</Badge>
                </div>
                <CardTitle>{block.title ?? `Block ${block.id}`}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
                <div className="grid gap-2">
                    <Label htmlFor={`chapter_block_title_${block.id}`}>
                        Title
                    </Label>
                    <Input
                        id={`chapter_block_title_${block.id}`}
                        value={form.data.title}
                        onChange={(event) =>
                            form.setData('title', event.target.value)
                        }
                        placeholder="Block title"
                    />
                    <InputError message={form.errors.title} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor={`chapter_block_body_${block.id}`}>
                        Body
                    </Label>
                    <Textarea
                        id={`chapter_block_body_${block.id}`}
                        value={form.data.body}
                        onChange={(event) =>
                            form.setData('body', event.target.value)
                        }
                        rows={7}
                        placeholder="Block body"
                    />
                    <InputError message={form.errors.body} />
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <div className="grid gap-2">
                        <Label htmlFor={`chapter_block_region_${block.id}`}>
                            Region
                        </Label>
                        <Input
                            id={`chapter_block_region_${block.id}`}
                            value={form.data.region}
                            onChange={(event) =>
                                form.setData('region', event.target.value)
                            }
                        />
                        <InputError message={form.errors.region} />
                    </div>

                    <div className="grid gap-2">
                        <Label
                            htmlFor={`chapter_block_sort_order_${block.id}`}
                        >
                            Sort order
                        </Label>
                        <Input
                            id={`chapter_block_sort_order_${block.id}`}
                            type="number"
                            min={0}
                            value={form.data.sort_order}
                            onChange={(event) =>
                                form.setData('sort_order', event.target.value)
                            }
                        />
                        <InputError message={form.errors.sort_order} />
                    </div>

                    <div className="grid gap-2">
                        <Label>Status</Label>
                        <Select
                            value={form.data.status}
                            onValueChange={(value) =>
                                form.setData(
                                    'status',
                                    value as 'draft' | 'published',
                                )
                            }
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Choose status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="draft">Draft</SelectItem>
                                <SelectItem value="published">
                                    Published
                                </SelectItem>
                            </SelectContent>
                        </Select>
                        <InputError message={form.errors.status} />
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        type="button"
                        onClick={submit}
                        disabled={form.processing}
                    >
                        Save block
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
    admin_content_block_store_href,
    next_content_block_sort_order,
    admin_content_blocks,
}: ChapterFullEditProps) {
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
                    <Badge variant="outline">
                        {admin_content_blocks.length} block
                        {admin_content_blocks.length === 1 ? '' : 's'}
                    </Badge>
                }
            >
                <div className="space-y-4">
                    <CreateChapterNoteCard
                        storeHref={admin_content_block_store_href}
                        nextSortOrder={next_content_block_sort_order}
                    />

                    {admin_content_blocks.map((block) => (
                        <ChapterContentBlockEditorCard
                            key={block.id}
                            block={block}
                        />
                    ))}
                </div>
            </ScriptureSection>
        </ScriptureLayout>
    );
}
