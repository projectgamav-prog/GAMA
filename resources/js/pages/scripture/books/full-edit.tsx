import { Link, useForm } from '@inertiajs/react';
import { ShieldAlert, SquareArrowOutUpRight } from 'lucide-react';
import {
    CreateBookContentBlockCard,
    BookContentBlockEditorCard,
    ProtectedContentBlockCard,
} from '@/components/scripture/book-admin-content-block-cards';
import {
    CreateBookMediaAssignmentCard,
    BookMediaAssignmentEditorCard,
} from '@/components/scripture/book-admin-media-assignment-cards';
import { ScriptureAdminMethodFamilyGrid } from '@/components/scripture/scripture-admin-method-family-grid';
import { BookAdminSourceLabel } from '@/components/scripture/book-admin-source-label';
import { ScriptureAdminFieldMeta } from '@/components/scripture/scripture-admin-field-meta';
import { ScripturePageIntroCard } from '@/components/scripture/scripture-page-intro-card';
import { ScriptureSection } from '@/components/scripture/scripture-section';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { scriptureAdminStartCase } from '@/lib/scripture-admin-field-display';
import { getBookMediaSlotOptions } from '@/lib/book-media-slot-meta';
import ScriptureLayout from '@/layouts/scripture-layout';
import type {
    BookFullEditProps,
    BreadcrumbItem,
    ScriptureRegisteredAdminField,
    ScriptureRegisteredAdminRegion,
} from '@/types';

type BookDetailsFormData = {
    description: string;
};

