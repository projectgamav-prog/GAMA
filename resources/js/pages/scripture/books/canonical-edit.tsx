import { Link, useForm } from '@inertiajs/react';
import { ShieldAlert, SquareArrowOutUpRight } from 'lucide-react';
import InputError from '@/components/input-error';
import { ScriptureAdminMethodFamilyGrid } from '@/components/scripture/scripture-admin-method-family-grid';
import { ScriptureAdminFieldMeta } from '@/components/scripture/scripture-admin-field-meta';
import { ScripturePageIntroCard } from '@/components/scripture/scripture-page-intro-card';
import { ScriptureSection } from '@/components/scripture/scripture-section';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useScriptureAdminTargetNavigation } from '@/hooks/use-scripture-admin-target-navigation';
import ScriptureLayout from '@/layouts/scripture-layout';
import type { BookCanonicalEditProps, BreadcrumbItem } from '@/types';

type BookIdentityFormData = {
    slug: string;
    number: string;
    title: string;
};

function BookIdentityEditorCard({
    book,
    updateHref,
}: {
    book: BookCanonicalEditProps['book'];
    updateHref: string;
}) {
    const form = useForm<BookIdentityFormData>({
        slug: book.slug,
        number: book.number ?? '',
        title: book.title,
    });

    return (
        <Card>
            <CardHeader className="gap-3">
                <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline">Canonical</Badge>
                    <Badge variant="secondary">Protected workflow</Badge>
                </div>
                <CardTitle>Book Identity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
                <div className="grid gap-2">
                    <Label htmlFor="canonical_book_slug">Slug</Label>
                    <Input
                        id="canonical_book_slug"
                        value={form.data.slug}
                        onChange={(event) =>
                            form.setData('slug', event.target.value)
                        }
                        placeholder="book-slug"
                    />
                    <InputError message={form.errors.slug} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="canonical_book_number">Number</Label>
                    <Input
                        id="canonical_book_number"
                        value={form.data.number}
                        onChange={(event) =>
                            form.setData('number', event.target.value)
                        }
                        placeholder="1"
                    />
                    <InputError message={form.errors.number} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="canonical_book_title">Title</Label>
                    <Input
                        id="canonical_book_title"
                        value={form.data.title}
                        onChange={(event) =>
                            form.setData('title', event.target.value)
                        }
                        placeholder="Book title"
                    />
                    <InputError message={form.errors.title} />
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        type="button"
                        onClick={() =>
                            form.patch(updateHref, {
                                preserveScroll: true,
                            })
                        }
                        disabled={form.processing}
                    >
                        Save book identity
                    </Button>
                    {form.recentlySuccessful && (
                        <p className="text-sm text-muted-foreground">Saved.</p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

export default function BookCanonicalEdit({
    book,
    admin_identity_update_href,
    admin_entity,
}: BookCanonicalEditProps) {
    const canonicalFields = admin_entity.field_groups.identity;
    const canonicalMethods = admin_entity.methods_by_mode.canonical;
    const canonicalMode = admin_entity.edit_modes.canonical;
    const canonicalBrowseRegion = admin_entity.regions.find(
        (region) => region.key === 'canonical_browse',
    );
    useScriptureAdminTargetNavigation();
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: book.title,
            href: book.href,
        },
        {
            title: 'Canonical protected edit',
            href: book.admin_canonical_edit_href,
        },
    ];

    return (
        <ScriptureLayout
            title={`Canonical protected edit - ${book.title}`}
            breadcrumbs={breadcrumbs}
        >
            <ScripturePageIntroCard
                badges={
                    <>
                        <Badge variant="outline">Book</Badge>
                        <Badge variant="secondary">Canonical protected</Badge>
                    </>
                }
                title={`Canonical protected edit: ${book.title}`}
                description="Use this protected workflow for canonical book identity. Editorial copy, public blocks, and media assignments stay on their separate editorial surfaces."
                headerAction={
                    <Button asChild variant="outline" size="sm">
                        <Link href={book.admin_full_edit_href}>
                            <SquareArrowOutUpRight className="size-4" />
                            Back to Full edit
                        </Link>
                    </Button>
                }
            >
                <div className="rounded-2xl border border-amber-300/60 bg-amber-50/80 px-5 py-5 text-amber-950 sm:px-6 sm:py-6">
                    <div className="flex items-start gap-3">
                        <ShieldAlert className="mt-0.5 size-5 shrink-0" />
                        <div className="space-y-2">
                            <p className="text-sm font-semibold">
                                {canonicalMode.description}
                            </p>
                            {canonicalMode.warning && (
                                <p className="text-sm leading-6">
                                    {canonicalMode.warning}
                                </p>
                            )}
                            {canonicalBrowseRegion && (
                                <p className="text-sm leading-6">
                                    {canonicalBrowseRegion.description}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </ScripturePageIntroCard>

            <ScriptureSection
                adminTargetSection="identity"
                title="Canonical Identity"
                description="Slug, number, and title remain intentionally separate from editorial modules."
            >
                <BookIdentityEditorCard
                    book={book}
                    updateHref={admin_identity_update_href}
                />
            </ScriptureSection>

            <ScriptureSection
                title="Identity Field Contract"
                description="These are the canonical fields registered for the Book identity layer."
            >
                <div className="grid gap-4 lg:grid-cols-3">
                    {canonicalFields.map((field) => (
                        <Card key={field.key}>
                            <CardHeader className="gap-3">
                                <CardTitle className="text-base">
                                    {field.label}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ScriptureAdminFieldMeta field={field} showModes />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </ScriptureSection>

            <ScriptureSection
                title="Canonical Method Layer"
                description="These shared methods are attached from the registered Book schema and define what the protected canonical workflow can expose."
            >
                <ScriptureAdminMethodFamilyGrid
                    methods={canonicalMethods}
                    fields={admin_entity.fields}
                    emptyMessage="No canonical shared methods are registered yet."
                />
            </ScriptureSection>

            {canonicalBrowseRegion && (
                <ScriptureSection
                    adminTargetSection="canonical_browse"
                    title="Canonical Browse Structure"
                    description="Browse hierarchy behavior remains documented here and stays outside editorial workflows."
                >
                    <Card>
                        <CardHeader className="gap-3">
                            <div className="flex flex-wrap items-center gap-2">
                                <Badge
                                    variant="outline"
                                    className="font-mono text-[11px]"
                                >
                                    {canonicalBrowseRegion.key}
                                </Badge>
                                <Badge variant="outline">
                                    {canonicalBrowseRegion.surface}
                                </Badge>
                                {canonicalBrowseRegion.supported_modes.map(
                                    (mode) => (
                                        <Badge key={mode} variant="secondary">
                                            {admin_entity.edit_modes[mode].label}
                                        </Badge>
                                    ),
                                )}
                            </div>
                            <CardTitle>{canonicalBrowseRegion.label}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm leading-6 text-muted-foreground">
                                {canonicalBrowseRegion.description}
                            </p>
                            {canonicalBrowseRegion.help_text && (
                                <p className="text-sm leading-6 text-muted-foreground">
                                    {canonicalBrowseRegion.help_text}
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </ScriptureSection>
            )}
        </ScriptureLayout>
    );
}
