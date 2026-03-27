import { useForm } from '@inertiajs/react';
import { useEffect, useEffectEvent, useRef } from 'react';
import InputError from '@/components/input-error';
import { ScriptureInlineRegionEditor } from '@/components/scripture/scripture-inline-region-editor';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { InlineTextContentBlockCreateSession } from '@/lib/scripture-inline-text-content-block';
import { scriptureInlineRegionLabel } from '@/lib/scripture-inline-admin';
import type {
    ScriptureContentBlock,
    ScriptureContentBlockInsertionMode,
} from '@/types';

/**
 * Inline editor for the safest live block flow: published text notes and new
 * inline text-note creation.
 *
 * It owns only local form state. The surrounding session hook decides when this
 * editor is active, whether it represents create or edit mode, and what local
 * success feedback should appear after a successful mutation.
 */
type TextContentBlockFormData = {
    block_type?: string;
    title: string;
    body: string;
    region: string;
    sort_order: number | null;
    status: 'draft' | 'published';
    insertion_mode: ScriptureContentBlockInsertionMode | null;
    relative_block_id: number | null;
};

export type InlineTextContentBlockSession = {
    updateHref: string;
    fullEditHref: string;
    block: ScriptureContentBlock;
    values: {
        block_type?: string;
        title: string;
        body: string;
        region: string;
        sort_order: number;
        status: 'draft' | 'published';
    };
};

export type InlineTextContentBlockSaveResult =
    | {
          kind: 'create';
      }
    | {
          kind: 'edit';
          blockId: number;
      };

type Props = {
    session:
        | InlineTextContentBlockSession
        | InlineTextContentBlockCreateSession
        | null;
    entityLabel: string;
    onCancel: () => void;
    onSaveSuccess?: (result: InlineTextContentBlockSaveResult) => void;
};

const isCreateSession = (
    session:
        | InlineTextContentBlockSession
        | InlineTextContentBlockCreateSession
        | null,
): session is InlineTextContentBlockCreateSession =>
    session !== null && 'storeHref' in session;

export function ScriptureTextContentBlockInlineEditor({
    session,
    entityLabel,
    onCancel,
    onSaveSuccess,
}: Props) {
    const form = useForm<TextContentBlockFormData>({
        block_type: 'text',
        title: '',
        body: '',
        region: 'study',
        sort_order: null,
        status: 'published',
        insertion_mode: null,
        relative_block_id: null,
    });
    const formErrors = form.errors as Record<string, string>;
    const titleInputRef = useRef<HTMLInputElement | null>(null);

    const syncSession = useEffectEvent(
        (
            currentSession:
                | InlineTextContentBlockSession
                | InlineTextContentBlockCreateSession
                | null,
        ) => {
            if (currentSession === null) {
                form.reset();
                form.clearErrors();

                return;
            }

            if (isCreateSession(currentSession)) {
                form.setData({
                    block_type: currentSession.values.block_type,
                    title: currentSession.values.title,
                    body: currentSession.values.body,
                    region: currentSession.values.region,
                    sort_order: null,
                    status: currentSession.values.status,
                    insertion_mode: currentSession.values.insertion_mode,
                    relative_block_id: currentSession.values.relative_block_id,
                });
            } else {
                form.setData({
                    block_type:
                        currentSession.values.block_type ??
                        currentSession.block.block_type,
                    title: currentSession.values.title,
                    body: currentSession.values.body,
                    region: currentSession.values.region,
                    sort_order: currentSession.values.sort_order,
                    status: currentSession.values.status,
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
        ? form.data.title.trim().length > 0 || form.data.body.trim().length > 0
        : form.data.title !== session.values.title ||
          form.data.body !== session.values.body;
    // Cancel always clears the local form first so unsaved create/edit state
    // disappears predictably when the session closes.
    const handleCancel = () => {
        form.reset();
        form.clearErrors();
        onCancel();
    };

    return (
        <ScriptureInlineRegionEditor
            title={
                isCreateSession(session)
                    ? 'Create published note'
                    : 'Edit published note'
            }
            description={
                isCreateSession(session)
                    ? `Add a new ${scriptureInlineRegionLabel(session.values.region).toLowerCase()} note directly in ${entityLabel}. ${session.insertionPoint.label}.`
                    : `Edit this ${scriptureInlineRegionLabel(session.block.region).toLowerCase()} note directly in ${entityLabel}.`
            }
            fullEditHref={session.fullEditHref}
            onCancel={handleCancel}
            mode={isCreateSession(session) ? 'create' : 'edit'}
            metaSlot={
                <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">Text block</Badge>
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
                    // Inline create preserves the page-attached insertion
                    // context and lets the session hook decide what feedback to
                    // show after the block is saved.
                    form.transform((data) => ({
                        block_type: data.block_type,
                        title: data.title,
                        body: data.body,
                        region: data.region,
                        status: data.status,
                        insertion_mode: data.insertion_mode,
                        relative_block_id: data.relative_block_id,
                    }));
                    form.post(session.storeHref, {
                        preserveScroll: true,
                        onSuccess: () => {
                            onSaveSuccess?.({
                                kind: 'create',
                            });
                            handleCancel();
                        },
                    });

                    return;
                }

                // Existing text blocks keep using the stable update endpoint so
                // inline editing remains a UI refinement, not a backend fork.
                form.transform((data) => ({
                    title: data.title,
                    body: data.body,
                    region: data.region,
                    sort_order: data.sort_order,
                    status: data.status,
                }));
                form.patch(session.updateHref, {
                    preserveScroll: true,
                    onSuccess: () => {
                        onSaveSuccess?.({
                            kind: 'edit',
                            blockId: session.block.id,
                        });
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
                <Label htmlFor={`inline_block_title_${fieldSuffix}`}>
                    Title
                </Label>
                <Input
                    id={`inline_block_title_${fieldSuffix}`}
                    ref={titleInputRef}
                    value={form.data.title}
                    onChange={(event) =>
                        form.setData('title', event.target.value)
                    }
                    placeholder="Block title"
                />
                <InputError message={formErrors.title} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor={`inline_block_body_${fieldSuffix}`}>
                    Body
                </Label>
                <Textarea
                    id={`inline_block_body_${fieldSuffix}`}
                    value={form.data.body}
                    onChange={(event) =>
                        form.setData('body', event.target.value)
                    }
                    rows={8}
                    placeholder="Published note copy"
                />
                <InputError message={formErrors.body} />
            </div>
        </ScriptureInlineRegionEditor>
    );
}
