import { Link } from '@inertiajs/react';
import { Check, ExternalLink, Eye, X } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AdminOverlayActionButton } from './AdminOverlayActionButton';

type Props = {
    onSave: () => void;
    onDiscard: () => void;
    onView?: () => void;
    fullEditHref?: string | null;
    processing?: boolean;
    saveLabel?: ReactNode;
    discardLabel?: ReactNode;
    viewLabel?: ReactNode;
    processingLabel?: ReactNode;
};

export function AdminOverlayEditFooter({
    onSave,
    onDiscard,
    onView,
    fullEditHref = null,
    processing = false,
    saveLabel = 'Save',
    discardLabel = 'Discard',
    viewLabel = 'View',
    processingLabel = 'Saving...',
}: Props) {
    return (
        <div className="chronicle-admin-edit-footer">
            {onView && (
                <AdminOverlayActionButton
                    icon={Eye}
                    onClick={onView}
                    disabled={processing}
                >
                    {viewLabel}
                </AdminOverlayActionButton>
            )}
            <AdminOverlayActionButton
                icon={X}
                onClick={onDiscard}
                disabled={processing}
            >
                {discardLabel}
            </AdminOverlayActionButton>
            {fullEditHref && (
                <Button
                    asChild
                    variant="ghost"
                    className="chronicle-admin-action-button"
                >
                    <Link href={fullEditHref}>
                        <ExternalLink className="size-3.5" aria-hidden="true" />
                        Full edit
                    </Link>
                </Button>
            )}
            <AdminOverlayActionButton
                icon={Check}
                tone="primary"
                onClick={onSave}
                disabled={processing}
            >
                {processing ? processingLabel : saveLabel}
            </AdminOverlayActionButton>
        </div>
    );
}
