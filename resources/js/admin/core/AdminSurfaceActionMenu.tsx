import { router } from '@inertiajs/react';
import { ExternalLink, MoreHorizontal, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    resolveAdminControlAnchorSlot,
    resolveAdminControlPresentation,
} from './AdminControlPlacementResolver';
import type { AdminControlZone } from './admin-overlay-types';
import { resolveConsciousActionsForSurface } from '@/admin/actions';
import type { AdminSchemaFamily } from '@/admin/schema/fields';
import type { ScriptureEntityType } from '@/types';

type Props = {
    schemaFamily?: AdminSchemaFamily;
    entityType: ScriptureEntityType | (string & {});
    fieldName?: string | null;
    editLabel?: string;
    fullEditHref?: string | null;
    zone?: AdminControlZone | null;
    onEdit?: (() => void) | null;
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

export function AdminSurfaceActionMenu({
    schemaFamily = 'scripture',
    entityType,
    fieldName = null,
    editLabel = 'Edit',
    fullEditHref = null,
    zone = null,
    onEdit = null,
}: Props) {
    const safeFullEditHref = resolveSafeFullEditHref(fullEditHref);
    const menuActions = resolveConsciousActionsForSurface({
        schemaFamily,
        entityType,
        fieldName,
        controlLevel: 'field',
        hasEditHandler: Boolean(onEdit),
        hasFullEditHref: Boolean(safeFullEditHref),
    });
    const editAction = menuActions.find((action) => action.family === 'edit');
    const fullEditAction = menuActions.find(
        (action) => action.family === 'full_edit',
    );
    const hasEdit = Boolean(onEdit && editAction);
    const hasFullEdit = Boolean(safeFullEditHref && fullEditAction);
    const presentation = resolveAdminControlPresentation({
        surfaceKind: 'schema_field',
        family: 'quick_edit',
        preferredZone: zone,
    });
    const slot = resolveAdminControlAnchorSlot({
        surfaceKind: 'schema_field',
        family: 'quick_edit',
        preferredZone: zone,
    });

    if (!hasEdit && !hasFullEdit) {
        return null;
    }

    return (
        <div
            className="chronicle-admin-surface-action-menu-anchor"
            data-admin-control-zone={presentation.zone}
            data-admin-control-anchor="primary"
            data-admin-anchor-level="field"
            data-admin-anchor-slot={slot}
            data-admin-surface-kind="schema_field"
        >
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="chronicle-admin-surface-action-menu-trigger"
                        aria-label="Open admin actions"
                        title="Admin actions"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <MoreHorizontal className="size-4" aria-hidden="true" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    align="end"
                    className="chronicle-admin-surface-action-menu-content"
                    onClick={(event) => event.stopPropagation()}
                >
                    {hasEdit && (
                        <DropdownMenuItem
                            className="chronicle-admin-surface-action-menu-item"
                            onSelect={() => onEdit?.()}
                        >
                            <Pencil className="size-3.5" aria-hidden="true" />
                            {editAction?.label ?? editLabel}
                        </DropdownMenuItem>
                    )}
                    {hasFullEdit && safeFullEditHref && (
                        <DropdownMenuItem
                            className="chronicle-admin-surface-action-menu-item"
                            onSelect={() => router.visit(safeFullEditHref)}
                        >
                            <ExternalLink
                                className="size-3.5"
                                aria-hidden="true"
                            />
                            {fullEditAction?.label ?? 'Full Edit'}
                        </DropdownMenuItem>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
