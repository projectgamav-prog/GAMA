import { useForm } from '@inertiajs/react';
import { Plus, Trash2 } from 'lucide-react';
import { useEffect } from 'react';
import { MediaAssignmentMetaFields } from '@/components/scripture/media-assignments/MediaAssignmentMetaFields';
import { MediaAssignmentOverrideFields } from '@/components/scripture/media-assignments/MediaAssignmentOverrideFields';
import { MediaAssignmentSelectFields } from '@/components/scripture/media-assignments/MediaAssignmentSelectFields';
import {
    findAvailableMedia,
    MediaPreviewCard,
    MediaSelectionSummary,
} from '@/components/scripture/media-assignments/MediaPickerDisplay';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    getDefaultBookMediaSlotRole,
    getBookMediaSlotMeta,
    getBookMediaSlotOptions,
} from '@/lib/book-media-slot-meta';
import type {
    ScriptureAdminMediaAssignment,
    ScriptureAdminMediaSummary,
    ScriptureRegisteredAdminField,
} from '@/types';

type MediaAssignmentFormData = {
    media_id: string;
    role: string;
    title_override: string;
    caption_override: string;
    sort_order: string;
    status: 'draft' | 'published';
};

type SharedProps = {
    mediaField: ScriptureRegisteredAdminField;
    roleField: ScriptureRegisteredAdminField;
    titleField: ScriptureRegisteredAdminField;
    captionField: ScriptureRegisteredAdminField;
    sortOrderField: ScriptureRegisteredAdminField;
    statusField: ScriptureRegisteredAdminField;
    availableMedia: ScriptureAdminMediaSummary[];
};

function buildCreateMediaAssignmentData(
    availableMedia: ScriptureAdminMediaSummary[],
    role: string,
    nextSortOrder: number,
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
                    : `${slot.description} Quick attach and replace keep advanced slot settings unchanged. Use the advanced save path below when updating overrides, publish state, or sort order.`}
            </p>
        </div>
    );
}

