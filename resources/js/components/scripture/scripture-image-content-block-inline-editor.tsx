import { useForm } from '@inertiajs/react';
import { useEffect, useEffectEvent, useRef } from 'react';
import InputError from '@/components/input-error';
import { ScriptureInlineRegionEditor } from '@/components/scripture/scripture-inline-region-editor';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { scriptureInlineRegionLabel } from '@/lib/scripture-inline-admin';
import type { InlineImageContentBlockCreateSession } from '@/lib/scripture-inline-image-content-block';
import type { ScriptureContentBlock } from '@/types';

type ImageContentBlockFormData = {
    block_type: 'image';
    title: string;
    body: string;
    region: string;
    sort_order: number | null;
    status: 'draft' | 'published';
    media_url: string;
    alt_text: string;
    insertion_mode: 'start' | 'before' | 'after' | 'end' | null;
    relative_block_id: number | null;
};

export type InlineImageContentBlockSession = {
    updateHref: string;
    fullEditHref: string;
    block: ScriptureContentBlock;
    values: {
        title: string;
        body: string;
        region: string;
        sort_order: number;
        status: 'draft' | 'published';
        media_url: string;
        alt_text: string;
    };
};

type Props = {
    session:
        | InlineImageContentBlockSession
        | InlineImageContentBlockCreateSession
        | null;
    entityLabel: string;
    onCancel: () => void;
    onSaveSuccess?: (blockId: number | null) => void;
};

const isCreateSession = (
    session:
        | InlineImageContentBlockSession
        | InlineImageContentBlockCreateSession
        | null,
): session is InlineImageContentBlockCreateSession =>
    session !== null && 'storeHref' in session;

