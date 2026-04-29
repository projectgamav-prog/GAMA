import { router } from '@inertiajs/react';
import { Check, ExternalLink, Pencil, Trash2, X } from 'lucide-react';
import { AdminOverlayActionButton } from './AdminOverlayActionButton';
import {
    resolveAdminControlAnchorSlot,
    resolveAdminControlPresentation,
} from './AdminControlPlacementResolver';
import type { AdminControlZone } from './admin-overlay-types';

type Props = {
    isEditing: boolean;
    processing?: boolean;
    fullEditHref?: string | null;
    deleteLabel?: string | null;
    zone?: AdminControlZone | null;
    onEdit: () => void;
    onDiscard: () => void;
    onAccept: () => void;
    onDelete?: (() => void) | null;
};

function resolveSafeFullEditHref(href: string | null | undefined): string | null {
    const trimmedHref = href?.trim();

    if (!trimmedHref || trimmedHref === '#') {
        return null;
    }

    if (trimmedHref.startsWith('/') || /^https?:\/\//.test(trimmedHref)) {
        return trimmedHref;
    }

    return null;
}

export function AdminFieldIconControls({
    isEditing,
    processing = false,
    fullEditHref = null,
    deleteLabel = null,
    zone = null,
    onEdit,
    onDiscard,
    onAccept,
    onDelete = null,
}: Props) {
    const clusterPresentation = resolveAdminControlPresentation({
        surfaceKind: 'schema_field',
        family: 'quick_edit',
        preferredZone: zone,
    });
    const modePresentation = resolveAdminControlPresentation({
        surfaceKind: 'schema_field',
        family: isEditing ? 'discard' : 'quick_edit',
    });
    const acceptPresentation = resolveAdminControlPresentation({
        surfaceKind: 'schema_field',
        family: 'accept',
    });
    const fullEditPresentation = resolveAdminControlPresentation({
        surfaceKind: 'schema_field',
        family: 'full_edit',
    });
    const deletePresentation = resolveAdminControlPresentation({
        surfaceKind: 'schema_field',
        family: 'delete',
    });
    const safeFullEditHref = resolveSafeFullEditHref(fullEditHref);
    const modeSlot = resolveAdminControlAnchorSlot({
        surfaceKind: 'schema_field',
        family: isEditing ? 'discard' : 'quick_edit',
        preferredZone: zone,
    });
    const acceptSlot = resolveAdminControlAnchorSlot({
        surfaceKind: 'schema_field',
        family: 'accept',
        preferredZone: zone,
    });
    const fullEditSlot = resolveAdminControlAnchorSlot({
        surfaceKind: 'schema_field',
        family: 'full_edit',
    });
    const deleteSlot = resolveAdminControlAnchorSlot({
        surfaceKind: 'schema_field',
        family: 'delete',
    });

    return (
        <>
            <div
                className="chronicle-admin-field-control-anchor chronicle-admin-field-control-anchor-primary"
                data-admin-control-zone={clusterPresentation.zone}
                data-admin-control-anchor="primary"
                data-admin-anchor-level="field"
                data-admin-anchor-slot={modeSlot}
                data-admin-surface-kind="schema_field"
            >
                <span
                    className="chronicle-admin-field-control-slot"
                    data-admin-field-control-slot="mode"
                    data-admin-anchor-slot={modeSlot}
                    data-admin-control-family={
                        isEditing ? 'discard' : 'quick_edit'
                    }
                >
                    <AdminOverlayActionButton
                        icon={isEditing ? X : Pencil}
                        iconOnly
                        tone={modePresentation.tone}
                        title={isEditing ? 'Discard changes' : 'Edit field'}
                        aria-label={
                            isEditing ? 'Discard changes' : 'Edit field'
                        }
                        disabled={processing}
                        onClick={(event) => {
                            event.stopPropagation();
                            if (isEditing) {
                                onDiscard();
                                return;
                            }

                            onEdit();
                        }}
                    >
                        {isEditing ? 'Discard changes' : 'Edit field'}
                    </AdminOverlayActionButton>
                </span>

                <span
                    className="chronicle-admin-field-control-slot"
                    data-admin-field-control-slot="accept"
                    data-admin-anchor-slot={acceptSlot}
                    data-admin-control-family="accept"
                >
                    {isEditing && (
                        <AdminOverlayActionButton
                            icon={Check}
                            iconOnly
                            tone={acceptPresentation.tone}
                            title={
                                processing ? 'Saving changes' : 'Accept changes'
                            }
                            aria-label={
                                processing
                                    ? 'Saving changes'
                                    : 'Accept changes'
                            }
                            disabled={processing}
                            onClick={(event) => {
                                event.stopPropagation();
                                onAccept();
                            }}
                        >
                            {processing ? 'Saving changes' : 'Accept changes'}
                        </AdminOverlayActionButton>
                    )}
                </span>
            </div>

            <div
                className="chronicle-admin-field-control-anchor chronicle-admin-field-control-anchor-secondary"
                data-admin-control-zone={fullEditPresentation.zone}
                data-admin-control-anchor="secondary"
                data-admin-anchor-level="field"
                data-admin-anchor-slot={fullEditSlot}
                data-admin-surface-kind="schema_field"
            >
                <span
                    className="chronicle-admin-field-control-slot"
                    data-admin-field-control-slot="full-edit"
                    data-admin-anchor-slot={fullEditSlot}
                    data-admin-control-family="full_edit"
                >
                    {safeFullEditHref && (
                        <AdminOverlayActionButton
                            icon={ExternalLink}
                            iconOnly
                            tone={fullEditPresentation.tone}
                            title="Full edit"
                            aria-label="Full edit"
                            onClick={(event) => {
                                event.preventDefault();
                                event.stopPropagation();
                                router.visit(safeFullEditHref);
                            }}
                        >
                            Full edit
                        </AdminOverlayActionButton>
                    )}
                </span>

                <span
                    className="chronicle-admin-field-control-slot"
                    data-admin-field-control-slot="delete"
                    data-admin-anchor-slot={deleteSlot}
                    data-admin-control-family="delete"
                >
                    {onDelete && (
                        <AdminOverlayActionButton
                            icon={Trash2}
                            iconOnly
                            tone={deletePresentation.tone}
                            title={deleteLabel ?? 'Delete'}
                            aria-label={deleteLabel ?? 'Delete'}
                            disabled={processing}
                            onClick={(event) => {
                                event.stopPropagation();
                                onDelete();
                            }}
                        >
                            {deleteLabel ?? 'Delete'}
                        </AdminOverlayActionButton>
                    )}
                </span>
            </div>
        </>
    );
}
