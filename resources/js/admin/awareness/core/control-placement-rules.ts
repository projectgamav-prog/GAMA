import type {
    AdminControlResolutionInput,
    AdminResolvedControlFamily,
    AdminResolvedControlPlacement,
} from './control-resolution-types';

export function resolveDefaultControlPlacement(
    input: AdminControlResolutionInput,
    family: AdminResolvedControlFamily,
): AdminResolvedControlPlacement {
    const layout = input.layout;

    if (layout?.visualRole === 'anchor') {
        return 'between-items';
    }

    if (layout?.preferredPlacement) {
        return layout.preferredPlacement;
    }

    switch (layout?.layoutZone) {
        case 'section_header':
            return family === 'create' || family === 'manage'
                ? 'section-header'
                : 'top-right';
        case 'list_row':
            return 'inline-end';
        case 'block':
            return family === 'create' || family === 'reorder'
                ? 'bottom-edge'
                : 'top-right';
        case 'rail':
            return 'top-right';
        case 'hero':
            return family === 'edit' ? 'top-right' : 'bottom-edge';
        default:
            return 'top-right';
    }
}
