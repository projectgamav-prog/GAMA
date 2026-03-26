import { Link } from '@inertiajs/react';
import { ShieldAlert, SquareArrowOutUpRight } from 'lucide-react';
import { ScriptureAdminMethodFamilyGrid } from '@/components/scripture/scripture-admin-method-family-grid';
import { ScriptureAdminFieldMeta } from '@/components/scripture/scripture-admin-field-meta';
import { ScripturePageIntroCard } from '@/components/scripture/scripture-page-intro-card';
import { ScriptureSection } from '@/components/scripture/scripture-section';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ScriptureLayout from '@/layouts/scripture-layout';
import type { BookCanonicalEditProps, BreadcrumbItem } from '@/types';

const CANONICAL_FIELD_VALUES = (
    book: BookCanonicalEditProps['book'],
): Record<string, string> => ({
    canonical_slug: book.slug,
    canonical_number: book.number ?? 'Unnumbered',
    canonical_title: book.title,
});

export default function BookCanonicalEdit({
    book,
    admin_entity,
}: BookCanonicalEditProps) {
    const canonicalFields = admin_entity.field_groups.identity;
    const canonicalMethods = admin_entity.methods_by_mode.canonical;
    const fieldValues = CANONICAL_FIELD_VALUES(book);
    const canonicalMode = admin_entity.edit_modes.canonical;
    const canonicalBrowseRegion = admin_entity.regions.find(
        (region) => region.key === 'canonical_browse',
    );
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
                description="This workflow is reserved for canonical book identity and protected browse structure. In the current phase, those fields remain intentionally read-only."
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
                title="Protected Identity Fields"
                description="These fields define Book identity and stay explicitly separated from editorial forms."
            >
                <div className="grid gap-4 lg:grid-cols-3">
                    {canonicalFields.map((field) => (
                        <Card key={field.key}>
                            <CardHeader className="gap-3">
                                <CardTitle className="text-base">
                                    {field.label}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <ScriptureAdminFieldMeta
                                    field={field}
                                    showModes
                                />
                                <div className="rounded-xl border border-border/70 bg-muted/20 px-4 py-4">
                                    <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                                        Current value
                                    </p>
                                    <p className="mt-3 text-sm leading-7 break-words text-foreground">
                                        {fieldValues[field.key] ?? 'Not set'}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </ScriptureSection>

            <ScriptureSection
                title="Canonical Method Layer"
                description="These shared methods are attached from the registered Book schema and define what the protected canonical workflow is allowed to expose."
            >
                <ScriptureAdminMethodFamilyGrid
                    methods={canonicalMethods}
                    fields={admin_entity.fields}
                    emptyMessage="No canonical shared methods are registered yet."
                />
            </ScriptureSection>

            {canonicalBrowseRegion && (
                <ScriptureSection
                    title="Canonical Browse Structure"
                    description="Browse hierarchy behavior is documented here and kept outside contextual or editorial workflows."
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
                                            {
                                                admin_entity.edit_modes[mode]
                                                    .label
                                            }
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