export function CreateBookMediaAssignmentCard({
    attachHref,
    storeHref,
    nextSortOrder,
    mediaField,
    roleField,
    titleField,
    captionField,
    sortOrderField,
    statusField,
    availableMedia,
}: SharedProps & {
    attachHref?: string;
    storeHref: string;
    nextSortOrder: number;
}) {
    const slotOptions = getBookMediaSlotOptions(roleField.options);
    const defaultRole = getDefaultBookMediaSlotRole(roleField.options);

    const form = useForm<MediaAssignmentFormData>(
        buildCreateMediaAssignmentData(
            availableMedia,
            defaultRole,
            nextSortOrder,
        ),
    );
    const selectedMedia = findAvailableMedia(
        availableMedia,
        form.data.media_id,
    );
    const quickAttachIgnoresAdvancedValues =
        form.data.title_override.trim() !== '' ||
        form.data.caption_override.trim() !== '' ||
        form.data.sort_order !== String(nextSortOrder) ||
        form.data.status !== 'draft';

    useEffect(() => {
        if (form.isDirty || form.processing) {
            return;
        }

        form.setData(
            buildCreateMediaAssignmentData(
                availableMedia,
                defaultRole,
                nextSortOrder,
            ),
        );
        form.clearErrors();
    }, [availableMedia, defaultRole, form, nextSortOrder]);

    return (
        <Card>
            <CardHeader className="gap-3">
                <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline">Media slot</Badge>
                    <Badge variant="secondary">Supporting editorial</Badge>
                </div>
                <CardTitle>Attach Media to a Registered Public Slot</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
                {availableMedia.length === 0 ? (
                    <div className="rounded-xl border border-dashed px-4 py-4 text-sm leading-6 text-muted-foreground">
                        No media records are available yet. Add media to the
                        library first, then attach it through a registered slot.
                    </div>
                ) : (
                    <>
                        <MediaAssignmentSelectFields
                            mediaField={mediaField}
                            mediaHtmlFor="new_media_id"
                            mediaValue={form.data.media_id}
                            onMediaChange={(value) =>
                                form.setData('media_id', value)
                            }
                            mediaError={form.errors.media_id}
                            mediaHelpText="Pick an existing media record. Labels include type and source cues so the library is easier to scan."
                            availableMedia={availableMedia}
                            roleField={roleField}
                            roleHtmlFor="new_media_role"
                            roleValue={form.data.role}
                            onRoleChange={(value) =>
                                form.setData('role', value)
                            }
                            roleError={form.errors.role}
                            slotOptions={slotOptions}
                        />

                        <MediaSelectionSummary
                            media={selectedMedia}
                            label="Choose a media record to preview it before attaching."
                        />

                        <MediaPreviewCard
                            media={selectedMedia}
                            fallbackLabel={
                                getBookMediaSlotMeta(form.data.role).label
                            }
                        />

                        <MediaSlotPurposeCard role={form.data.role} />

                        <div className="grid gap-4 md:grid-cols-2">
                            <MediaAssignmentOverrideFields
                                mode="title"
                                titleField={titleField}
                                titleHtmlFor="new_media_title_override"
                                titleValue={form.data.title_override}
                                onTitleChange={(value) =>
                                    form.setData('title_override', value)
                                }
                                titleError={form.errors.title_override}
                                captionField={captionField}
                                captionHtmlFor="new_media_caption_override"
                                captionValue={form.data.caption_override}
                                onCaptionChange={(value) =>
                                    form.setData('caption_override', value)
                                }
                                captionError={form.errors.caption_override}
                            />

                            <MediaAssignmentMetaFields
                                mode="sort"
                                sortOrderField={sortOrderField}
                                sortOrderHtmlFor="new_media_sort_order"
                                sortOrderValue={form.data.sort_order}
                                onSortOrderChange={(value) =>
                                    form.setData('sort_order', value)
                                }
                                sortOrderError={form.errors.sort_order}
                                statusField={statusField}
                                statusHtmlFor="new_media_status"
                                statusValue={form.data.status}
                                onStatusChange={(value) =>
                                    form.setData('status', value)
                                }
                                statusError={form.errors.status}
                            />
                        </div>

                        <MediaAssignmentOverrideFields
                            mode="caption"
                            titleField={titleField}
                            titleHtmlFor="new_media_title_override"
                            titleValue={form.data.title_override}
                            onTitleChange={(value) =>
                                form.setData('title_override', value)
                            }
                            titleError={form.errors.title_override}
                            captionField={captionField}
                            captionHtmlFor="new_media_caption_override"
                            captionValue={form.data.caption_override}
                            onCaptionChange={(value) =>
                                form.setData('caption_override', value)
                            }
                            captionError={form.errors.caption_override}
                        />

                        <MediaAssignmentMetaFields
                            mode="status"
                            sortOrderField={sortOrderField}
                            sortOrderHtmlFor="new_media_sort_order"
                            sortOrderValue={form.data.sort_order}
                            onSortOrderChange={(value) =>
                                form.setData('sort_order', value)
                            }
                            sortOrderError={form.errors.sort_order}
                            statusField={statusField}
                            statusHtmlFor="new_media_status"
                            statusValue={form.data.status}
                            onStatusChange={(value) =>
                                form.setData('status', value)
                            }
                            statusError={form.errors.status}
                        />

                        <div className="flex flex-wrap gap-2">
                            {attachHref && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        form.transform(toInlineAttachPayload);
                                        form.post(attachHref, {
                                            preserveScroll: true,
                                            preserveState: false,
                                        });
                                    }}
                                    disabled={
                                        form.processing ||
                                        !form.data.media_id ||
                                        quickAttachIgnoresAdvancedValues
                                    }
                                >
                                    <Plus className="size-4" />
                                    Quick attach draft
                                </Button>
                            )}

                            <Button
                                type="button"
                                onClick={() => {
                                    form.transform((data) => ({
                                        ...data,
                                        media_id: Number(data.media_id),
                                        sort_order: Number(data.sort_order),
                                    }));

                                    form.post(storeHref, {
                                        preserveScroll: true,
                                        preserveState: false,
                                    });
                                }}
                                disabled={form.processing}
                            >
                                <Plus className="size-4" />
                                Add with advanced fields
                            </Button>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
}

