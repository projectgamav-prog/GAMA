import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

export type AdminOverlayTone =
    | 'neutral'
    | 'active'
    | 'danger'
    | 'primary'
    | 'edit'
    | 'accept'
    | 'discard'
    | 'advanced'
    | 'add'
    | 'ordering';

export type AdminOverlayPlacement =
    | 'inline'
    | 'top-left'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-right'
    | 'bottom-edge'
    | 'inline-end'
    | 'between-items'
    | 'section-header'
    | 'rail-edge'
    | 'corner_outset_top_right'
    | 'corner_outset_top_left'
    | 'corner_outset_bottom_right'
    | 'corner_outset_bottom_left';

export type AdminControlZone = AdminOverlayPlacement;

export type AdminControlSurfaceKind =
    | 'schema_field'
    | 'content_block'
    | 'card'
    | 'block'
    | 'section'
    | 'region'
    | 'page'
    | 'section_header'
    | 'rail'
    | 'list_row'
    | 'between_item_anchor'
    | 'layout_container'
    | 'fallback';

export type AdminControlFamily =
    | 'quick_edit'
    | 'accept'
    | 'discard'
    | 'full_edit'
    | 'delete'
    | 'add'
    | 'ordering'
    | 'structured'
    | 'manage';

export type AdminOverlayAction = {
    key: string;
    label: ReactNode;
    icon?: LucideIcon;
    tone?: AdminOverlayTone;
    active?: boolean;
};
