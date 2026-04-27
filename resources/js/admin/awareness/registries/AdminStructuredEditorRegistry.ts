import type {
    AdminBlockContext,
    AdminControlResolutionInput,
    AdminResolvedControlMode,
    AdminSurfaceContext,
} from '../core/awareness-types';

export type AdminStructuredEditorDefinition = {
    key: string;
    label: string;
    mode: Extract<AdminResolvedControlMode, 'structured_editor' | 'drawer'>;
    supports: (input: AdminControlResolutionInput) => boolean;
    surface?: Partial<AdminSurfaceContext>;
    block?: Partial<AdminBlockContext>;
};

const structuredEditors = new Map<string, AdminStructuredEditorDefinition>();

export function registerAdminStructuredEditor(
    definition: AdminStructuredEditorDefinition,
): void {
    structuredEditors.set(definition.key, definition);
}

export function registerAdminStructuredEditors(
    definitions: readonly AdminStructuredEditorDefinition[],
): void {
    definitions.forEach(registerAdminStructuredEditor);
}

export function getAdminStructuredEditor(
    key: string,
): AdminStructuredEditorDefinition | null {
    return structuredEditors.get(key) ?? null;
}

export function hasAdminStructuredEditor(key: string): boolean {
    return structuredEditors.has(key);
}

export function listAdminStructuredEditors(): AdminStructuredEditorDefinition[] {
    return [...structuredEditors.values()];
}

export function clearAdminStructuredEditorsForTests(): void {
    structuredEditors.clear();
}
