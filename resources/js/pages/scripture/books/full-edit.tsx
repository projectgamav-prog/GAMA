import { Link } from '@inertiajs/react';
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
import { BookDescriptionEditorCard } from '@/components/scripture/book/BookDescriptionEditorCard';
import { BookEditLayersSection } from '@/components/scripture/book/BookEditLayersSection';
import { BookRegisteredRegionContractSection } from '@/components/scripture/book/BookRegisteredRegionContractSection';
import { ScriptureAdminMethodFamilyGrid } from '@/components/scripture/scripture-admin-method-family-grid';
import { ScriptureAdminFieldMeta } from '@/components/scripture/scripture-admin-field-meta';
import { ScripturePageIntroCard } from '@/components/scripture/scripture-page-intro-card';
import { ScriptureSection } from '@/components/scripture/scripture-section';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useScriptureAdminTargetNavigation } from '@/hooks/use-scripture-admin-target-navigation';
import { getBookMediaSlotOptions } from '@/lib/book-media-slot-meta';
import ScriptureLayout from '@/layouts/scripture-layout';
import type {
    BookFullEditProps,
    BreadcrumbItem,
} from '@/types';

export default function BookFullEdit({
    book,
    admin_entity,
    admin_details_update_href,
    admin_content_block_store_href,
    admin_media_assignment_attach_href,
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
    const registeredFieldCountByMode = {
        contextual: registeredFields.filter((field) =>
            field.edit_modes.includes('contextual'),
        ).length,
        full: registeredFields.filter((field) =>
            field.edit_modes.includes('full'),
        ).length,
        canonical: registeredFields.filter((field) =>
            field.edit_modes.includes('canonical'),
        ).length,
    };
    const mediaSlotGuide = getBookMediaSlotOptions(
        fields.media_assignment_role.options,
    );
    useScriptureAdminTargetNavigation();
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

            <BookEditLayersSection
                adminEntity={admin_entity}
                registeredFieldCountByMode={registeredFieldCountByMode}
            />

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
                adminTargetSection="details"
                title="Page Intro Copy"
                description="Registered editorial copy for the canonical book surfaces."
                action={<Badge variant="outline">book_intro</Badge>}
            >
                <BookDescriptionEditorCard
                    bookDescription={book.description}
                    updateHref={admin_details_update_href}
                    field={fields.description}
                />
            </ScriptureSection>

            <ScriptureSection
                adminTargetSection="content_blocks"
                title="Editorial Block Regions"
                description="Structured Book text, quote, and image blocks live here. Use registered regions intentionally, and keep video out of raw content blocks."
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
                        mediaUrlField={fields.content_block_media_url}
                        altTextField={fields.content_block_alt_text}
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
                            mediaUrlField={fields.content_block_media_url}
                            altTextField={fields.content_block_alt_text}
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
                adminTargetSection="media_slots"
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
                        attachHref={admin_media_assignment_attach_href}
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

            <BookRegisteredRegionContractSection adminEntity={admin_entity} />
        </ScriptureLayout>
    );
}
