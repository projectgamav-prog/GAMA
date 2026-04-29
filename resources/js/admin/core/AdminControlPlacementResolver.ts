import type {
    AdminAnchorLevel,
    AdminAnchorSlot,
} from './AdminLayoutAnchors';
import type {
    AdminControlFamily,
    AdminControlSurfaceKind,
    AdminControlZone,
    AdminOverlayTone,
} from './admin-overlay-types';

export type AdminControlPlacementInput = {
    surfaceKind: AdminControlSurfaceKind;
    family: AdminControlFamily;
    preferredZone?: AdminControlZone | null;
    anchorLevel?: AdminAnchorLevel | null;
};

export type AdminResolvedControlPresentation = {
    anchorLevel: AdminAnchorLevel;
    anchorSlot: AdminAnchorSlot;
    zone: AdminControlZone;
    tone: AdminOverlayTone;
};

const FIELD_CONTROL_ZONES = new Set<AdminControlFamily>([
    'quick_edit',
    'accept',
    'discard',
    'full_edit',
    'delete',
]);

export function resolveAdminAnchorLevel({
    surfaceKind,
}: Pick<AdminControlPlacementInput, 'surfaceKind'>): AdminAnchorLevel {
    if (surfaceKind === 'schema_field') {
        return 'field';
    }

    if (surfaceKind === 'content_block' || surfaceKind === 'block') {
        return 'block';
    }

    if (surfaceKind === 'card' || surfaceKind === 'list_row') {
        return 'card';
    }

    if (surfaceKind === 'section' || surfaceKind === 'section_header') {
        return 'section';
    }

    if (surfaceKind === 'rail' || surfaceKind === 'layout_container') {
        return 'region';
    }

    if (surfaceKind === 'page') {
        return 'page';
    }

    return 'card';
}

export function resolveAdminControlAnchorSlot({
    surfaceKind,
    family,
    anchorLevel = null,
}: AdminControlPlacementInput): AdminAnchorSlot {
    const level = anchorLevel ?? resolveAdminAnchorLevel({ surfaceKind });

    if (level === 'field') {
        return family === 'full_edit' || family === 'delete'
            ? 'field.top-left'
            : 'field.top-right';
    }

    if (level === 'block' || level === 'card') {
        if (family === 'add') {
            return 'card.bottom-edge';
        }

        if (family === 'full_edit' || family === 'delete') {
            return 'card.top-left';
        }

        return 'card.top-right';
    }

    if (level === 'section') {
        if (family === 'add') {
            return 'section.bottom-edge';
        }

        if (family === 'ordering') {
            return 'section.between-items';
        }

        return 'section.header-right';
    }

    if (level === 'region') {
        if (family === 'add') {
            return 'region.empty-state';
        }

        return 'region.top';
    }

    return 'page.settings';
}

export function resolveAdminControlZone({
    surfaceKind,
    family,
    preferredZone = null,
}: AdminControlPlacementInput): AdminControlZone {
    if (preferredZone) {
        return preferredZone;
    }

    if (surfaceKind === 'schema_field' && FIELD_CONTROL_ZONES.has(family)) {
        return family === 'full_edit' || family === 'delete'
            ? 'corner_outset_top_left'
            : 'corner_outset_top_right';
    }

    if (family === 'add') {
        return surfaceKind === 'section_header'
            ? 'section-header'
            : 'bottom-edge';
    }

    if (family === 'ordering') {
        return surfaceKind === 'between_item_anchor'
            ? 'between-items'
            : 'inline-end';
    }

    if (surfaceKind === 'rail') {
        return 'rail-edge';
    }

    if (surfaceKind === 'list_row') {
        return 'inline-end';
    }

    if (surfaceKind === 'section_header') {
        return 'section-header';
    }

    return 'top-right';
}

export function resolveAdminControlTone(
    family: AdminControlFamily,
): AdminOverlayTone {
    if (family === 'quick_edit') {
        return 'edit';
    }

    if (family === 'accept') {
        return 'accept';
    }

    if (family === 'discard') {
        return 'discard';
    }

    if (family === 'full_edit' || family === 'structured' || family === 'manage') {
        return 'advanced';
    }

    if (family === 'delete') {
        return 'danger';
    }

    if (family === 'add') {
        return 'add';
    }

    if (family === 'ordering') {
        return 'ordering';
    }

    return 'neutral';
}

export function resolveAdminControlPresentation(
    input: AdminControlPlacementInput,
): AdminResolvedControlPresentation {
    const anchorLevel =
        input.anchorLevel ?? resolveAdminAnchorLevel({ surfaceKind: input.surfaceKind });

    return {
        anchorLevel,
        anchorSlot: resolveAdminControlAnchorSlot({
            ...input,
            anchorLevel,
        }),
        zone: resolveAdminControlZone(input),
        tone: resolveAdminControlTone(input.family),
    };
}
