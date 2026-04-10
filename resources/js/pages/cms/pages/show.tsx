import { Head, Link, useForm } from '@inertiajs/react';
import { Globe2, Save, Trash2 } from 'lucide-react';
import { CmsCompositionEditor } from '@/admin/cms/workspace/CmsCompositionEditor';
import { CmsDeleteActionButton } from '@/admin/cms/components/CmsActionButtons';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
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
    containers,
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
                        description="Keep page identity lightweight here. Routine composition should happen on the real page layout when available, while this workspace stays a support surface for management, diagnostics, and utility editing."
                    />
                </div>

                <div className="grid gap-6 xl:grid-cols-[1.02fr_0.98fr]">
                    <Card>
                        <CardHeader className="gap-3">
                            <CardTitle>Page Identity</CardTitle>
                            <CardDescription>
                                Keep the page record narrow here: title, slug,
                                publish state, and optional layout key.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form
                                onSubmit={(event) => {
                                    event.preventDefault();

                                    form.patch(page.workspace_href, {
                                        preserveScroll: true,
                                    });
                                }}
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
                                            ? 'Page identity saved.'
                                            : 'Identity stays separate from composition decisions.'}
                                    </p>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="gap-3">
                            <CardTitle>Composition Direction</CardTitle>
                            <CardDescription>
                                CMS composition uses its own independent
                                page-container-block model, but this workspace
                                is a support view rather than the primary
                                authoring surface.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm leading-6 text-muted-foreground">
                            <p>
                                A page owns ordered containers. Each container
                                owns ordered CMS blocks. That is the structural
                                seam that lets the workspace decide whether
                                something stays inside the same card or becomes
                                a new card.
                            </p>
                            <p>
                                Admins should normally compose on the real page
                                layout so they see the final result while
                                editing. Use this workspace for support tasks,
                                identity management, and utility edits.
                            </p>

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
                                            Open real page
                                        </Link>
                                    </Button>
                                )}
                                <CmsDeleteActionButton
                                    href={page.destroy_href}
                                    label="Delete page"
                                    confirmMessage="Delete this CMS page and all of its containers and blocks?"
                                    icon={Trash2}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <CmsCompositionEditor
                    page={page}
                    containers={containers}
                />
            </div>
        </AppLayout>
    );
}