export function ScriptureImageContentBlockInlineEditor({
    session,
    entityLabel,
    onCancel,
    onSaveSuccess,
}: Props) {
    const form = useForm<ImageContentBlockFormData>({
        block_type: 'image',
        title: '',
        body: '',
        region: 'overview',
        sort_order: null,
        status: 'published',
        media_url: '',
        alt_text: '',
        insertion_mode: null,
        relative_block_id: null,
    });
    const formErrors = form.errors as Record<string, string>;
    const titleInputRef = useRef<HTMLInputElement | null>(null);

    const syncSession = useEffectEvent(
        (
            currentSession:
                | InlineImageContentBlockSession
                | InlineImageContentBlockCreateSession
                | null,
        ) => {
            if (currentSession === null) {
                form.reset();
                form.clearErrors();

                return;
            }

            if (isCreateSession(currentSession)) {
                form.setData({
                    block_type: 'image',
                    title: currentSession.values.title,
                    body: currentSession.values.body,
                    region: currentSession.values.region,
                    sort_order: null,
                    status: currentSession.values.status,
                    media_url: currentSession.values.media_url,
                    alt_text: currentSession.values.alt_text,
                    insertion_mode: currentSession.values.insertion_mode,
                    relative_block_id: currentSession.values.relative_block_id,
                });
            } else {
                form.setData({
                    block_type: 'image',
                    title: currentSession.values.title,
                    body: currentSession.values.body,
                    region: currentSession.values.region,
                    sort_order: currentSession.values.sort_order,
                    status: currentSession.values.status,
                    media_url: currentSession.values.media_url,
                    alt_text: currentSession.values.alt_text,
                    insertion_mode: null,
                    relative_block_id: null,
                });
            }
            form.clearErrors();
        },
    );

    useEffect(() => {
        syncSession(session);
    }, [session, syncSession]);

    useEffect(() => {
        if (session === null) {
            return;
        }

        titleInputRef.current?.focus();
        titleInputRef.current?.select();
    }, [session]);

    if (session === null) {
        return null;
    }

    const fieldSuffix = isCreateSession(session)
        ? session.editorKey
        : String(session.block.id);
    const hasUnsavedChanges = isCreateSession(session)
        ? form.data.title.trim().length > 0 ||
          form.data.body.trim().length > 0 ||
          form.data.media_url.trim().length > 0 ||
          form.data.alt_text.trim().length > 0
        : form.data.title !== session.values.title ||
          form.data.body !== session.values.body ||
          form.data.media_url !== session.values.media_url ||
          form.data.alt_text !== session.values.alt_text;
    const handleCancel = () => {
        form.reset();
        form.clearErrors();
        onCancel();
    };

    return (
        <ScriptureInlineRegionEditor
            title={
                isCreateSession(session)
                    ? 'Create published image block'
                    : 'Edit published image block'
            }
            description={
                isCreateSession(session)
                    ? `Add a new ${scriptureInlineRegionLabel(session.values.region).toLowerCase()} image block directly in ${entityLabel}. ${session.insertionPoint.label}.`
                    : `Edit this ${scriptureInlineRegionLabel(session.block.region).toLowerCase()} image block directly in ${entityLabel}.`
            }
            fullEditHref={session.fullEditHref}
            onCancel={handleCancel}
            mode={isCreateSession(session) ? 'create' : 'edit'}
            metaSlot={
                <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">Image block</Badge>
                    <Badge variant="secondary">
                        {scriptureInlineRegionLabel(
                            isCreateSession(session)
                                ? session.values.region
                                : session.block.region,
                        )}
                    </Badge>
                    <Badge variant="outline">
                        {isCreateSession(session)
                            ? session.insertionPoint.label
                            : 'Existing block'}
                    </Badge>
                </div>
            }
            onSave={() => {
                if (isCreateSession(session)) {
                    form.transform((data) => ({
                        block_type: data.block_type,
                        title: data.title,
                        body: data.body,
                        region: data.region,
                        status: data.status,
                        media_url: data.media_url,
                        alt_text: data.alt_text,
                        insertion_mode: data.insertion_mode,
                        relative_block_id: data.relative_block_id,
                    }));
                    form.post(session.storeHref, {
                        preserveScroll: true,
                        onSuccess: () => {
                            onSaveSuccess?.(null);
                            handleCancel();
                        },
                    });

                    return;
                }

                form.transform((data) => ({
                    block_type: data.block_type,
                    title: data.title,
                    body: data.body,
                    region: data.region,
                    sort_order: data.sort_order,
                    status: data.status,
                    media_url: data.media_url,
                    alt_text: data.alt_text,
                }));
                form.patch(session.updateHref, {
                    preserveScroll: true,
                    onSuccess: () => {
                        onSaveSuccess?.(session.block.id);
                        handleCancel();
                    },
                });
            }}
            saveLabel={isCreateSession(session) ? 'Add block' : 'Save'}
            isDirty={hasUnsavedChanges}
            hasErrors={Object.keys(formErrors).length > 0}
            processing={form.processing}
            processingLabel={isCreateSession(session) ? 'Adding...' : 'Saving...'}
        >
            <div className="grid gap-2">
                <Label htmlFor={`inline_image_block_title_${fieldSuffix}`}>
                    Title
                </Label>
                <Input
                    id={`inline_image_block_title_${fieldSuffix}`}
                    ref={titleInputRef}
                    value={form.data.title}
                    onChange={(event) =>
                        form.setData('title', event.target.value)
                    }
                    placeholder="Image block title"
                />
                <InputError message={formErrors.title} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor={`inline_image_block_media_url_${fieldSuffix}`}>
                    Image URL
                </Label>
                <Input
                    id={`inline_image_block_media_url_${fieldSuffix}`}
                    value={form.data.media_url}
                    onChange={(event) =>
                        form.setData('media_url', event.target.value)
                    }
                    placeholder="https://example.test/image.jpg"
                />
                <InputError message={formErrors.media_url} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor={`inline_image_block_alt_text_${fieldSuffix}`}>
                    Alt text
                </Label>
                <Input
                    id={`inline_image_block_alt_text_${fieldSuffix}`}
                    value={form.data.alt_text}
                    onChange={(event) =>
                        form.setData('alt_text', event.target.value)
                    }
                    placeholder="Helpful description for the image"
                />
                <InputError message={formErrors.alt_text} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor={`inline_image_block_body_${fieldSuffix}`}>
                    Caption
                </Label>
                <Textarea
                    id={`inline_image_block_body_${fieldSuffix}`}
                    value={form.data.body}
                    onChange={(event) =>
                        form.setData('body', event.target.value)
                    }
                    rows={6}
                    placeholder="Public caption or supporting copy"
                />
                <InputError message={formErrors.body} />
            </div>
        </ScriptureInlineRegionEditor>
    );
}
