import { Head, Link, useForm } from '@inertiajs/react';
import { Globe2, Layers3, Save } from 'lucide-react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { ContentBlockRenderer } from '@/components/scripture/content-block-renderer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes';
import { index as cmsPagesIndex } from '@/routes/cms/pages';
import type {
    BreadcrumbItem,
    CmsPageShowProps,
    CmsPageStatus,
} from '@/types';

export default function CmsPageShow({
    page,
    content_blocks,
}: CmsPageShowProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
        {
            title: 'CMS Pages',
            href: cmsPagesIndex(),
        },
        {
            title: page.title,
            href: page.workspace_href,
        },
    ];

    const form = useForm({
        title: page.title,
        slug: page.slug,
        status: page.status,
        layout_key: page.layout_key ?? '',
    });

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        form.patch(page.workspace_href, {
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={page.title} />

            <div className="space-y-8 px-4 py-6 md:px-6">
                <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-2">
                        <Badge
                            variant={
                                page.status === 'published'
                                    ? 'secondary'
                                    : 'outline'
                            }
                        >
                            {page.status}
                        </Badge>
                        <Badge variant="outline">CMS Page</Badge>
                        {page.layout_key && (
                            <Badge variant="outline">{page.layout_key}</Badge>
                        )}
                    </div>

                    <Heading
                        title={page.title}
                        description="This page is now a CMS content owner. Keep the identity fields here lightweight, and compose public content through page-owned blocks in later passes."
                    />
                </div>

                <div className="grid gap-6 xl:grid-cols-[1.02fr_0.98fr]">
                    <Card>
                        <CardHeader className="gap-3">
                            <CardTitle>Page Identity</CardTitle>
                            <CardDescription>
                                Core page fields stay narrow here: title, slug,
                                publish state, and optional layout key.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form
                                onSubmit={handleSubmit}
                                className="space-y-5"
                            >
                                <div className="grid gap-2">
                                    <Label htmlFor="title">Title</Label>
                                    <Input
                                        id="title"
                                        value={form.data.title}
                                        onChange={(event) =>
                                            form.setData(
                                                'title',
                                                event.target.value,
                                            )
                                        }
                                    />
                                    <InputError message={form.errors.title} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="slug">Slug</Label>
                                    <Input
                                        id="slug"
                                        value={form.data.slug}
                                        onChange={(event) =>
                                            form.setData(
                                                'slug',
                                                event.target.value,
                                            )
                                        }
                                    />
                                    <p className="text-sm text-muted-foreground">
                                        Public route:
                                        {' '}
                                        `/pages/{form.data.slug || page.slug}`
                                    </p>
                                    <InputError message={form.errors.slug} />
                                </div>

                                <div className="grid gap-5 md:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label htmlFor="status">
                                            Publish state
                                        </Label>
                                        <Select
                                            value={form.data.status}
                                            onValueChange={(value) =>
                                                form.setData(
                                                    'status',
                                                    value as CmsPageStatus,
                                                )
                                            }
                                        >
                                            <SelectTrigger
                                                id="status"
                                                className="w-full"
                                            >
                                                <SelectValue placeholder="Choose status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="draft">
                                                    Draft
                                                </SelectItem>
                                                <SelectItem value="published">
                                                    Published
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <InputError
                                            message={form.errors.status}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="layout_key">
                                            Layout key
                                        </Label>
                                        <Input
                                            id="layout_key"
                                            value={form.data.layout_key}
                                            onChange={(event) =>
                                                form.setData(
                                                    'layout_key',
                                                    event.target.value,
                                                )
                                            }
                                            placeholder="standard"
                                        />
                                        <InputError
                                            message={form.errors.layout_key}
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <Button
                                        type="submit"
                                        disabled={form.processing}
                                    >
                                        <Save className="size-4" />
                                        {form.processing
                                            ? 'Saving...'
                                            : 'Save page'}
                                    </Button>
                                    <p
                                        className={cn(
                                            'text-sm text-muted-foreground',
                                            form.recentlySuccessful &&
                                                'text-foreground',
                                        )}
                                    >
                                        {form.recentlySuccessful
                                            ? 'Saved'
                                            : 'Identity updates stay separate from block composition.'}
                                    </p>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="gap-3">
                            <CardTitle className="flex items-center gap-2">
                                <Layers3 className="size-5" />
                                Block Ownership
                            </CardTitle>
                            <CardDescription>
                                This page already owns content blocks through the
                                shared polymorphic `content_blocks.parent_*`
                                pattern.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm leading-6 text-muted-foreground">
                            <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                                <p>
                                    {page.content_block_count} total owned
                                    block
                                    {page.content_block_count === 1 ? '' : 's'}
                                    , with{' '}
                                    {page.published_content_block_count}{' '}
                                    published for the public page shell.
                                </p>
                                <p className="mt-2">
                                    The block composer/editor UI is
                                    intentionally postponed in this first CMS
                                    pass. The ownership foundation is in place
                                    first so later block tooling can stay
                                    universal.
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <Button asChild variant="outline">
                                    <Link href={cmsPagesIndex()}>
                                        Back to pages
                                    </Link>
                                </Button>
                                {page.status === 'published' && (
                                    <Button asChild>
                                        <Link href={page.public_href}>
                                            <Globe2 className="size-4" />
                                            Open public page
                                        </Link>
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader className="gap-3">
                        <CardTitle>Published Block Preview</CardTitle>
                        <CardDescription>
                            This is the current public shell view of published
                            blocks attached to the page.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {content_blocks.length > 0 ? (
                            <div className="space-y-4">
                                {content_blocks.map((block) => (
                                    <ContentBlockRenderer
                                        key={block.id}
                                        block={block}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="rounded-2xl border border-dashed border-border/70 p-8 text-sm leading-6 text-muted-foreground">
                                No published blocks are attached yet. That is
                                expected in this first foundation pass while the
                                universal page record and public shell settle
                                first.
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
