import { Link } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';

/**
 * Shared inline editor frame used by the safe public-page edit flows.
 *
 * The lifecycle is intentionally consistent across books, chapters, and verses:
 * view -> edit in place -> save or cancel -> local feedback on the surface.
 * More complex editors still use the existing sheet fallback instead of this
 * frame.
 */
type Props = {
    title: string;
    description?: string;
    children: ReactNode;
    fullEditHref?: string | null;
    onCancel: () => void;
    onSave: () => void;
    mode?: 'create' | 'edit';
    metaSlot?: ReactNode;
    isDirty?: boolean;
    hasErrors?: boolean;
    cancelLabel?: string;
    saveLabel?: string;
    processing?: boolean;
    processingLabel?: string;
};

export function ScriptureInlineRegionEditor({
    title,
    description,
    children,
    fullEditHref,
    onCancel,
    onSave,
    mode = 'edit',
    metaSlot,
    isDirty = false,
    hasErrors = false,
    cancelLabel = mode === 'create' ? 'Discard' : 'Cancel',
    saveLabel = 'Save',
    processing = false,
    processingLabel = 'Saving...',
}: Props) {
    return (
        <div className="rounded-2xl border border-border/70 bg-background/95 px-4 py-4 shadow-sm sm:px-5">
            <div className="space-y-2">
                <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                    {mode === 'create' ? 'Creating here' : 'Editing here'}
                </p>
                <div className="space-y-1">
                    <h3 className="text-base font-semibold">{title}</h3>
                    {description && (
                        <p className="text-sm leading-6 text-muted-foreground">
                            {description}
                        </p>
                    )}
                </div>
                {metaSlot}
            </div>

            {hasErrors ? (
                <div className="mt-5 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm leading-6 text-destructive">
                    Fix the highlighted fields and save again. Your changes are
                    still local to this editor.
                </div>
            ) : isDirty ? (
                <div className="mt-5 rounded-xl border border-border/70 bg-muted/20 px-4 py-3 text-sm leading-6 text-muted-foreground">
                    Unsaved changes are local to this region until you save.
                </div>
            ) : null}

            <div className="mt-5 space-y-5">{children}</div>

            <div className="mt-6 flex flex-wrap gap-2 border-t pt-4">
                <Button
                    type="button"
                    variant="outline"
                    data-scripture-editor-action="cancel"
                    onClick={onCancel}
                    disabled={processing}
                >
                    {cancelLabel}
                </Button>
                {fullEditHref && (
                    <Button asChild variant="outline">
                        <Link
                            href={fullEditHref}
                            data-scripture-editor-action="full-edit"
                        >
                            Full edit
                        </Link>
                    </Button>
                )}
                <Button
                    type="button"
                    data-scripture-editor-action="save"
                    onClick={onSave}
                    disabled={processing}
                >
                    {processing ? processingLabel : saveLabel}
                </Button>
            </div>
        </div>
    );
}
