import type { ComponentType } from 'react';
import type { ScriptureEntityType } from '@/types';
import type {
    AdminSurfaceCapability,
    AdminSurfaceContract,
    AdminSurfaceSlot,
} from './surface-contracts';

/**
 * A module scope can match a specific value, a fixed set of values, or
 * everything using the wildcard.
 */
export type AdminModuleScope<T extends string> =
    | '*'
    | T
    | readonly T[]
    | null
    | undefined;

export type AdminModuleComponentProps = {
    surface: AdminSurfaceContract;
    module: AdminModuleDefinition;
};

export type AdminModuleComponent = ComponentType<AdminModuleComponentProps>;

/**
 * Shared definition for a reusable admin editor module.
 *
 * Modules stay page-agnostic. They declare the surfaces they can attach to and
 * the capabilities they require, then the host renders the matching editor
 * component when a surface qualifies.
 */
export type AdminModuleDefinition = {
    key: string;
    entityScope: AdminModuleScope<ScriptureEntityType>;
    surfaceSlots?: AdminModuleScope<AdminSurfaceSlot>;
    regionScope?: AdminModuleScope<string>;
    blockTypes?: AdminModuleScope<string>;
    requiredCapabilities?: readonly AdminSurfaceCapability[];
    EditorComponent: AdminModuleComponent;
    order?: number;
    description?: string;
};
