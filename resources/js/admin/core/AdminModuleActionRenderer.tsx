import {
    Edit3,
    ExternalLink,
    Languages,
    MessageSquareQuote,
    MoreHorizontal,
    Plus,
    Settings2,
    Trash2,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { AdminSurfaceContract } from '../surfaces/core/surface-contracts';
import type { AdminResolvedModuleAction } from './module-types';
import { AdminOverlayActionButton } from './AdminOverlayActionButton';
import { AdminOverlayControlStrip } from './AdminOverlayControlStrip';

type Props = {
    surface: AdminSurfaceContract;
    actions: readonly AdminResolvedModuleAction[];
    activeActionKey: string | null;
    onAction: (action: AdminResolvedModuleAction) => void;
};

function resolveActionIcon(action: AdminResolvedModuleAction): LucideIcon {
    switch (action.action.actionKey) {
        case 'create_row':
            return Plus;
        case 'delete_entity':
            return Trash2;
        case 'edit_translations':
            return Languages;
        case 'edit_commentaries':
            return MessageSquareQuote;
        case 'edit_media':
            return Settings2;
        default:
            return action.action.actionFamily === 'full_edit'
                ? ExternalLink
                : Edit3;
    }
}

export function AdminModuleActionRenderer({
    surface,
    actions,
    activeActionKey,
    onAction,
}: Props) {
    if (actions.length === 0) {
        return null;
    }

    const directActions = actions.filter(
        (action) =>
            action.placement === 'header' || action.placement === 'inline',
    );
    const dropdownActions = actions.filter(
        (action) => action.placement === 'dropdown',
    );

    return (
        <AdminOverlayControlStrip
            data-admin-diagnostic-layer="old"
            data-admin-diagnostic-label="old admin"
        >
            {directActions.map((action) => (
                <AdminOverlayActionButton
                    key={action.key}
                    icon={resolveActionIcon(action)}
                    className="chronicle-admin-action-button-old"
                    title="old admin"
                    aria-label={`${action.label} (old admin)`}
                    data-admin-diagnostic-layer="old"
                    data-admin-diagnostic-label="old admin"
                    data-admin-action-key={action.key}
                    data-admin-module-key={action.module.key}
                    data-admin-entity={surface.entity}
                    data-admin-entity-id={surface.entityId}
                    data-admin-region-key={surface.regionKey ?? undefined}
                    active={activeActionKey === action.key}
                    tone={
                        action.variant === 'destructive' ||
                        action.action.actionFamily === 'danger'
                            ? 'danger'
                            : 'neutral'
                    }
                    onClick={() => onAction(action)}
                >
                    {action.label}
                </AdminOverlayActionButton>
            ))}

            {dropdownActions.length > 0 && (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <AdminOverlayActionButton
                            icon={MoreHorizontal}
                            className="chronicle-admin-action-button-old"
                            title="old admin"
                            aria-label="More old admin actions"
                            data-admin-diagnostic-layer="old"
                            data-admin-diagnostic-label="old admin"
                            data-admin-action-key="dropdown:more"
                            data-admin-entity={surface.entity}
                            data-admin-entity-id={surface.entityId}
                            data-admin-region-key={
                                surface.regionKey ?? undefined
                            }
                        >
                            More
                        </AdminOverlayActionButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        align="end"
                        className="chronicle-admin-diagnostic-old-menu !border-[#050505] !bg-[#050505] !text-[#fff8eb]"
                        data-admin-diagnostic-layer="old"
                        data-admin-diagnostic-label="old admin"
                    >
                        {dropdownActions.map((action) => (
                            <DropdownMenuItem
                                key={action.key}
                                className="chronicle-admin-diagnostic-old-menu-item gap-2 text-xs !text-[#fff8eb] focus:!bg-[#1a1a1a] focus:!text-[#fff8eb] [&_svg]:!text-[#fff8eb]"
                                data-admin-diagnostic-layer="old"
                                data-admin-diagnostic-label="old admin"
                                data-admin-action-key={action.key}
                                data-admin-entity={surface.entity}
                                data-admin-entity-id={surface.entityId}
                                data-admin-region-key={
                                    surface.regionKey ?? undefined
                                }
                                onSelect={() => onAction(action)}
                            >
                                {(() => {
                                    const Icon = resolveActionIcon(action);

                                    return (
                                        <Icon
                                            className="size-3.5"
                                            aria-hidden="true"
                                        />
                                    );
                                })()}
                                {action.label}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            )}
        </AdminOverlayControlStrip>
    );
}
