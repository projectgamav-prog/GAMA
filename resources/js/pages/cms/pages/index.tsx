import { Head, Link, useForm } from '@inertiajs/react';
import { FileText, Globe2, Layers3, Plus } from 'lucide-react';
import PageAdminCreateController from '@/actions/App/Http/Controllers/Cms/PageAdminCreateController';
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
import { dashboard } from '@/routes';
import type {
    BreadcrumbItem,
    CmsPageStatus,
    CmsPagesIndexProps,
} from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
    },
    {
        title: 'CMS Pages',
        href: '/cms/pages',
    },
];

const slugify = (value: string): string =>
    value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

export default function CmsPagesIndex({
    pages,
    page_count,
    published_page_count,
}: CmsPagesIndexProps) {
    const form = useForm({
        title: '',
        slug: '',
        status: 'draft' as CmsPageStatus,
        layout_key: '',
    });

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        form.post(PageAdminCreateController.store.url(), {
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="CMS Pages" />

            <div className="space-y-8 px-4 py-6 md:px-6">
                <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline">CMS</Badge>
                        <Badge variant="secondary">
                            {page_count} {page_count === 1 ? 'page' : 'pages'}
                        </Badge>
                        <Badge variant="secondary">
                            {published_page_count} published
                        </Badge>
                    </div>

                    <Heading
                        title="CMS Pages"
                        description="Create universal non-canonical pages here. Each CMS page becomes its own composition root, then grows through ordered containers and CMS blocks instead of scripture-shaped assumptions."
                    />
                </div>

                <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
                    <Card id="create-page">
                        <CardHeader className="gap-3">
                            <CardTitle className="flex items-center gap-2">
                                <Plus className="size-5" />
                                Add Page
                            </CardTitle>
                            <CardDescription>
                                This creates the CMS page record first. The
                                next workspace step is composition through page
                                containers and their ordered CMS blocks.
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
                                        onChange={(event) => {
                                            const nextTitle =
                                                event.target.value;
                                            form.setData('title', nextTitle);

                                            if (
                                                form.data.slug.length === 0 ||
                                                form.data.slug ===
                                                    slugify(form.data.title)
                                            ) {
                                                form.setData(
                                                    'slug',
                                                    slugify(nextTitle),
                                                );
                                            }
                                        }}
                                        placeholder="About the Platform"
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
                                                slugify(event.target.value),
                                            )
                                        }
                                        placeholder="about-the-platform"
                                    />
                                    <p className="text-sm text-muted-foreground">
                                        Public route:
                                        {' '}
                                        `/pages/{form.data.slug || '{slug}'}`
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
                                        <p className="text-sm text-muted-foreground">
                                            Optional layout hint for later CMS
                                            rendering phases.
                                        </p>
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
                                        {form.processing
                                            ? 'Creating Page...'
                                            : 'Add Page'}
                                    </Button>
                                    <p className="text-sm text-muted-foreground">
                                        The new page opens in its CMS
                                        composition workspace after creation.
                                    </p>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="gap-3">
                            <CardTitle className="flex items-center gap-2">
                                <Layers3 className="size-5" />
                                Foundation Scope
                            </CardTitle>
                            <CardDescription>
                                This first CMS pass is intentionally narrow.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm leading-6 text-muted-foreground">
                            <p>
                                Pages are now first-class CMS records with
                                identity, slug routing, publish state, and an
                                independent page-container-block composition
                                model.
                            </p>
                            <p>
                                Canonical scripture pages stay separate and
                                schema-driven. CMS pages live beside them, not
                                inside their hierarchy.
                            </p>
                            <p>
                                The builder stays intentionally narrow here:
                                create the page record first, then choose
                                whether new content becomes a new container/card
                                or a block inside an existing one.
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader className="gap-3">
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="size-5" />
                            Existing Pages
                        </CardTitle>
                        <CardDescription>
                            Open a page workspace to edit core identity fields
                            and compose its current containers and blocks.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {pages.length > 0 ? (
                            <div className="grid gap-4 lg:grid-cols-2">
                                {pages.map((page) => (
                                    <div
                                        key={page.id}
                                        className="rounded-2xl border border-border/70 p-5"
                                    >
                                        <div className="flex flex-wrap items-start justify-between gap-3">
                                            <div className="space-y-2">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <Badge
                                                        variant={
                                                            page.status ===
                                                            'published'
                                                                ? 'secondary'
                                                                : 'outline'
                                                        }
                                                    >
                                                        {page.status}
                                                    </Badge>
                                                    {page.layout_key && (
                                                        <Badge variant="outline">
                                                            {page.layout_key}
                                                        </Badge>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-lg font-semibold text-foreground">
                                                        {page.title}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        `/pages/{page.slug}`
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="text-right text-sm text-muted-foreground">
                                                <p>
                                                    {page.container_count}{' '}
                                                    containers
                                                </p>
                                                <p>
                                                    {page.block_count} blocks
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-4 flex flex-wrap gap-2">
                                            <Button asChild size="sm">
                                                <Link
                                                    href={page.workspace_href}
                                                >
                                                    Open workspace
                                                </Link>
                                            </Button>
                                            {page.status === 'published' && (
                                                <Button
                                                    asChild
                                                    size="sm"
                                                    variant="outline"
                                                >
                                                    <Link href={page.public_href}>
                                                        <Globe2 className="size-4" />
                                                        Open public page
                                                    </Link>
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="rounded-2xl border border-dashed border-border/70 p-8 text-sm leading-6 text-muted-foreground">
                                No CMS pages exist yet. Create the first page
                                above, then compose it through containers and
                                CMS blocks.
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
