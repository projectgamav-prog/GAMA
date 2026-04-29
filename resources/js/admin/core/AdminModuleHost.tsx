import type { AdminSurfaceContract } from '../surfaces/core/surface-contracts';
import type { AdminModuleDefinition } from './module-types';

type Props = {
    surface: AdminSurfaceContract;
    modules?: readonly AdminModuleDefinition[];
    className?: string;
};

/**
 * @deprecated Legacy public-page module UI is quarantined. Public scripture
 * pages and reusable renderers must use Conscious Admin schema surfaces,
 * action menus, and Conscious Full Edit instead of this host.
 *
 * This component remains only as an import-compatibility shim while old
 * renderer call sites are removed. It intentionally does not import the legacy
 * module registry, action resolver, action renderer, or inline editor panels.
 */
export function AdminModuleHost(_props: Props) {
    return null;
}

export function isLegacyAdminModuleUiEnabled(): boolean {
    return false;
}
