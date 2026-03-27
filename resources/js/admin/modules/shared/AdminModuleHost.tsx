import { adminModuleRegistry } from './module-registry';
import type { AdminModuleDefinition } from './module-types';
import type { AdminSurfaceContract } from './surface-contracts';
import { getQualifyingAdminModules } from './qualify-module';

type Props = {
    surface: AdminSurfaceContract;
    modules?: readonly AdminModuleDefinition[];
};

/**
 * Shared host for capability-driven admin modules.
 *
 * Pages and shared renderers hand the host a surface contract. The host then
 * resolves qualifying modules from the central registry and renders them in
 * deterministic order, keeping concrete editor imports out of page files.
 */
export function AdminModuleHost({
    surface,
    modules = adminModuleRegistry,
}: Props) {
    const qualifyingModules = getQualifyingAdminModules(surface, modules);

    if (qualifyingModules.length === 0) {
        return null;
    }

    return (
        <>
            {qualifyingModules.map((module) => {
                const EditorComponent = module.EditorComponent;

                return (
                    <EditorComponent
                        key={module.key}
                        module={module}
                        surface={surface}
                    />
                );
            })}
        </>
    );
}
