import type {
    AdminBlockContext,
    AdminLayoutPositionContext,
    AdminSurfaceContext,
} from '../core/awareness-types';

export type AdminSurfaceManifestDefinition = {
    key: string;
    surface: AdminSurfaceContext;
    block?: AdminBlockContext | null;
    layout?: AdminLayoutPositionContext | null;
};

const surfaceManifests = new Map<string, AdminSurfaceManifestDefinition>();

export function registerAdminSurfaceManifest(
    definition: AdminSurfaceManifestDefinition,
): void {
    surfaceManifests.set(definition.key, definition);
}

export function registerAdminSurfaceManifests(
    definitions: readonly AdminSurfaceManifestDefinition[],
): void {
    definitions.forEach(registerAdminSurfaceManifest);
}

export function getAdminSurfaceManifest(
    key: string,
): AdminSurfaceManifestDefinition | null {
    return surfaceManifests.get(key) ?? null;
}

export function hasAdminSurfaceManifest(key: string): boolean {
    return surfaceManifests.has(key);
}

export function listAdminSurfaceManifests(): AdminSurfaceManifestDefinition[] {
    return [...surfaceManifests.values()];
}

export function clearAdminSurfaceManifestsForTests(): void {
    surfaceManifests.clear();
}
