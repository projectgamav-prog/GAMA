import { adminModuleRegistry } from './module-registry';
import type { AdminModuleDefinition } from './module-types';
import type { AdminSurfaceContract } from './surface-contracts';
import { getQualifyingAdminModules } from './qualify-module';

type Props = {
    surface: AdminSurfaceContract;
    modules?: readonly AdminModuleDefinition[];
};

/**
 * Shared host for future admin editor modules.
 *
 * Pages will eventually mount this host for an editable surface and let the
 * registry plus qualification rules decide which modules attach. Until real
 * modules are registered, this host remains inert and returns nothing.
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