function BookDescriptionEditorCard({
    bookDescription,
    updateHref,
    field,
}: {
    bookDescription: string | null | undefined;
    updateHref: string;
    field: ScriptureRegisteredAdminField;
}) {
    const form = useForm<BookDetailsFormData>({
        description: bookDescription ?? '',
    });

    return (
        <Card id="details-editor">
            <CardHeader className="gap-3">
                <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline">Editorial</Badge>
                    <Badge variant="secondary">Contextual + full</Badge>
                </div>
                <CardTitle>Public Description</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
                <div className="grid gap-2">
                    <BookAdminSourceLabel
                        field={field}
                        htmlFor="book_full_description"
                    />
                    <Textarea
                        id="book_full_description"
                        value={form.data.description}
                        onChange={(event) =>
                            form.setData('description', event.target.value)
                        }
                        rows={8}
                        placeholder="Editorial introduction for the public book surfaces."
                    />
                    <InputError message={form.errors.description} />
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
                        Save description
                    </Button>
                    {form.recentlySuccessful && (
                        <p className="text-sm text-muted-foreground">Saved.</p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

export default function BookFullEdit({
    book,
    admin_entity,
    admin_details_update_href,
    admin_content_block_store_href,
    admin_media_assignment_store_href,
    next_content_block_sort_order,
    next_media_assignment_sort_order,
    admin_content_blocks,
    protected_content_blocks,
    admin_media_assignments,
    available_media,
}: BookFullEditProps) {
    const fields = admin_entity.fields;
    const registeredFields = Object.values(fields);
    const mediaSlotGuide = getBookMediaSlotOptions(
        fields.media_assignment_role.options,
    );
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: book.title,
            href: book.href,
        },
        {
            title: 'Full edit',
            href: book.admin_full_edit_href,
        },
    ];

    return (
        <ScriptureLayout
            title={`Full edit - ${book.title}`}
            breadcrumbs={breadcrumbs}
        >
            <ScripturePageIntroCard
                badges={
                    <>
                        <Badge variant="outline">Book</Badge>
                        <Badge variant="secondary">Schema-driven admin</Badge>
                    </>
                }
                title={`Full edit: ${book.title}`}
                description="This workspace separates canonical identity from editorial/supporting data and only exposes fields that were intentionally registered."
                headerAction={
                    <>
                        <Button asChild variant="outline" size="sm">
                            <Link href={book.admin_canonical_edit_href}>
                                <ShieldAlert className="size-4" />
                                Canonical protected edit
                            </Link>
                        </Button>
                        <Button asChild variant="outline" size="sm">
                            <Link href={book.href}>
                                <SquareArrowOutUpRight className="size-4" />
                                Back to book page
                            </Link>
                        </Button>
                    </>
                }
                contentClassName="grid gap-4 xl:grid-cols-[1.2fr_0.9fr]"
            >
                <div className="rounded-2xl border border-border/70 bg-muted/20 px-5 py-5 sm:px-6 sm:py-6">
                    <p className="text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">
                        Protected structure
                    </p>
                    <p className="mt-4 text-sm leading-7 text-muted-foreground">
                        Contextual edit is the fast public-page path. Full
                        editorial edit handles registered supporting schema.
                        Canonical protected edit stays separate for core book
                        identity.
                    </p>
                </div>
                <div className="rounded-2xl border border-border/70 bg-muted/20 px-5 py-5 sm:px-6 sm:py-6">
                    <p className="text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">
                        Reference entity
                    </p>
                    <p className="mt-4 text-sm leading-7 text-muted-foreground">
                        {admin_entity.notes}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                        <Badge variant="outline">
                            {registeredFields.length} registered fields
                        </Badge>
                        <Badge variant="outline">
                            {admin_entity.regions.length} registered regions
                        </Badge>
                        <Badge variant="outline">3 edit layers</Badge>
                    </div>
                </div>
            </ScripturePageIntroCard>

            <ScriptureSection
                title="Edit Layers"
                description="Book is the reference entity for contextual, full editorial, and canonical protected separation."
            >
                <div className="grid gap-4 lg:grid-cols-3">
                    {(['contextual', 'full', 'canonical'] as const).map(
                        (modeKey) => {
                            const mode = admin_entity.edit_modes[modeKey];
                            const fieldCount = registeredFields.filter(
                                (field) => field.edit_modes.includes(modeKey),
                            ).length;
                            const regionCount = admin_entity.regions.filter(
                                (region) =>
                                    region.supported_modes.includes(modeKey),
                            ).length;
                            const methodCount =
                                admin_entity.methods_by_mode[modeKey].length;

                            return (
                                <Card key={mode.key}>
                                    <CardHeader className="gap-3">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <Badge variant="outline">
                                                {mode.status}
                                            </Badge>
                                        </div>
                                        <CardTitle>{mode.label}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3 text-sm leading-6 text-muted-foreground">
                                        <p>{mode.description}</p>
                                        {mode.warning && <p>{mode.warning}</p>}
                                        <div className="flex flex-wrap gap-2 pt-1">
                                            <Badge variant="outline">
                                                {fieldCount} fields
                                            </Badge>
                                            <Badge variant="outline">
                                                {regionCount} regions
                                            </Badge>
                                            <Badge variant="outline">
                                                {methodCount} methods
                                            </Badge>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        },
                    )}
                </div>
            </ScriptureSection>

            <ScriptureSection
                title="Shared Method Layer"
                description="These registry-compiled methods are the reusable CMS engine Book now exposes as the first proof entity."
            >
                <div className="space-y-6">
                    {(['contextual', 'full', 'canonical'] as const).map(
                        (modeKey) => (
                            <div key={modeKey} className="space-y-4">
                                <div className="flex flex-wrap items-center gap-2">
                                    <Badge variant="secondary">
                                        {admin_entity.edit_modes[modeKey].label}
                                    </Badge>
                                    <Badge variant="outline">
                                        {
                                            admin_entity.methods_by_mode[
                                                modeKey
                                            ].length
                                        }{' '}
                                        methods
                                    </Badge>
                                </div>
                                <ScriptureAdminMethodFamilyGrid
                                    methods={
                                        admin_entity.methods_by_mode[modeKey]
                                    }
                                    fields={fields}
                                    emptyMessage="No shared methods are registered for this edit layer yet."
                                />
                            </div>
                        ),
                    )}
                </div>
            </ScriptureSection>

            <ScriptureSection
                title="Canonical Identity"
                description="Protected core identity and browse anchors stay visible here for reference, but remain outside routine editorial editing."
                action={<Badge variant="outline">3 protected fields</Badge>}
            >
                <div className="grid gap-4 lg:grid-cols-3">
                    {admin_entity.field_groups.identity.map((field) => (
                        <Card key={field.key}>
                            <CardHeader className="gap-3">
                                <CardTitle className="text-base">
                                    {field.label}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <ScriptureAdminFieldMeta field={field} />
                                <div className="rounded-xl border border-border/70 bg-muted/20 px-4 py-4 text-sm leading-7">
                                    {field.key === 'canonical_slug'
                                        ? book.slug
                                        : field.key === 'canonical_number'
                                          ? (book.number ?? 'Unnumbered')
                                          : book.title}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </ScriptureSection>

            <ScriptureSection
                title="Page Intro Copy"
                description="Registered editorial copy for the shared public page intro region on the Book overview and show pages."
                action={<Badge variant="outline">book_intro</Badge>}
            >
                <BookDescriptionEditorCard
                    bookDescription={book.description}
                    updateHref={admin_details_update_href}
                    field={fields.description}
                />
            </ScriptureSection>

            <ScriptureSection
                id="content-blocks"
                title="Editorial Block Regions"
                description="Structured long-form Book copy lives here. Use registered regions intentionally, and keep video out of raw content blocks."
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
                    <CreateBookContentBlockCard
                        storeHref={admin_content_block_store_href}
                        nextSortOrder={next_content_block_sort_order}
                        blockTypeField={fields.content_block_type}
                        titleField={fields.content_block_title}
                        bodyField={fields.content_block_body}
                        regionField={fields.content_block_region}
                        sortOrderField={fields.content_block_sort_order}
                        statusField={fields.content_block_status}
                    />

                    {admin_content_blocks.map((block) => (
                        <BookContentBlockEditorCard
                            key={block.id}
                            block={block}
                            blockTypeField={fields.content_block_type}
                            titleField={fields.content_block_title}
                            bodyField={fields.content_block_body}
                            regionField={fields.content_block_region}
                            sortOrderField={fields.content_block_sort_order}
                            statusField={fields.content_block_status}
                        />
                    ))}

                    {protected_content_blocks.map((block) => (
                        <ProtectedContentBlockCard
                            key={block.id}
                            block={block}
                        />
                    ))}
                </div>
            </ScriptureSection>

            <ScriptureSection
                id="media-slots"
                title="Public Media Slots"
                description="Registered slots make Book media behavior explicit across library cards, overview pages, and supporting media cards."
                action={
                    <Badge variant="outline">
                        {admin_media_assignments.length} assignments
                    </Badge>
                }
            >
                <div className="space-y-4">
                    <div className="grid gap-4 lg:grid-cols-3">
                        {mediaSlotGuide.map((slot) => (
                            <Card key={slot.role}>
                                <CardHeader className="gap-3">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <Badge variant="secondary">
                                            {slot.label}
                                        </Badge>
                                        <Badge
                                            variant="outline"
                                            className="font-mono text-[11px]"
                                        >
                                            {slot.role}
                                        </Badge>
                                    </div>
                                    <CardTitle className="text-base">
                                        {slot.label}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm leading-6 text-muted-foreground">
                                        {slot.description}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <CreateBookMediaAssignmentCard
                        storeHref={admin_media_assignment_store_href}
                        nextSortOrder={next_media_assignment_sort_order}
                        mediaField={fields.media_assignment_media_id}
                        roleField={fields.media_assignment_role}
                        titleField={fields.media_assignment_title_override}
                        captionField={fields.media_assignment_caption_override}
                        sortOrderField={fields.media_assignment_sort_order}
                        statusField={fields.media_assignment_status}
                        availableMedia={available_media}
                    />

                    {admin_media_assignments.map((assignment) => (
                        <BookMediaAssignmentEditorCard
                            key={assignment.id}
                            assignment={assignment}
                            mediaField={fields.media_assignment_media_id}
                            roleField={fields.media_assignment_role}
                            titleField={fields.media_assignment_title_override}
                            captionField={
                                fields.media_assignment_caption_override
                            }
                            sortOrderField={fields.media_assignment_sort_order}
                            statusField={fields.media_assignment_status}
                            availableMedia={available_media}
                        />
                    ))}
                </div>
            </ScriptureSection>

            <ScriptureSection
                title="Registered Region Contract"
                description="These regions define what each edit layer can touch, what surface each region serves, and where Book content is allowed to live."
            >
                <div className="space-y-4">
                    {admin_entity.regions.map(
                        (region: ScriptureRegisteredAdminRegion) => (
                            <Card key={region.key}>
                                <CardHeader className="gap-3">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <Badge
                                            variant="outline"
                                            className="font-mono text-[11px]"
                                        >
                                            {region.key}
                                        </Badge>
                                        <Badge variant="outline">
                                            {region.surface}
                                        </Badge>
                                    </div>
                                    <CardTitle>{region.label}</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <p className="text-sm leading-6 text-muted-foreground">
                                        {region.description}
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {region.supported_modes.map((mode) => (
                                            <Badge
                                                key={mode}
                                                variant="secondary"
                                            >
                                                {
                                                    admin_entity.edit_modes[
                                                        mode
                                                    ].label
                                                }
                                            </Badge>
                                        ))}
                                        {region.method_families.map(
                                            (family) => (
                                                <Badge
                                                    key={`${region.key}-${family}`}
                                                    variant="outline"
                                                >
                                                    {scriptureAdminStartCase(
                                                        family,
                                                    )}
                                                </Badge>
                                            ),
                                        )}
                                    </div>
                                    {region.help_text && (
                                        <p className="text-sm leading-6 text-muted-foreground">
                                            {region.help_text}
                                        </p>
                                    )}
                                    <div className="grid gap-4 lg:grid-cols-3">
                                        <div className="space-y-3">
                                            <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                                                Contextual
                                            </p>
                                            {region.contextual_fields.length >
                                            0 ? (
                                                region.contextual_fields.map(
                                                    (field) => (
                                                        <ScriptureAdminFieldMeta
                                                            key={`${region.key}-${field.key}-contextual`}
                                                            field={field}
                                                        />
                                                    ),
                                                )
                                            ) : (
                                                <p className="text-sm text-muted-foreground">
                                                    This region is not editable
                                                    in contextual mode.
                                                </p>
                                            )}
                                        </div>
                                        <div className="space-y-3">
                                            <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                                                Full editorial
                                            </p>
                                            {region.full_fields.length > 0 ? (
                                                region.full_fields.map(
                                                    (field) => (
                                                        <ScriptureAdminFieldMeta
                                                            key={`${region.key}-${field.key}-full`}
                                                            field={field}
                                                        />
                                                    ),
                                                )
                                            ) : (
                                                <p className="text-sm text-muted-foreground">
                                                    This region is not editable
                                                    in full editorial mode.
                                                </p>
                                            )}
                                        </div>
                                        <div className="space-y-3">
                                            <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                                                Canonical protected
                                            </p>
                                            {region.canonical_fields.length >
                                            0 ? (
                                                region.canonical_fields.map(
                                                    (field) => (
                                                        <ScriptureAdminFieldMeta
                                                            key={`${region.key}-${field.key}-canonical`}
                                                            field={field}
                                                        />
                                                    ),
                                                )
                                            ) : (
                                                <p className="text-sm text-muted-foreground">
                                                    This region is not editable
                                                    in canonical mode.
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ),
                    )}
                </div>
            </ScriptureSection>
        </ScriptureLayout>
    );
}
