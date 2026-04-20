import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';
import { Plus } from 'lucide-react';
import InputError from '@/components/input-error';
import { MediaAssignmentMetaFields } from '@/components/scripture/media-assignments/MediaAssignmentMetaFields';
import { MediaAssignmentOverrideFields } from '@/components/scripture/media-assignments/MediaAssignmentOverrideFields';
import { MediaAssignmentSelectFields } from '@/components/scripture/media-assignments/MediaAssignmentSelectFields';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookAdminSourceLabel } from '@/components/scripture/book-admin-source-label';
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

function MediaSlotPurposeCard({ role }: { role: string }) {
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
                {slot.description}
            </p>
        </div>
    );
}

export function CreateBookMediaAssignmentCard({
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
    storeHref: string;
    nextSortOrder: number;
}) {
    const slotOptions = getBookMediaSlotOptions(roleField.options);
    const defaultRole = getDefaultBookMediaSlotRole(roleField.options);

    const form = useForm<MediaAssignmentFormData>({
        media_id: availableMedia[0] ? String(availableMedia[0].id) : '',
        role: defaultRole,
        title_override: '',
        caption_override: '',
        sort_order: String(nextSortOrder),
        status: 'draft',
    });

    useEffect(() => {
        if (form.isDirty || form.processing) {
            return;
        }

        form.setData((data) => ({
            ...data,
            media_id: availableMedia[0] ? String(availableMedia[0].id) : '',
            role: defaultRole,
            sort_order: String(nextSortOrder),
        }));
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
                            availableMedia={availableMedia}
                            roleField={roleField}
                            roleHtmlFor="new_media_role"
                            roleValue={form.data.role}
                            onRoleChange={(value) => form.setData('role', value)}
                            roleError={form.errors.role}
                            slotOptions={slotOptions}
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
                            Add media slot
                        </Button>
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

    const form = useForm<MediaAssignmentFormData>({
        media_id: String(assignment.media_id),
        role: assignment.role,
        title_override: assignment.title_override ?? '',
        caption_override: assignment.caption_override ?? '',
        sort_order: String(assignment.sort_order),
        status: assignment.status,
    });

    useEffect(() => {
        form.setData({
            media_id: String(assignment.media_id),
            role: assignment.role,
            title_override: assignment.title_override ?? '',
            caption_override: assignment.caption_override ?? '',
            sort_order: String(assignment.sort_order),
            status: assignment.status,
        });
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
                {assignment.media && (
                    <div className="rounded-xl border border-border/70 bg-muted/20 px-4 py-4 text-sm leading-6 text-muted-foreground">
                        {assignment.media.url ??
                            assignment.media.path ??
                            'No media location recorded.'}
                    </div>
                )}

                <MediaAssignmentSelectFields
                    mediaField={mediaField}
                    mediaHtmlFor={`media_id_${assignment.id}`}
                    mediaValue={form.data.media_id}
                    onMediaChange={(value) => form.setData('media_id', value)}
                    mediaError={form.errors.media_id}
                    availableMedia={availableMedia}
                    roleField={roleField}
                    roleHtmlFor={`media_role_${assignment.id}`}
                    roleValue={form.data.role}
                    onRoleChange={(value) => form.setData('role', value)}
                    roleError={form.errors.role}
                    slotOptions={slotOptions}
                />

                <MediaSlotPurposeCard role={form.data.role} />

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
                    Save media slot
                </Button>
            </CardContent>
        </Card>
    );
}
