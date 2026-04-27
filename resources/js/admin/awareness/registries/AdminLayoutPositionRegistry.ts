import type {
    AdminLayoutPositionContext,
    AdminPreferredPlacement,
    AdminResolvedControlPlacement,
} from '../core/awareness-types';

export type AdminLayoutPositionDefinition = {
    key: string;
    layoutZone: AdminLayoutPositionContext['layoutZone'];
    visualRole?: AdminLayoutPositionContext['visualRole'] | null;
    defaultPlacement: AdminResolvedControlPlacement;
    allowedPlacements?: readonly AdminPreferredPlacement[];
};

const layoutPositions = new Map<string, AdminLayoutPositionDefinition>();

export function registerAdminLayoutPosition(
    definition: AdminLayoutPositionDefinition,
): void {
    layoutPositions.set(definition.key, definition);
}

export function registerAdminLayoutPositions(
    definitions: readonly AdminLayoutPositionDefinition[],
): void {
    definitions.forEach(registerAdminLayoutPosition);
}

export function getAdminLayoutPosition(
    key: string,
): AdminLayoutPositionDefinition | null {
    return layoutPositions.get(key) ?? null;
}

export function hasAdminLayoutPosition(key: string): boolean {
    return layoutPositions.has(key);
}

export function listAdminLayoutPositions(): AdminLayoutPositionDefinition[] {
    return [...layoutPositions.values()];
}

export function clearAdminLayoutPositionsForTests(): void {
    layoutPositions.clear();
}
