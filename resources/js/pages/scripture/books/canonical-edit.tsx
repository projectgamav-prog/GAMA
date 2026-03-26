import { Link } from '@inertiajs/react';
import { ShieldAlert, SquareArrowOutUpRight } from 'lucide-react';
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
    const fieldValues = CANONICAL_FIELD_VALUES(book);
    const canonicalMode = admin_entity.edit_modes.canonical;
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
                description="This workflow is reserved for canonical/core book data. In the current phase, those fields remain intentionally read-only."
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
                        </div>
                    </div>
                </div>
            </ScripturePageIntroCard>

            <ScriptureSection
                title="Protected Fields"
                description="These fields are registered as canonical/core sources and are intentionally separated from normal editorial forms."
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
                                    <p className="mt-3 break-words text-sm leading-7 text-foreground">
                                        {fieldValues[field.key] ?? 'Not set'}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </ScriptureSection>
        </ScriptureLayout>
    );
}