export function BookMediaAssignmentEditorCard({
    assignment,
    mediaField,
    roleField,
    titleField,
    captionField,
    sortOrderField,
    statusField,
    availableMedia,
}: SharedProps & {
    assignment: ScriptureAdminMediaAssignment;
}) {
    const slotOptions = getBookMediaSlotOptions(roleField.options);
    const assignmentSlot = getBookMediaSlotMeta(assignment.role);

    const form = useForm<MediaAssignmentFormData>(
        buildExistingMediaAssignmentData(assignment),
    );
    const selectedMedia =
        findAvailableMedia(availableMedia, form.data.media_id) ??
        assignment.media;
    const quickReplaceKeepsAdvancedValues =
        form.data.role === assignment.role &&
        form.data.title_override === (assignment.title_override ?? '') &&
        form.data.caption_override === (assignment.caption_override ?? '') &&
        form.data.sort_order === String(assignment.sort_order) &&
        form.data.status === assignment.status;
    const selectedMediaChanged =
        form.data.media_id !== String(assignment.media_id);

    useEffect(() => {
        form.setData(buildExistingMediaAssignmentData(assignment));
        form.clearErrors();
    }, [assignment, form]);

    return (
        <Card id={`media-assignment-${assignment.id}`}>
            <CardHeader className="gap-3">
                <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">{assignmentSlot.label}</Badge>
                    <Badge variant="outline" className="font-mono text-[11px]">
                        {assignment.role}
                    </Badge>
                    <Badge variant="outline">{assignment.status}</Badge>
                    {assignment.media && (
                        <Badge variant="secondary">
                            {assignment.media.media_type}
                        </Badge>
                    )}
                </div>
                <CardTitle>
                    {assignment.media?.title ?? `${assignmentSlot.label} slot`}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
                <MediaAssignmentSelectFields
                    mediaField={mediaField}
                    mediaHtmlFor={`media_id_${assignment.id}`}
                    mediaValue={form.data.media_id}
                    onMediaChange={(value) => form.setData('media_id', value)}
                    mediaError={form.errors.media_id}
                    mediaHelpText="Replace the current media record here without losing your slot overrides. Use the quick replace action below for the common case."
                    availableMedia={availableMedia}
                    roleField={roleField}
                    roleHtmlFor={`media_role_${assignment.id}`}
                    roleValue={form.data.role}
                    onRoleChange={(value) => form.setData('role', value)}
                    roleError={form.errors.role}
                    slotOptions={slotOptions}
                />

                <MediaSelectionSummary
                    media={selectedMedia}
                    label="Choose a media record to preview it before saving."
                />

                <MediaPreviewCard
                    media={selectedMedia}
                    title={form.data.title_override || undefined}
                    caption={form.data.caption_override || undefined}
                    fallbackLabel={getBookMediaSlotMeta(form.data.role).label}
                />

                <MediaSlotPurposeCard role={form.data.role} compact />

                <div className="grid gap-4 md:grid-cols-2">
                    <MediaAssignmentOverrideFields
                        mode="title"
                        titleField={titleField}
                        titleHtmlFor={`media_title_override_${assignment.id}`}
                        titleValue={form.data.title_override}
                        onTitleChange={(value) =>
                            form.setData('title_override', value)
                        }
                        titleError={form.errors.title_override}
                        captionField={captionField}
                        captionHtmlFor={`media_caption_override_${assignment.id}`}
                        captionValue={form.data.caption_override}
                        onCaptionChange={(value) =>
                            form.setData('caption_override', value)
                        }
                        captionError={form.errors.caption_override}
                    />

                    <MediaAssignmentMetaFields
                        mode="sort"
                        sortOrderField={sortOrderField}
                        sortOrderHtmlFor={`media_sort_order_${assignment.id}`}
                        sortOrderValue={form.data.sort_order}
                        onSortOrderChange={(value) =>
                            form.setData('sort_order', value)
                        }
                        sortOrderError={form.errors.sort_order}
                        statusField={statusField}
                        statusHtmlFor={`media_status_${assignment.id}`}
                        statusValue={form.data.status}
                        onStatusChange={(value) =>
                            form.setData('status', value)
                        }
                        statusError={form.errors.status}
                    />
                </div>

                <MediaAssignmentOverrideFields
                    mode="caption"
                    titleField={titleField}
                    titleHtmlFor={`media_title_override_${assignment.id}`}
                    titleValue={form.data.title_override}
                    onTitleChange={(value) =>
                        form.setData('title_override', value)
                    }
                    titleError={form.errors.title_override}
                    captionField={captionField}
                    captionHtmlFor={`media_caption_override_${assignment.id}`}
                    captionValue={form.data.caption_override}
                    onCaptionChange={(value) =>
                        form.setData('caption_override', value)
                    }
                    captionError={form.errors.caption_override}
                />

                <MediaAssignmentMetaFields
                    mode="status"
                    sortOrderField={sortOrderField}
                    sortOrderHtmlFor={`media_sort_order_${assignment.id}`}
                    sortOrderValue={form.data.sort_order}
                    onSortOrderChange={(value) =>
                        form.setData('sort_order', value)
                    }
                    sortOrderError={form.errors.sort_order}
                    statusField={statusField}
                    statusHtmlFor={`media_status_${assignment.id}`}
                    statusValue={form.data.status}
                    onStatusChange={(value) => form.setData('status', value)}
                    statusError={form.errors.status}
                />

                <div className="flex flex-wrap gap-2">
                    {assignment.replace_media_href && (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                form.transform(toInlineReplacePayload);
                                form.patch(assignment.replace_media_href!, {
                                    preserveScroll: true,
                                });
                            }}
                            disabled={
                                form.processing ||
                                !form.data.media_id ||
                                !selectedMediaChanged ||
                                !quickReplaceKeepsAdvancedValues
                            }
                        >
                            Replace media only
                        </Button>
                    )}

                    <Button
                        type="button"
                        onClick={() => {
                            form.transform((data) => ({
                                ...data,
                                media_id: Number(data.media_id),
                                sort_order: Number(data.sort_order),
                            }));

                            form.patch(assignment.update_href, {
                                preserveScroll: true,
                            });
                        }}
                        disabled={form.processing}
                    >
                        Save advanced fields
                    </Button>

                    {assignment.destroy_href && (
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={() =>
                                form.delete(assignment.destroy_href!, {
                                    preserveScroll: true,
                                })
                            }
                            disabled={form.processing}
                        >
                            <Trash2 className="size-4" />
                            Remove
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
