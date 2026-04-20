import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';
import { Plus } from 'lucide-react';
import InputError from '@/components/input-error';
import { ContentBlockCoreFields } from '@/components/scripture/content-blocks/ContentBlockCoreFields';
import { ContentBlockImageFields } from '@/components/scripture/content-blocks/ContentBlockImageFields';
import { ContentBlockMetaFields } from '@/components/scripture/content-blocks/ContentBlockMetaFields';
import { ScriptureAdminSourceLabel } from '@/components/scripture/scripture-admin-source-label';
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
import {
    getScriptureAdminTargetItemAttribute,
    getScriptureAdminTargetItemId,
} from '@/lib/scripture-admin-navigation';
import { scriptureAdminStartCase } from '@/lib/scripture-admin-field-display';
import type {
    ScriptureAdminContentBlock,
    ScriptureProtectedAdminContentBlock,
    ScriptureRegisteredAdminField,
} from '@/types';

type ContentBlockFormData = {
    block_type: string;
    title: string;
    body: string;
    media_url: string;
    alt_text: string;
    region: string;
    sort_order: string;
    status: 'draft' | 'published';
};

type SharedProps = {
    titleField: ScriptureRegisteredAdminField;
    bodyField: ScriptureRegisteredAdminField;
    mediaUrlField?: ScriptureRegisteredAdminField | null;
    altTextField?: ScriptureRegisteredAdminField | null;
    regionField: ScriptureRegisteredAdminField;
    sortOrderField: ScriptureRegisteredAdminField;
    statusField: ScriptureRegisteredAdminField;
    blockTypeField?: ScriptureRegisteredAdminField | null;
    fixedBlockType?: string | null;
};

type CreateProps = SharedProps & {
    storeHref: string;
    nextSortOrder: number;
    defaultRegion?: string;
    createBadgeLabel?: string;
    scopeBadgeLabel?: string;
    createTitle?: string;
    createActionLabel?: string;
};

type EditorProps = SharedProps & {
    block: ScriptureAdminContentBlock;
    saveActionLabel?: string;
    editorTitle?: (block: ScriptureAdminContentBlock) => string;
};

type ProtectedProps = {
    block: ScriptureProtectedAdminContentBlock;
    protectedBadgeLabel?: string;
};

function blockTypeOptions(
    field: ScriptureRegisteredAdminField | null | undefined,
): string[] {
    return field?.options ?? [];
}

function blockDataValue(
    block: ScriptureAdminContentBlock,
    key: string,
): string {
    const value = block.data_json?.[key];

    return typeof value === 'string' ? value : '';
}

function isImageBlockType(blockType: string): boolean {
    return blockType === 'image';
}

