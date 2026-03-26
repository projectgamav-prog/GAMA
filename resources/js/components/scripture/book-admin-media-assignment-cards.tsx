import { useForm } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { BookAdminSourceLabel } from '@/components/scripture/book-admin-source-label';
import {
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

    const form = useForm<MediaAssignmentFormData>({
        media_id: availableMedia[0] ? String(availableMedia[0].id) : '',
        role: roleField.options?.[0] ?? 'overview_video',
        title_override: '',
        caption_override: '',
        sort_order: String(nextSortOrder),
        status: 'draft',
    });

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
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="grid gap-2">
                                <BookAdminSourceLabel
                                    field={mediaField}
                                    htmlFor="new_media_id"
                                />
                                <Select
                                    value={form.data.media_id}
                                    onValueChange={(value) =>
                                        form.setData('media_id', value)
                                    }
                                >
                                    <SelectTrigger
                                        id="new_media_id"
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
                                                {media.title ??
                                                    `Media ${media.id}`}{' '}
                                                ({media.media_type})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={form.errors.media_id} />
                            </div>

                            <div className="grid gap-2">
                                <BookAdminSourceLabel
                                    field={roleField}
                                    htmlFor="new_media_role"
                                />
                                <Select
                                    value={form.data.role}
                                    onValueChange={(value) =>
                                        form.setData('role', value)
                                    }
                                >
                                    <SelectTrigger
                                        id="new_media_role"
                                        className="w-full"
                                    >
                                        <SelectValue placeholder="Choose slot" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {slotOptions.map((option) => (
                                            <SelectItem
                                                key={option.role}
                                                value={option.role}
                                            >
                                                {option.label}
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
                                <BookAdminSourceLabel
                                    field={titleField}
                                    htmlFor="new_media_title_override"
                                />
                                <Input
                                    id="new_media_title_override"
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
                                <BookAdminSourceLabel
                                    field={sortOrderField}
                                    htmlFor="new_media_sort_order"
                                />
                                <Input
                                    id="new_media_sort_order"
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
                            <BookAdminSourceLabel
                                field={captionField}
                                htmlFor="new_media_caption_override"
                            />
                            <Textarea
                                id="new_media_caption_override"
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
                            <BookAdminSourceLabel
                                field={statusField}
                                htmlFor="new_media_status"
                            />
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
                                    id="new_media_status"
                                    className="w-full"
                                >
                                    <SelectValue placeholder="Choose status" />
                                </SelectTrigger>
                                <SelectContent>
                                    {(statusField.options ?? []).map(
                                        (option) => (
                                            <SelectItem
                                                key={option}
                                                value={option}
                                            >
                                                {option}
                                            </SelectItem>
                                        ),
                                    )}
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

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="grid gap-2">
                        <BookAdminSourceLabel
                            field={mediaField}
                            htmlFor={`media_id_${assignment.id}`}
                        />
                        <Select
                            value={form.data.media_id}
                            onValueChange={(value) =>
                                form.setData('media_id', value)
                            }
                        >
                            <SelectTrigger
                                id={`media_id_${assignment.id}`}
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
                        <BookAdminSourceLabel
                            field={roleField}
                            htmlFor={`media_role_${assignment.id}`}
                        />
                        <Select
                            value={form.data.role}
                            onValueChange={(value) =>
                                form.setData('role', value)
                            }
                        >
                            <SelectTrigger
                                id={`media_role_${assignment.id}`}
                                className="w-full"
                            >
                                <SelectValue placeholder="Choose slot" />
                            </SelectTrigger>
                            <SelectContent>
                                {slotOptions.map((option) => (
                                    <SelectItem
                                        key={option.role}
                                        value={option.role}
                                    >
                                        {option.label}
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
                        <BookAdminSourceLabel
                            field={titleField}
                            htmlFor={`media_title_override_${assignment.id}`}
                        />
                        <Input
                            id={`media_title_override_${assignment.id}`}
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
                        <BookAdminSourceLabel
                            field={sortOrderField}
                            htmlFor={`media_sort_order_${assignment.id}`}
                        />
                        <Input
                            id={`media_sort_order_${assignment.id}`}
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
                    <BookAdminSourceLabel
                        field={captionField}
                        htmlFor={`media_caption_override_${assignment.id}`}
                    />
                    <Textarea
                        id={`media_caption_override_${assignment.id}`}
                        value={form.data.caption_override}
                        onChange={(event) =>
                            form.setData('caption_override', event.target.value)
                        }
                        rows={4}
                    />
                    <InputError message={form.errors.caption_override} />
                </div>

                <div className="grid gap-2">
                    <BookAdminSourceLabel
                        field={statusField}
                        htmlFor={`media_status_${assignment.id}`}
                    />
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
                            id={`media_status_${assignment.id}`}
                            className="w-full"
                        >
                            <SelectValue placeholder="Choose status" />
                        </SelectTrigger>
                        <SelectContent>
                            {(statusField.options ?? []).map((option) => (
                                <SelectItem key={option} value={option}>
                                    {option}
                                </SelectItem>
                            ))}
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
