import { Link } from '@inertiajs/react';
import { Check, ExternalLink, X } from 'lucide-react';
import type { ReactNode } from 'react';
import { AdminOverlayActionButton } from '@/admin/core/AdminOverlayActionButton';
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
        <div className="chronicle-admin-overlay-frame chronicle-admin-overlay-active px-4 py-4 sm:px-5">
            <div className="space-y-2">
                <p className="chronicle-kicker text-[0.68rem]">
                    {mode === 'create' ? 'Creating here' : 'Editing here'}
                </p>
                <div className="space-y-1">
                    <h3 className="font-serif text-lg font-semibold text-[color:var(--chronicle-ink)]">
                        {title}
                    </h3>
                    {description && (
                        <p className="text-sm leading-6 text-[color:var(--chronicle-brown)]">
                            {description}
                        </p>
                    )}
                </div>
                {metaSlot}
            </div>

            {hasErrors ? (
                <div className="mt-5 rounded-sm border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm leading-6 text-destructive">
                    Fix the highlighted fields and save again. Your changes are
                    still local to this editor.
                </div>
            ) : isDirty ? (
                <div className="mt-5 rounded-sm border border-[color:var(--chronicle-border)] bg-[rgba(173,122,44,0.08)] px-4 py-3 text-sm leading-6 text-[color:var(--chronicle-brown)]">
                    Unsaved changes are local to this region until you save.
                </div>
            ) : null}

            <div className="mt-5 space-y-5">{children}</div>

            <div className="chronicle-admin-edit-footer mt-6">
                <AdminOverlayActionButton
                    icon={X}
                    data-scripture-editor-action="cancel"
                    onClick={onCancel}
                    disabled={processing}
                >
                    {cancelLabel}
                </AdminOverlayActionButton>
                {fullEditHref && (
                    <Button
                        asChild
                        variant="ghost"
                        className="chronicle-admin-action-button"
                    >
                        <Link
                            href={fullEditHref}
                            data-scripture-editor-action="full-edit"
                        >
                            <ExternalLink
                                className="size-3.5"
                                aria-hidden="true"
                            />
                            Full edit
                        </Link>
                    </Button>
                )}
                <AdminOverlayActionButton
                    icon={Check}
                    tone="primary"
                    data-scripture-editor-action="save"
                    onClick={onSave}
                    disabled={processing}
                >
                    {processing ? processingLabel : saveLabel}
                </AdminOverlayActionButton>
            </div>
        </div>
    );
}
