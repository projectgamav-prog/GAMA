import { Link, useForm } from '@inertiajs/react';
import { Plus, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import InputError from '@/components/input-error';
import {
    findAvailableMedia,
    MediaPreviewCard,
    MediaSelectionSummary,
    resolveMediaPickerLabel,
} from '@/components/scripture/media-assignments/MediaPickerDisplay';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { defineAdminModule } from '@/admin/core/module-registry';
import type { AdminModuleComponentProps } from '@/admin/core/module-types';
import {
    getActiveBookMediaSlotRoles,
    getBookMediaSlotMeta,
} from '@/lib/book-media-slot-meta';
import { buildScriptureAdminSectionHref } from '@/lib/scripture-admin-navigation';
import type {
    ScriptureAdminMediaAssignment,
    ScriptureAdminMediaSummary,
} from '@/types';
import { getMediaSlotsContractMetadata } from '@/admin/surfaces/core/contract-readers';

type MediaAssignmentFormData = {
    media_id: string;
    role: string;
    title_override: string;
    caption_override: string;
    sort_order: string;
    status: 'draft' | 'published';
};

function buildCreateMediaAssignmentData(
    role: string,
    nextSortOrder: number,
    availableMedia: ScriptureAdminMediaSummary[],
): MediaAssignmentFormData {
    return {
        media_id: availableMedia[0] ? String(availableMedia[0].id) : '',
        role,
        title_override: '',
        caption_override: '',
        sort_order: String(nextSortOrder),
        status: 'draft',
    };
}

function buildExistingMediaAssignmentData(
    assignment: ScriptureAdminMediaAssignment,
): MediaAssignmentFormData {
    return {
        media_id: String(assignment.media_id),
        role: assignment.role,
        title_override: assignment.title_override ?? '',
        caption_override: assignment.caption_override ?? '',
        sort_order: String(assignment.sort_order),
        status: assignment.status,
    };
}

function toInlineAttachPayload(data: MediaAssignmentFormData) {
    return {
        media_id: Number(data.media_id),
        role: data.role,
    };
}

function toInlineReplacePayload(data: MediaAssignmentFormData) {
    return {
        media_id: Number(data.media_id),
    };
}

function MediaSlotPurposeCard({
    role,
    compact = false,
}: {
    role: string;
    compact?: boolean;
}) {
    const slot = getBookMediaSlotMeta(role);

    return (
        <div className="rounded-xl border border-border/70 bg-muted/20 px-4 py-4">
            <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{slot.label}</Badge>
                <Badge variant="outline" className="font-mono text-[11px]">
                    {role}
                </Badge>
            </div>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {compact
                    ? slot.description
                    : `${slot.description} Use Full edit for title/caption overrides, sort order, publish state, and other advanced slot settings.`}
            </p>
        </div>
    );
}

function QuickAttachMediaCard({
    role,
    attachHref,
    nextSortOrder,
    availableMedia,
}: {
    role: string;
    attachHref: string;
    nextSortOrder: number;
    availableMedia: ScriptureAdminMediaSummary[];
}) {
    const [isOpen, setIsOpen] = useState(false);
    const slot = getBookMediaSlotMeta(role);
    const form = useForm<MediaAssignmentFormData>(
        buildCreateMediaAssignmentData(role, nextSortOrder, availableMedia),
    );
    const selectedMedia = findAvailableMedia(availableMedia, form.data.media_id);

    useEffect(() => {
        if (isOpen || form.processing || form.isDirty) {
            return;
        }

        form.setData(buildCreateMediaAssignmentData(role, nextSortOrder, availableMedia));
        form.clearErrors();
    }, [availableMedia, form, isOpen, nextSortOrder, role]);

    return (
        <Card className="border-dashed">
            <CardHeader className="gap-3">
                <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline">Quick attach</Badge>
                    <Badge variant="secondary">{slot.label}</Badge>
                </div>
                <CardTitle>{`Attach ${slot.label}`}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-sm leading-6 text-muted-foreground">
                    Attach media directly here for the common case. New inline
                    attachments start as drafts; use Full edit for publish
                    state, overrides, and other slot settings.
                </p>

                {!isOpen ? (
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsOpen(true)}
                        disabled={availableMedia.length === 0}
                    >
                        <Plus className="size-4" />
                        {`Attach ${slot.label}`}
                    </Button>
                ) : availableMedia.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-border/80 px-4 py-4 text-sm leading-6 text-muted-foreground">
                        No media records are available yet. Add media to the
                        library first, then attach it here.
                    </div>
                ) : (
                    <>
                        <div className="grid gap-2">
                            <Label htmlFor={`book_media_quick_create_${role}`}>
                                Media
                            </Label>
                            <Select
                                value={form.data.media_id}
                                onValueChange={(value) =>
                                    form.setData('media_id', value)
                                }
                            >
                                <SelectTrigger
                                    id={`book_media_quick_create_${role}`}
                                    className="w-full"
                                >
                                    <SelectValue placeholder="Choose media" />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableMedia.map((media) => (
                                        <SelectItem
                                            key={media.id}
                                            value={String(media.id)}
                                        >
                                            {resolveMediaPickerLabel(media)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-xs leading-5 text-muted-foreground">
                                Pick an existing media record. The selector now
                                includes type and source cues to make large
                                media lists easier to scan.
                            </p>
                            <InputError message={form.errors.media_id} />
                        </div>

                        <MediaSelectionSummary
                            media={selectedMedia}
                            label="Choose a media record to preview it before attaching."
                        />

                        <MediaPreviewCard
                            media={selectedMedia}
                            fallbackLabel={slot.label}
                        />

                        <MediaSlotPurposeCard role={role} compact />

                        <div className="flex flex-wrap gap-2">
                            <Button
                                type="button"
                                onClick={() => {
                                    form.transform(toInlineAttachPayload);
                                    form.post(attachHref, {
                                        preserveScroll: true,
                                        preserveState: true,
                                        onSuccess: () => {
                                            form.setData(
                                                buildCreateMediaAssignmentData(
                                                    role,
                                                    nextSortOrder,
                                                    availableMedia,
                                                ),
                                            );
                                            form.clearErrors();
                                            setIsOpen(false);
                                        },
                                    });
                                }}
                                disabled={
                                    form.processing || !form.data.media_id
                                }
                            >
                                Attach media
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    form.setData(
                                        buildCreateMediaAssignmentData(
                                            role,
                                            nextSortOrder,
                                            availableMedia,
                                        ),
                                    );
                                    form.clearErrors();
                                    setIsOpen(false);
                                }}
                                disabled={form.processing}
                            >
                                Cancel
                            </Button>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
}

function MediaAssignmentInlineCard({
    assignment,
    availableMedia,
    fullEditHref,
}: {
    assignment: ScriptureAdminMediaAssignment;
    availableMedia: ScriptureAdminMediaSummary[];
    fullEditHref: string;
}) {
    const [isEditing, setIsEditing] = useState(false);
    const form = useForm<MediaAssignmentFormData>(
        buildExistingMediaAssignmentData(assignment),
    );
    const assignmentSlot = getBookMediaSlotMeta(assignment.role);
    const selectedMedia =
        findAvailableMedia(availableMedia, form.data.media_id) ?? assignment.media;
    const hasOverrides = Boolean(
        assignment.title_override?.trim() || assignment.caption_override?.trim(),
    );

    useEffect(() => {
        form.setData(buildExistingMediaAssignmentData(assignment));
        form.clearErrors();
        setIsEditing(false);
    }, [assignment, form]);

    return (
        <Card id={`book-media-assignment-${assignment.id}`}>
            <CardHeader className="gap-3">
                <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">{assignmentSlot.label}</Badge>
                    <Badge variant="outline" className="font-mono text-[11px]">
                        {assignment.role}
                    </Badge>
                    <Badge variant="outline">{assignment.status}</Badge>
                    {selectedMedia && (
                        <Badge variant="outline">
                            {selectedMedia.media_type}
                        </Badge>
                    )}
                    {hasOverrides && (
                        <Badge variant="outline">Has overrides</Badge>
                    )}
                </div>
                <CardTitle>
                    {assignment.title_override ??
                        assignment.media?.title ??
                        `${assignmentSlot.label} slot`}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <MediaPreviewCard
                    media={selectedMedia}
                    title={assignment.title_override}
                    caption={assignment.caption_override}
                    fallbackLabel={assignmentSlot.label}
                />

                <MediaSlotPurposeCard role={assignment.role} compact />

                {isEditing ? (
                    <>
                        <div className="grid gap-2">
                            <Label htmlFor={`book_media_replace_${assignment.id}`}>
                                Replace with media
                            </Label>
                            <Select
                                value={form.data.media_id}
                                onValueChange={(value) =>
                                    form.setData('media_id', value)
                                }
                            >
                                <SelectTrigger
                                    id={`book_media_replace_${assignment.id}`}
                                    className="w-full"
                                >
                                    <SelectValue placeholder="Choose media" />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableMedia.map((media) => (
                                        <SelectItem
                                            key={media.id}
                                            value={String(media.id)}
                                        >
                                            {resolveMediaPickerLabel(media)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-xs leading-5 text-muted-foreground">
                                Replace the current slot with another existing
                                media record. Title/caption overrides and other
                                advanced slot settings stay unchanged.
                            </p>
                            <InputError message={form.errors.media_id} />
                        </div>

                        <MediaSelectionSummary
                            media={findAvailableMedia(
                                availableMedia,
                                form.data.media_id,
                            )}
                            label="Choose a media record to preview the replacement before saving."
                        />

                        <MediaPreviewCard
                            media={findAvailableMedia(
                                availableMedia,
                                form.data.media_id,
                            )}
                            fallbackLabel={assignmentSlot.label}
                        />

                        <div className="flex flex-wrap gap-2">
                            <Button
                                type="button"
                                onClick={() => {
                                    form.transform(toInlineReplacePayload);
                                    form.patch(
                                        assignment.replace_media_href ??
                                            assignment.update_href,
                                        {
                                            preserveScroll: true,
                                            preserveState: true,
                                            onSuccess: () => {
                                                form.clearErrors();
                                                setIsEditing(false);
                                            },
                                        },
                                    );
                                }}
                                disabled={
                                    form.processing || !form.data.media_id
                                }
                            >
                                Save media
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    form.setData(
                                        buildExistingMediaAssignmentData(
                                            assignment,
                                        ),
                                    );
                                    form.clearErrors();
                                    setIsEditing(false);
                                }}
                                disabled={form.processing}
                            >
                                Cancel
                            </Button>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-wrap gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsEditing(true)}
                            disabled={availableMedia.length === 0}
                        >
                            Replace media
                        </Button>
                        <Button asChild type="button" variant="outline">
                            <Link href={fullEditHref}>Full edit</Link>
                        </Button>
                        {assignment.destroy_href && (
                            <Button
                                type="button"
                                variant="destructive"
                                onClick={() =>
                                    form.delete(assignment.destroy_href!, {
                                        preserveScroll: true,
                                        preserveState: true,
                                    })
                                }
                                disabled={form.processing}
                            >
                                <Trash2 className="size-4" />
                                Remove
                            </Button>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function MediaSlotsEditor({
    surface,
    activation,
}: AdminModuleComponentProps) {
    const metadata = getMediaSlotsContractMetadata(surface);
    const summary = useMemo(() => {
        const publishedCount =
            metadata?.assignments.filter(
                (assignment) => assignment.status === 'published',
            ).length ?? 0;

        return {
            total: metadata?.assignments.length ?? 0,
            published: publishedCount,
        };
    }, [metadata]);

    if (metadata === null || !activation.isActive) {
        return null;
    }

    const fullEditHref = buildScriptureAdminSectionHref(
        metadata.fullEditHref,
        'media_slots',
    );
    const activeSlotRoles = getActiveBookMediaSlotRoles();
    const heroAssignment = metadata.assignments.find(
        (assignment) => assignment.role === 'hero_media',
    );
    const showHeroQuickAttach = heroAssignment === undefined;

    return (
        <div className="basis-full pt-2">
            <div className="space-y-4 rounded-2xl border border-border/70 bg-background/95 px-4 py-4 shadow-sm sm:px-5">
                <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline">Media slots</Badge>
                        <Badge variant="secondary">
                            {summary.total} assignments
                        </Badge>
                        <Badge variant="outline">
                            {summary.published} published
                        </Badge>
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-base font-semibold">
                            Book media slots
                        </h3>
                        <p className="text-sm leading-6 text-muted-foreground">
                            Attach, replace, or remove book media directly on
                            the public media surface. Use Full edit for title or
                            caption overrides, publish state, sort order, and
                            other advanced slot behavior.
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2 border-t pt-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={activation.deactivate}
                    >
                        Close
                    </Button>
                    <Button asChild variant="outline">
                        <Link href={fullEditHref}>Full edit</Link>
                    </Button>
                </div>

                {metadata.availableMedia.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-border/80 px-5 py-5 text-sm leading-6 text-muted-foreground">
                        No media records are available yet. Add media to the
                        library first, then return here to attach it inline.
                    </div>
                ) : (
                    <div className="grid gap-4 lg:grid-cols-2">
                        {showHeroQuickAttach && (
                            <QuickAttachMediaCard
                                role="hero_media"
                                attachHref={metadata.attachHref}
                                nextSortOrder={metadata.nextSortOrder}
                                availableMedia={metadata.availableMedia}
                            />
                        )}
                        {activeSlotRoles.includes('supporting_media') && (
                            <QuickAttachMediaCard
                                role="supporting_media"
                                attachHref={metadata.attachHref}
                                nextSortOrder={metadata.nextSortOrder}
                                availableMedia={metadata.availableMedia}
                            />
                        )}
                    </div>
                )}

                {metadata.assignments.length > 0 ? (
                    <div className="space-y-4">
                        {metadata.assignments.map((assignment) => (
                            <MediaAssignmentInlineCard
                                key={assignment.id}
                                assignment={assignment}
                                availableMedia={metadata.availableMedia}
                                fullEditHref={fullEditHref}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="rounded-2xl border border-dashed border-border/80 px-5 py-5 text-sm leading-6 text-muted-foreground">
                        No media slots are attached yet. Start with a quick
                        attach above, or open Full edit if you need the advanced
                        book media workflow first.
                    </div>
                )}
            </div>
        </div>
    );
}

export const mediaSlotsEditorModule = defineAdminModule({
    key: 'book-media-slots-editor',
    contractKeys: 'media_slots',
    entityScope: 'book',
    surfaceSlots: 'inline_editor',
    requiredCapabilities: ['edit'],
    actions: [
        {
            actionKey: 'edit_media',
            placement: 'inline',
            openMode: 'inline',
            priority: 40,
        },
    ],
    qualifies: (surface) => getMediaSlotsContractMetadata(surface) !== null,
    EditorComponent: MediaSlotsEditor,
    order: 40,
    description:
        'Renders the book media-slot assignment editor on the public book detail page.',
});
