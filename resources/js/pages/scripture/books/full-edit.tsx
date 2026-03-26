import { Link, useForm } from '@inertiajs/react';
import { ShieldAlert, SquareArrowOutUpRight } from 'lucide-react';
import { CreateBookContentBlockCard, BookContentBlockEditorCard, ProtectedContentBlockCard } from '@/components/scripture/book-admin-content-block-cards';
import { CreateBookMediaAssignmentCard, BookMediaAssignmentEditorCard } from '@/components/scripture/book-admin-media-assignment-cards';
import { BookAdminSourceLabel } from '@/components/scripture/book-admin-source-label';
import { ScriptureAdminFieldMeta } from '@/components/scripture/scripture-admin-field-meta';
import { ScripturePageIntroCard } from '@/components/scripture/scripture-page-intro-card';
import { ScriptureSection } from '@/components/scripture/scripture-section';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
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
                <CardTitle>Book Description</CardTitle>
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
                contentClassName="space-y-5"
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
            </ScripturePageIntroCard>

            <ScriptureSection
                title="Edit Layers"
                description="The Book entity is registered across three intentional edit layers."
            >
                <div className="grid gap-4 lg:grid-cols-3">
                    {(['contextual', 'full', 'canonical'] as const).map(
                        (modeKey) => {
                            const mode = admin_entity.edit_modes[modeKey];

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
                                    </CardContent>
                                </Card>
                            );
                        },
                    )}
                </div>
            </ScriptureSection>

            <ScriptureSection
                title="Book Identity"
                description="Canonical/core fields stay separated from editorial changes and remain read-only in this phase."
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
                                          ? book.number ?? 'Unnumbered'
                                          : book.title}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </ScriptureSection>

            <ScriptureSection
                title="Editorial Fields"
                description="Registered book-level editorial fields that are safe for contextual and full editing."
            >
                <BookDescriptionEditorCard
                    bookDescription={book.description}
                    updateHref={admin_details_update_href}
                    field={fields.description}
                />
            </ScriptureSection>

            <ScriptureSection
                title="Content Blocks"
                description="Registered book-owned editorial blocks. Legacy or unregistered block types remain visible but protected."
                action={
                    <Badge variant="outline">
                        {admin_content_blocks.length} editable
                    </Badge>
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
                title="Media Slots"
                description="Structured media attachments are managed through registered slots instead of raw database discovery."
            >
                <div className="space-y-4">
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
                            captionField={fields.media_assignment_caption_override}
                            sortOrderField={fields.media_assignment_sort_order}
                            statusField={fields.media_assignment_status}
                            availableMedia={available_media}
                        />
                    ))}
                </div>
            </ScriptureSection>

            <ScriptureSection
                title="Public Region Map"
                description="Only registered public regions participate in contextual, full, or canonical workflows."
            >
                <div className="space-y-4">
                    {admin_entity.regions.map((region: ScriptureRegisteredAdminRegion) => (
                        <Card key={region.key}>
                            <CardHeader className="gap-3">
                                <div className="flex flex-wrap items-center gap-2">
                                    <Badge variant="outline">{region.surface}</Badge>
                                    {region.capability_hint && (
                                        <Badge variant="secondary">
                                            {region.capability_hint}
                                        </Badge>
                                    )}
                                </div>
                                <CardTitle>{region.label}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-sm leading-6 text-muted-foreground">
                                    {region.description}
                                </p>
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
                                        {region.contextual_fields.length > 0 ? (
                                            region.contextual_fields.map((field) => (
                                                <ScriptureAdminFieldMeta
                                                    key={`${region.key}-${field.key}-contextual`}
                                                    field={field}
                                                />
                                            ))
                                        ) : (
                                            <p className="text-sm text-muted-foreground">
                                                No contextual fields registered.
                                            </p>
                                        )}
                                    </div>
                                    <div className="space-y-3">
                                        <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                                            Full editorial
                                        </p>
                                        {region.full_fields.length > 0 ? (
                                            region.full_fields.map((field) => (
                                                <ScriptureAdminFieldMeta
                                                    key={`${region.key}-${field.key}-full`}
                                                    field={field}
                                                />
                                            ))
                                        ) : (
                                            <p className="text-sm text-muted-foreground">
                                                No full-editor fields registered.
                                            </p>
                                        )}
                                    </div>
                                    <div className="space-y-3">
                                        <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                                            Canonical protected
                                        </p>
                                        {region.canonical_fields.length > 0 ? (
                                            region.canonical_fields.map((field) => (
                                                <ScriptureAdminFieldMeta
                                                    key={`${region.key}-${field.key}-canonical`}
                                                    field={field}
                                                />
                                            ))
                                        ) : (
                                            <p className="text-sm text-muted-foreground">
                                                No canonical fields registered.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </ScriptureSection>
        </ScriptureLayout>
    );
}
