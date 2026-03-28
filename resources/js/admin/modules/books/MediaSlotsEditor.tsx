import { Link, useForm } from '@inertiajs/react';
import { useMemo } from 'react';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { defineAdminModule } from '@/admin/core/module-registry';
import type { AdminModuleComponentProps } from '@/admin/core/module-types';
import { getBookMediaSlotMeta } from '@/lib/book-media-slot-meta';
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

const MEDIA_SLOT_ROLES = [
    'overview_video',
    'hero_media',
    'supporting_media',
] as const;

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

function CreateMediaAssignmentCard({
    storeHref,
    nextSortOrder,
    availableMedia,
}: {
    storeHref: string;
    nextSortOrder: number;
    availableMedia: ScriptureAdminMediaSummary[];
}) {
    const form = useForm<MediaAssignmentFormData>({
        media_id: availableMedia[0] ? String(availableMedia[0].id) : '',
        role: MEDIA_SLOT_ROLES[0],
        title_override: '',
        caption_override: '',
        sort_order: String(nextSortOrder),
        status: 'draft',
    });

    return (
        <Card>
            <CardHeader className="gap-3">
                <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline">Media slots</Badge>
                    <Badge variant="secondary">Create</Badge>
                </div>
                <CardTitle>Add media assignment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
                {availableMedia.length === 0 ? (
                    <div className="rounded-xl border border-dashed px-4 py-4 text-sm leading-6 text-muted-foreground">
                        No media records are available yet.
                    </div>
                ) : (
                    <>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="grid gap-2">
                                <Label htmlFor="new_book_media_id">Media</Label>
                                <Select
                                    value={form.data.media_id}
                                    onValueChange={(value) =>
                                        form.setData('media_id', value)
                                    }
                                >
                                    <SelectTrigger
                                        id="new_book_media_id"
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
                                                {media.title ?? `Media ${media.id}`}{' '}
                                                ({media.media_type})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={form.errors.media_id} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="new_book_media_role">Slot</Label>
                                <Select
                                    value={form.data.role}
                                    onValueChange={(value) =>
                                        form.setData('role', value)
                                    }
                                >
                                    <SelectTrigger
                                        id="new_book_media_role"
                                        className="w-full"
                                    >
                                        <SelectValue placeholder="Choose slot" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {MEDIA_SLOT_ROLES.map((role) => (
                                            <SelectItem key={role} value={role}>
                                                {getBookMediaSlotMeta(role).label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={form.errors.role} />
                            </div>
                        </div>

                        <MediaSlotPurposeCard role={form.data.role} />

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="grid gap-2">
                                <Label htmlFor="new_book_media_title_override">
                                    Title override
                                </Label>
                                <Input
                                    id="new_book_media_title_override"
                                    value={form.data.title_override}
                                    onChange={(event) =>
                                        form.setData(
                                            'title_override',
                                            event.target.value,
                                        )
                                    }
                                />
                                <InputError
                                    message={form.errors.title_override}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="new_book_media_sort_order">
                                    Sort order
                                </Label>
                                <Input
                                    id="new_book_media_sort_order"
                                    type="number"
                                    min={0}
                                    value={form.data.sort_order}
                                    onChange={(event) =>
                                        form.setData(
                                            'sort_order',
                                            event.target.value,
                                        )
                                    }
                                />
                                <InputError message={form.errors.sort_order} />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="new_book_media_caption_override">
                                Caption override
                            </Label>
                            <Textarea
                                id="new_book_media_caption_override"
                                value={form.data.caption_override}
                                onChange={(event) =>
                                    form.setData(
                                        'caption_override',
                                        event.target.value,
                                    )
                                }
                                rows={4}
                            />
                            <InputError
                                message={form.errors.caption_override}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="new_book_media_status">Status</Label>
                            <Select
                                value={form.data.status}
                                onValueChange={(value) =>
                                    form.setData(
                                        'status',
                                        value as 'draft' | 'published',
                                    )
                                }
                            >
                                <SelectTrigger
                                    id="new_book_media_status"
                                    className="w-full"
                                >
                                    <SelectValue placeholder="Choose status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="draft">draft</SelectItem>
                                    <SelectItem value="published">
                                        published
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            <InputError message={form.errors.status} />
                        </div>

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
                            Add media slot
                        </Button>
                    </>
                )}
            </CardContent>
        </Card>
    );
}

function MediaAssignmentEditorCard({
    assignment,
    availableMedia,
}: {
    assignment: ScriptureAdminMediaAssignment;
    availableMedia: ScriptureAdminMediaSummary[];
}) {
    const form = useForm<MediaAssignmentFormData>({
        media_id: String(assignment.media_id),
        role: assignment.role,
        title_override: assignment.title_override ?? '',
        caption_override: assignment.caption_override ?? '',
        sort_order: String(assignment.sort_order),
        status: assignment.status,
    });
    const assignmentSlot = getBookMediaSlotMeta(assignment.role);

    return (
        <Card id={`book-media-assignment-${assignment.id}`}>
            <CardHeader className="gap-3">
                <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">{assignmentSlot.label}</Badge>
                    <Badge variant="outline" className="font-mono text-[11px]">
                        {assignment.role}
                    </Badge>
                    <Badge variant="outline">{assignment.status}</Badge>
                    {assignment.media && (
                        <Badge variant="outline">
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

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="grid gap-2">
                        <Label htmlFor={`book_media_id_${assignment.id}`}>
                            Media
                        </Label>
                        <Select
                            value={form.data.media_id}
                            onValueChange={(value) =>
                                form.setData('media_id', value)
                            }
                        >
                            <SelectTrigger
                                id={`book_media_id_${assignment.id}`}
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
                                        {media.title ?? `Media ${media.id}`} (
                                        {media.media_type})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError message={form.errors.media_id} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor={`book_media_role_${assignment.id}`}>
                            Slot
                        </Label>
                        <Select
                            value={form.data.role}
                            onValueChange={(value) =>
                                form.setData('role', value)
                            }
                        >
                            <SelectTrigger
                                id={`book_media_role_${assignment.id}`}
                                className="w-full"
                            >
                                <SelectValue placeholder="Choose slot" />
                            </SelectTrigger>
                            <SelectContent>
                                {MEDIA_SLOT_ROLES.map((role) => (
                                    <SelectItem key={role} value={role}>
                                        {getBookMediaSlotMeta(role).label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError message={form.errors.role} />
                    </div>
                </div>

                <MediaSlotPurposeCard role={form.data.role} />

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="grid gap-2">
                        <Label htmlFor={`book_media_title_${assignment.id}`}>
                            Title override
                        </Label>
                        <Input
                            id={`book_media_title_${assignment.id}`}
                            value={form.data.title_override}
                            onChange={(event) =>
                                form.setData(
                                    'title_override',
                                    event.target.value,
                                )
                            }
                        />
                        <InputError message={form.errors.title_override} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor={`book_media_sort_${assignment.id}`}>
                            Sort order
                        </Label>
                        <Input
                            id={`book_media_sort_${assignment.id}`}
                            type="number"
                            min={0}
                            value={form.data.sort_order}
                            onChange={(event) =>
                                form.setData('sort_order', event.target.value)
                            }
                        />
                        <InputError message={form.errors.sort_order} />
                    </div>
                </div>

                <div className="grid gap-2">
                    <Label htmlFor={`book_media_caption_${assignment.id}`}>
                        Caption override
                    </Label>
                    <Textarea
                        id={`book_media_caption_${assignment.id}`}
                        value={form.data.caption_override}
                        onChange={(event) =>
                            form.setData('caption_override', event.target.value)
                        }
                        rows={4}
                    />
                    <InputError message={form.errors.caption_override} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor={`book_media_status_${assignment.id}`}>
                        Status
                    </Label>
                    <Select
                        value={form.data.status}
                        onValueChange={(value) =>
                            form.setData(
                                'status',
                                value as 'draft' | 'published',
                            )
                        }
                    >
                        <SelectTrigger
                            id={`book_media_status_${assignment.id}`}
                            className="w-full"
                        >
                            <SelectValue placeholder="Choose status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="draft">draft</SelectItem>
                            <SelectItem value="published">published</SelectItem>
                        </SelectContent>
                    </Select>
                    <InputError message={form.errors.status} />
                </div>

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

function MediaSlotsEditor({
    surface,
    activation,
}: AdminModuleComponentProps) {
    const metadata = getMediaSlotsContractMetadata(surface);
    const summary = useMemo(() => {
        const publishedCount = metadata?.assignments.filter(
            (assignment) => assignment.status === 'published',
        ).length;

        return {
            total: metadata?.assignments.length ?? 0,
            published: publishedCount ?? 0,
        };
    }, [metadata]);

    if (metadata === null) {
        return null;
    }

    const fullEditHref = buildScriptureAdminSectionHref(
        metadata.fullEditHref,
        'media_slots',
    );

    if (!activation.isActive) {
        return null;
    }

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
                            Manage media assignments for {metadata.entityLabel}{' '}
                            without re-entering the book context.
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

                <CreateMediaAssignmentCard
                    storeHref={metadata.storeHref}
                    nextSortOrder={metadata.nextSortOrder}
                    availableMedia={metadata.availableMedia}
                />

                {metadata.assignments.map((assignment) => (
                    <MediaAssignmentEditorCard
                        key={assignment.id}
                        assignment={assignment}
                        availableMedia={metadata.availableMedia}
                    />
                ))}
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


