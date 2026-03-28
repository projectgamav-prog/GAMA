import { Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { ScriptureInlineRegionEditor } from '@/components/scripture/scripture-inline-region-editor';
import { Button } from '@/components/ui/button';
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
import { scriptureAdminStartCase } from '@/lib/scripture-admin-field-display';
import type { ScriptureContentBlock } from '@/types';

type IntroBlockFormData = {
    block_type: string;
    title: string;
    body: string;
    media_url: string;
    alt_text: string;
    region: string;
    sort_order: number;
    status: 'draft' | 'published';
};

type Props = {
    title: string;
    entityLabel: string;
    block: ScriptureContentBlock | null;
    blockTypes: string[];
    updateHref: string | null;
    storeHref: string | null;
    fullEditHref?: string | null;
    defaultRegion?: string | null;
};

export function RegisteredIntroBlockEditor({
    title,
    entityLabel,
    block,
    blockTypes,
    updateHref,
    storeHref,
    fullEditHref = null,
    defaultRegion = 'overview',
}: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const isCreateMode = block === null && storeHref !== null;
    const resolvedDefaultRegion = defaultRegion ?? 'overview';
    const mediaUrl =
        typeof block?.data_json?.['url'] === 'string'
            ? block.data_json['url']
            : '';
    const altText =
        typeof block?.data_json?.['alt'] === 'string'
            ? block.data_json['alt']
            : '';
    const form = useForm<IntroBlockFormData>({
        block_type: block?.block_type ?? blockTypes[0] ?? 'text',
        title: block?.title ?? '',
        body: block?.body ?? '',
        media_url: mediaUrl,
        alt_text: altText,
        region: block?.region ?? resolvedDefaultRegion,
        sort_order: block?.sort_order ?? 0,
        status: 'published',
    });

    if ((!block || !updateHref) && !isCreateMode) {
        if (!fullEditHref) {
            return null;
        }

        return (
            <Button
                asChild
                size="sm"
                variant="outline"
                className="h-8 rounded-full px-3"
            >
                <Link href={fullEditHref}>Full Edit</Link>
            </Button>
        );
    }

    const blockKindLabel =
        block?.block_type === 'quote'
            ? 'quote'
            : block?.block_type === 'image'
              ? 'image'
              : 'note';
    const fieldIdPrefix = entityLabel
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '');

    if (!isOpen) {
        return (
            <>
                <Button
                    type="button"
                    size="sm"
                    className="h-8 rounded-full px-3"
                    onClick={() => {
                        form.setData({
                            block_type: block?.block_type ?? blockTypes[0] ?? 'text',
                            title: block?.title ?? '',
                            body: block?.body ?? '',
                            media_url:
                                typeof block?.data_json?.['url'] === 'string'
                                    ? block.data_json['url']
                                    : '',
                            alt_text:
                                typeof block?.data_json?.['alt'] === 'string'
                                    ? block.data_json['alt']
                                    : '',
                            region: block?.region ?? resolvedDefaultRegion,
                            sort_order: block?.sort_order ?? 0,
                            status: 'published',
                        });
                        form.clearErrors();
                        setIsOpen(true);
                    }}
                >
                    {isCreateMode ? 'Add Intro' : 'Edit Intro'}
                </Button>
                {fullEditHref && (
                    <Button
                        asChild
                        size="sm"
                        variant="outline"
                        className="h-8 rounded-full px-3"
                    >
                        <Link href={fullEditHref}>Full Edit</Link>
                    </Button>
                )}
            </>
        );
    }

    return (
        <div className="basis-full pt-2">
            <ScriptureInlineRegionEditor
                title={isCreateMode ? `Add ${title.toLowerCase()}` : title}
                description={
                    isCreateMode
                        ? `Create the primary introductory block for ${entityLabel} without leaving the current public surface.`
                        : `Edit the primary introductory ${blockKindLabel} attached to ${entityLabel} without falling back to a protected workflow for common changes.`
                }
                fullEditHref={fullEditHref}
                mode={isCreateMode ? 'create' : 'edit'}
                onCancel={() => {
                    form.reset();
                    form.clearErrors();
                    setIsOpen(false);
                }}
                onSave={() => {
                    const payload = {
                        block_type: form.data.block_type,
                        title: form.data.title,
                        body: form.data.body,
                        region: isCreateMode
                            ? resolvedDefaultRegion
                            : form.data.region,
                        status: 'published' as const,
                        ...(form.data.block_type === 'image'
                            ? {
                                  media_url: form.data.media_url,
                                  alt_text: form.data.alt_text,
                              }
                            : {}),
                    };

                    if (isCreateMode) {
                        form.transform(() => ({
                            ...payload,
                            insertion_mode: 'start',
                        }));

                        form.post(storeHref!, {
                            preserveScroll: true,
                            onSuccess: () => setIsOpen(false),
                        });

                        return;
                    }

                    form.transform(() => ({
                        ...payload,
                        sort_order: form.data.sort_order,
                    }));

                    form.patch(updateHref!, {
                        preserveScroll: true,
                        onSuccess: () => setIsOpen(false),
                    });
                }}
                isDirty={form.isDirty}
                hasErrors={Object.keys(form.errors).length > 0}
                processing={form.processing}
            >
                <div className="grid gap-2">
                    <Label htmlFor={`${fieldIdPrefix}_intro_block_type`}>
                        Intro type
                    </Label>
                    <Select
                        value={form.data.block_type}
                        onValueChange={(value) =>
                            form.setData('block_type', value)
                        }
                    >
                        <SelectTrigger
                            id={`${fieldIdPrefix}_intro_block_type`}
                            className="w-full"
                        >
                            <SelectValue placeholder="Choose intro type" />
                        </SelectTrigger>
                        <SelectContent>
                            {blockTypes.map((blockType) => (
                                <SelectItem key={blockType} value={blockType}>
                                    {scriptureAdminStartCase(blockType)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <InputError message={form.errors.block_type} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor={`${fieldIdPrefix}_intro_title`}>Title</Label>
                    <Input
                        id={`${fieldIdPrefix}_intro_title`}
                        autoFocus
                        value={form.data.title}
                        onChange={(event) =>
                            form.setData('title', event.target.value)
                        }
                        placeholder="Block title"
                    />
                    <InputError message={form.errors.title} />
                </div>

                {form.data.block_type === 'image' ? (
                    <>
                        <div className="grid gap-2">
                            <Label htmlFor={`${fieldIdPrefix}_intro_media_url`}>
                                Image URL
                            </Label>
                            <Input
                                id={`${fieldIdPrefix}_intro_media_url`}
                                value={form.data.media_url}
                                onChange={(event) =>
                                    form.setData(
                                        'media_url',
                                        event.target.value,
                                    )
                                }
                                placeholder="https://example.test/intro-image.jpg"
                            />
                            <InputError message={form.errors.media_url} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor={`${fieldIdPrefix}_intro_alt_text`}>
                                Alt text
                            </Label>
                            <Input
                                id={`${fieldIdPrefix}_intro_alt_text`}
                                value={form.data.alt_text}
                                onChange={(event) =>
                                    form.setData(
                                        'alt_text',
                                        event.target.value,
                                    )
                                }
                                placeholder="Helpful description for the intro image"
                            />
                            <InputError message={form.errors.alt_text} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor={`${fieldIdPrefix}_intro_body`}>
                                Caption
                            </Label>
                            <Textarea
                                id={`${fieldIdPrefix}_intro_body`}
                                value={form.data.body}
                                onChange={(event) =>
                                    form.setData('body', event.target.value)
                                }
                                rows={6}
                                placeholder="Optional public caption or supporting intro copy"
                            />
                            <InputError message={form.errors.body} />
                        </div>
                    </>
                ) : (
                    <div className="grid gap-2">
                        <Label htmlFor={`${fieldIdPrefix}_intro_body`}>Body</Label>
                        <Textarea
                            id={`${fieldIdPrefix}_intro_body`}
                            value={form.data.body}
                            onChange={(event) =>
                                form.setData('body', event.target.value)
                            }
                            rows={8}
                            placeholder={
                                form.data.block_type === 'quote'
                                    ? 'Published intro quote'
                                    : 'Published introduction'
                            }
                        />
                        <InputError message={form.errors.body} />
                    </div>
                )}
            </ScriptureInlineRegionEditor>
        </div>
    );
}