function ContentBlockTypeField({
    field,
    value,
    onChange,
    error,
    htmlFor,
}: {
    field: ScriptureRegisteredAdminField;
    value: string;
    onChange: (value: string) => void;
    error?: string;
    htmlFor: string;
}) {
    const options = blockTypeOptions(field);

    return (
        <div className="grid gap-2">
            <ScriptureAdminSourceLabel field={field} htmlFor={htmlFor} />
            {options.length > 0 ? (
                <Select value={value} onValueChange={onChange}>
                    <SelectTrigger id={htmlFor} className="w-full">
                        <SelectValue placeholder="Choose block type" />
                    </SelectTrigger>
                    <SelectContent>
                        {options.map((option) => (
                            <SelectItem key={option} value={option}>
                                {scriptureAdminStartCase(option)}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            ) : (
                <Input
                    id={htmlFor}
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                />
            )}
            <InputError message={error} />
        </div>
    );
}

function ContentBlockRegionField({
    field,
    value,
    onChange,
    error,
    htmlFor,
}: {
    field: ScriptureRegisteredAdminField;
    value: string;
    onChange: (value: string) => void;
    error?: string;
    htmlFor: string;
}) {
    const options = field.options ?? [];

    return (
        <div className="grid gap-2">
            <ScriptureAdminSourceLabel field={field} htmlFor={htmlFor} />
            {options.length > 0 ? (
                <Select value={value} onValueChange={onChange}>
                    <SelectTrigger id={htmlFor} className="w-full">
                        <SelectValue placeholder="Choose region" />
                    </SelectTrigger>
                    <SelectContent>
                        {options.map((option) => (
                            <SelectItem key={option} value={option}>
                                {scriptureAdminStartCase(option)}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            ) : (
                <Input
                    id={htmlFor}
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                />
            )}
            <InputError message={error} />
        </div>
    );
}

export function CreateScriptureAdminContentBlockCard({
    storeHref,
    nextSortOrder,
    blockTypeField,
    fixedBlockType = null,
    titleField,
    bodyField,
    mediaUrlField,
    altTextField,
    regionField,
    sortOrderField,
    statusField,
    defaultRegion,
    createBadgeLabel = 'Create block',
    scopeBadgeLabel = 'Supporting editorial',
    createTitle = 'Registered Content Block',
    createActionLabel = 'Add content block',
}: CreateProps) {
    const regionOptions = regionField.options ?? [];
    const typeOptions = blockTypeOptions(blockTypeField);

    const form = useForm<ContentBlockFormData>({
        block_type: fixedBlockType ?? typeOptions[0] ?? 'text',
        title: '',
        body: '',
        media_url: '',
        alt_text: '',
        region: defaultRegion ?? regionOptions[0] ?? 'overview',
        sort_order: String(nextSortOrder),
        status: 'draft',
    });
    const showsImageFields = isImageBlockType(form.data.block_type);

    useEffect(() => {
        if (form.isDirty || form.processing) {
            return;
        }

        form.setData((data) => ({
            ...data,
            block_type: fixedBlockType ?? typeOptions[0] ?? 'text',
            region: defaultRegion ?? regionOptions[0] ?? 'overview',
            sort_order: String(nextSortOrder),
        }));
        form.clearErrors();
    }, [
        defaultRegion,
        fixedBlockType,
        form,
        nextSortOrder,
        regionOptions,
        typeOptions,
    ]);

    return (
        <Card>
            <CardHeader className="gap-3">
                <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline">{createBadgeLabel}</Badge>
                    <Badge variant="secondary">{scopeBadgeLabel}</Badge>
                </div>
                <CardTitle>{createTitle}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
                <div
                    className={
                        blockTypeField
                            ? 'grid gap-4 md:grid-cols-2'
                            : 'grid gap-4'
                    }
                >
                    {blockTypeField && (
                        <ContentBlockTypeField
                            field={blockTypeField}
                            value={form.data.block_type}
                            onChange={(value) =>
                                form.setData('block_type', value)
                            }
                            error={form.errors.block_type}
                            htmlFor="new_content_block_type"
                        />
                    )}

                    <ContentBlockRegionField
                        field={regionField}
                        value={form.data.region}
                        onChange={(value) => form.setData('region', value)}
                        error={form.errors.region}
                        htmlFor="new_content_block_region"
                    />
                </div>

                <ContentBlockCoreFields
                    titleField={titleField}
                    titleHtmlFor="new_content_block_title"
                    titleValue={form.data.title}
                    onTitleChange={(value) => form.setData('title', value)}
                    titleError={form.errors.title}
                    bodyField={bodyField}
                    bodyHtmlFor="new_content_block_body"
                    bodyValue={form.data.body}
                    onBodyChange={(value) => form.setData('body', value)}
                    bodyError={form.errors.body}
                />

                {showsImageFields && (
                    <ContentBlockImageFields
                        mediaUrlField={mediaUrlField}
                        mediaUrlHtmlFor="new_content_block_media_url"
                        mediaUrlValue={form.data.media_url}
                        onMediaUrlChange={(value) =>
                            form.setData('media_url', value)
                        }
                        mediaUrlError={form.errors.media_url}
                        altTextField={altTextField}
                        altTextHtmlFor="new_content_block_alt_text"
                        altTextValue={form.data.alt_text}
                        onAltTextChange={(value) =>
                            form.setData('alt_text', value)
                        }
                        altTextError={form.errors.alt_text}
                    />
                )}

                <ContentBlockMetaFields
                    sortOrderField={sortOrderField}
                    sortOrderHtmlFor="new_content_block_sort_order"
                    sortOrderValue={form.data.sort_order}
                    onSortOrderChange={(value) =>
                        form.setData('sort_order', value)
                    }
                    sortOrderError={form.errors.sort_order}
                    statusField={statusField}
                    statusHtmlFor="new_content_block_status"
                    statusValue={form.data.status}
                    onStatusChange={(value) => form.setData('status', value)}
                    statusError={form.errors.status}
                />

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
                                form.reset(
                                    'title',
                                    'body',
                                    'media_url',
                                    'alt_text',
                                    'region',
                                    'status',
                                ),
                        });
                    }}
                    disabled={form.processing}
                >
                    <Plus className="size-4" />
                    {createActionLabel}
                </Button>
            </CardContent>
        </Card>
    );
}

export function ScriptureAdminContentBlockEditorCard({
    block,
    blockTypeField,
    fixedBlockType = null,
    titleField,
    bodyField,
    mediaUrlField,
    altTextField,
    regionField,
    sortOrderField,
    statusField,
    saveActionLabel = 'Save block',
    editorTitle,
}: EditorProps) {
    const form = useForm<ContentBlockFormData>({
        block_type: fixedBlockType ?? block.block_type,
        title: block.title ?? '',
        body: block.body ?? '',
        media_url: blockDataValue(block, 'url'),
        alt_text: blockDataValue(block, 'alt'),
        region: block.region,
        sort_order: String(block.sort_order),
        status: block.status,
    });
    const showsImageFields = isImageBlockType(form.data.block_type);

    useEffect(() => {
        form.setData({
            block_type: fixedBlockType ?? block.block_type,
            title: block.title ?? '',
            body: block.body ?? '',
            media_url: blockDataValue(block, 'url'),
            alt_text: blockDataValue(block, 'alt'),
            region: block.region,
            sort_order: String(block.sort_order),
            status: block.status,
        });
        form.clearErrors();
    }, [block, fixedBlockType, form]);

    return (
        <Card
            id={getScriptureAdminTargetItemId('block', block.id)}
            data-admin-target-item={getScriptureAdminTargetItemAttribute(
                'block',
                block.id,
            )}
        >
            <CardHeader className="gap-3">
                <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline">
                        {scriptureAdminStartCase(block.region)}
                    </Badge>
                    <Badge variant="secondary">
                        {scriptureAdminStartCase(block.block_type)}
                    </Badge>
                    <Badge variant="outline">
                        {scriptureAdminStartCase(block.status)}
                    </Badge>
                </div>
                <CardTitle>
                    {editorTitle?.(block) ?? block.title ?? `Block ${block.id}`}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
                <div
                    className={
                        blockTypeField
                            ? 'grid gap-4 md:grid-cols-2'
                            : 'grid gap-4'
                    }
                >
                    {blockTypeField && (
                        <ContentBlockTypeField
                            field={blockTypeField}
                            value={form.data.block_type}
                            onChange={(value) =>
                                form.setData('block_type', value)
                            }
                            error={form.errors.block_type}
                            htmlFor={`content_block_type_${block.id}`}
                        />
                    )}

                    <ContentBlockRegionField
                        field={regionField}
                        value={form.data.region}
                        onChange={(value) => form.setData('region', value)}
                        error={form.errors.region}
                        htmlFor={`content_block_region_${block.id}`}
                    />
                </div>

                <ContentBlockCoreFields
                    titleField={titleField}
                    titleHtmlFor={`content_block_title_${block.id}`}
                    titleValue={form.data.title}
                    onTitleChange={(value) => form.setData('title', value)}
                    titleError={form.errors.title}
                    bodyField={bodyField}
                    bodyHtmlFor={`content_block_body_${block.id}`}
                    bodyValue={form.data.body}
                    onBodyChange={(value) => form.setData('body', value)}
                    bodyError={form.errors.body}
                />

                {showsImageFields && (
                    <ContentBlockImageFields
                        mediaUrlField={mediaUrlField}
                        mediaUrlHtmlFor={`content_block_media_url_${block.id}`}
                        mediaUrlValue={form.data.media_url}
                        onMediaUrlChange={(value) =>
                            form.setData('media_url', value)
                        }
                        mediaUrlError={form.errors.media_url}
                        altTextField={altTextField}
                        altTextHtmlFor={`content_block_alt_text_${block.id}`}
                        altTextValue={form.data.alt_text}
                        onAltTextChange={(value) =>
                            form.setData('alt_text', value)
                        }
                        altTextError={form.errors.alt_text}
                    />
                )}

                <ContentBlockMetaFields
                    sortOrderField={sortOrderField}
                    sortOrderHtmlFor={`content_block_sort_order_${block.id}`}
                    sortOrderValue={form.data.sort_order}
                    onSortOrderChange={(value) =>
                        form.setData('sort_order', value)
                    }
                    sortOrderError={form.errors.sort_order}
                    statusField={statusField}
                    statusHtmlFor={`content_block_status_${block.id}`}
                    statusValue={form.data.status}
                    onStatusChange={(value) => form.setData('status', value)}
                    statusError={form.errors.status}
                />

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
                    {saveActionLabel}
                </Button>
            </CardContent>
        </Card>
    );
}

export function ProtectedScriptureAdminContentBlockCard({
    block,
    protectedBadgeLabel = 'Protected',
}: ProtectedProps) {
    return (
        <Card>
            <CardHeader className="gap-3">
                <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline">
                        {scriptureAdminStartCase(block.region)}
                    </Badge>
                    <Badge variant="secondary">
                        {scriptureAdminStartCase(block.block_type)}
                    </Badge>
                    <Badge variant="outline">
                        {scriptureAdminStartCase(block.status)}
                    </Badge>
                    <Badge variant="outline">{protectedBadgeLabel}</Badge>
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
