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
import type {
    ScriptureAdminContentBlock,
    ScriptureProtectedAdminContentBlock,
    ScriptureRegisteredAdminField,
} from '@/types';

type ContentBlockFormData = {
    block_type: 'text' | 'quote';
    title: string;
    body: string;
    region: string;
    sort_order: string;
    status: 'draft' | 'published';
};

type SharedProps = {
    blockTypeField: ScriptureRegisteredAdminField;
    titleField: ScriptureRegisteredAdminField;
    bodyField: ScriptureRegisteredAdminField;
    regionField: ScriptureRegisteredAdminField;
    sortOrderField: ScriptureRegisteredAdminField;
    statusField: ScriptureRegisteredAdminField;
};

export function CreateBookContentBlockCard({
    storeHref,
    nextSortOrder,
    blockTypeField,
    titleField,
    bodyField,
    regionField,
    sortOrderField,
    statusField,
}: SharedProps & {
    storeHref: string;
    nextSortOrder: number;
}) {
    const form = useForm<ContentBlockFormData>({
        block_type: 'text',
        title: '',
        body: '',
        region: 'overview',
        sort_order: String(nextSortOrder),
        status: 'draft',
    });

    return (
        <Card>
            <CardHeader className="gap-3">
                <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline">Create block</Badge>
                    <Badge variant="secondary">Supporting editorial</Badge>
                </div>
                <CardTitle>Registered Book Content Block</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="grid gap-2">
                        <BookAdminSourceLabel
                            field={blockTypeField}
                            htmlFor="new_book_block_type"
                        />
                        <Select
                            value={form.data.block_type}
                            onValueChange={(value) =>
                                form.setData(
                                    'block_type',
                                    value as 'text' | 'quote',
                                )
                            }
                        >
                            <SelectTrigger
                                id="new_book_block_type"
                                className="w-full"
                            >
                                <SelectValue placeholder="Choose block type" />
                            </SelectTrigger>
                            <SelectContent>
                                {(blockTypeField.options ?? []).map((option) => (
                                    <SelectItem key={option} value={option}>
                                        {option}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError message={form.errors.block_type} />
                    </div>

                    <div className="grid gap-2">
                        <BookAdminSourceLabel
                            field={regionField}
                            htmlFor="new_book_block_region"
                        />
                        <Input
                            id="new_book_block_region"
                            value={form.data.region}
                            onChange={(event) =>
                                form.setData('region', event.target.value)
                            }
                        />
                        <InputError message={form.errors.region} />
                    </div>
                </div>

                <div className="grid gap-2">
                    <BookAdminSourceLabel
                        field={titleField}
                        htmlFor="new_book_block_title"
                    />
                    <Input
                        id="new_book_block_title"
                        value={form.data.title}
                        onChange={(event) =>
                            form.setData('title', event.target.value)
                        }
                    />
                    <InputError message={form.errors.title} />
                </div>

                <div className="grid gap-2">
                    <BookAdminSourceLabel
                        field={bodyField}
                        htmlFor="new_book_block_body"
                    />
                    <Textarea
                        id="new_book_block_body"
                        value={form.data.body}
                        onChange={(event) =>
                            form.setData('body', event.target.value)
                        }
                        rows={6}
                    />
                    <InputError message={form.errors.body} />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="grid gap-2">
                        <BookAdminSourceLabel
                            field={sortOrderField}
                            htmlFor="new_book_block_sort_order"
                        />
                        <Input
                            id="new_book_block_sort_order"
                            type="number"
                            min={0}
                            value={form.data.sort_order}
                            onChange={(event) =>
                                form.setData('sort_order', event.target.value)
                            }
                        />
                        <InputError message={form.errors.sort_order} />
                    </div>

                    <div className="grid gap-2">
                        <BookAdminSourceLabel
                            field={statusField}
                            htmlFor="new_book_block_status"
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
                                id="new_book_block_status"
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
                </div>

                <Button
                    type="button"
                    onClick={() => {
                        form.transform((data) => ({
                            ...data,
                            sort_order: Number(data.sort_order),
                        }));

                        form.post(storeHref, {
                            preserveScroll: true,
                            preserveState: false,
                            onSuccess: () =>
                                form.reset('title', 'body', 'region', 'status'),
                        });
                    }}
                    disabled={form.processing}
                >
                    <Plus className="size-4" />
                    Add content block
                </Button>
            </CardContent>
        </Card>
    );
}

export function BookContentBlockEditorCard({
    block,
    blockTypeField,
    titleField,
    bodyField,
    regionField,
    sortOrderField,
    statusField,
}: SharedProps & {
    block: ScriptureAdminContentBlock;
}) {
    const form = useForm<ContentBlockFormData>({
        block_type: block.block_type as 'text' | 'quote',
        title: block.title ?? '',
        body: block.body ?? '',
        region: block.region,
        sort_order: String(block.sort_order),
        status: block.status,
    });

    return (
        <Card id={`block-${block.id}`}>
            <CardHeader className="gap-3">
                <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline">{block.region}</Badge>
                    <Badge variant="secondary">{block.block_type}</Badge>
                    <Badge variant="outline">{block.status}</Badge>
                </div>
                <CardTitle>{block.title ?? `Block ${block.id}`}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="grid gap-2">
                        <BookAdminSourceLabel
                            field={blockTypeField}
                            htmlFor={`book_block_type_${block.id}`}
                        />
                        <Select
                            value={form.data.block_type}
                            onValueChange={(value) =>
                                form.setData(
                                    'block_type',
                                    value as 'text' | 'quote',
                                )
                            }
                        >
                            <SelectTrigger
                                id={`book_block_type_${block.id}`}
                                className="w-full"
                            >
                                <SelectValue placeholder="Choose block type" />
                            </SelectTrigger>
                            <SelectContent>
                                {(blockTypeField.options ?? []).map((option) => (
                                    <SelectItem key={option} value={option}>
                                        {option}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError message={form.errors.block_type} />
                    </div>

                    <div className="grid gap-2">
                        <BookAdminSourceLabel
                            field={regionField}
                            htmlFor={`book_block_region_${block.id}`}
                        />
                        <Input
                            id={`book_block_region_${block.id}`}
                            value={form.data.region}
                            onChange={(event) =>
                                form.setData('region', event.target.value)
                            }
                        />
                        <InputError message={form.errors.region} />
                    </div>
                </div>

                <div className="grid gap-2">
                    <BookAdminSourceLabel
                        field={titleField}
                        htmlFor={`book_block_title_${block.id}`}
                    />
                    <Input
                        id={`book_block_title_${block.id}`}
                        value={form.data.title}
                        onChange={(event) =>
                            form.setData('title', event.target.value)
                        }
                    />
                    <InputError message={form.errors.title} />
                </div>

                <div className="grid gap-2">
                    <BookAdminSourceLabel
                        field={bodyField}
                        htmlFor={`book_block_body_${block.id}`}
                    />
                    <Textarea
                        id={`book_block_body_${block.id}`}
                        value={form.data.body}
                        onChange={(event) =>
                            form.setData('body', event.target.value)
                        }
                        rows={6}
                    />
                    <InputError message={form.errors.body} />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="grid gap-2">
                        <BookAdminSourceLabel
                            field={sortOrderField}
                            htmlFor={`book_block_sort_order_${block.id}`}
                        />
                        <Input
                            id={`book_block_sort_order_${block.id}`}
                            type="number"
                            min={0}
                            value={form.data.sort_order}
                            onChange={(event) =>
                                form.setData('sort_order', event.target.value)
                            }
                        />
                        <InputError message={form.errors.sort_order} />
                    </div>

                    <div className="grid gap-2">
                        <BookAdminSourceLabel
                            field={statusField}
                            htmlFor={`book_block_status_${block.id}`}
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
                                id={`book_block_status_${block.id}`}
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
                </div>

                <Button
                    type="button"
                    onClick={() => {
                        form.transform((data) => ({
                            ...data,
                            sort_order: Number(data.sort_order),
                        }));

                        form.patch(block.update_href, {
                            preserveScroll: true,
                        });
                    }}
                    disabled={form.processing}
                >
                    Save block
                </Button>
            </CardContent>
        </Card>
    );
}

export function ProtectedContentBlockCard({
    block,
}: {
    block: ScriptureProtectedAdminContentBlock;
}) {
    return (
        <Card>
            <CardHeader className="gap-3">
                <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline">{block.region}</Badge>
                    <Badge variant="secondary">{block.block_type}</Badge>
                    <Badge variant="outline">{block.status}</Badge>
                    <Badge variant="outline">Protected</Badge>
                </div>
                <CardTitle>{block.title ?? `Block ${block.id}`}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <p className="text-sm leading-6 text-muted-foreground">
                    {block.protection_reason}
                </p>
                {block.body && (
                    <p className="text-sm leading-7 text-foreground">
                        {block.body}
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
