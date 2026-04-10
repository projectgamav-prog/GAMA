import type { ComponentType } from 'react';
import type { ScriptureEntityType } from '@/types';
import type {
    AdminSurfaceCapability,
    AdminSurfaceContract,
    AdminSurfaceContractKey,
    AdminSurfacePlacement,
    AdminSurfaceSlot,
    AdminSurfaceVariant,
} from '../surfaces/core/surface-contracts';
import type { AdminSurfaceKey } from '../surfaces/core/surface-keys';

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

export type AdminModuleActionPlacement = 'inline' | 'header' | 'dropdown';

export type AdminModuleActionOpenMode = 'inline' | 'drawer' | 'modal';

export type AdminModuleActionVariant =
    | 'default'
    | 'secondary'
    | 'outline'
    | 'ghost'
    | 'destructive';

export type AdminSemanticActionKey =
    | 'edit_intro'
    | 'edit_identity'
    | 'edit_details'
    | 'edit_meta'
    | 'edit_translations'
    | 'edit_commentaries'
    | 'edit_media'
    | 'create_row'
    | 'delete_entity';

export type AdminModuleActionFamily =
    | 'edit'
    | 'create'
    | 'manage'
    | 'full_edit'
    | 'danger'
    | 'utility';

export type AdminModuleActionDefinition = {
    actionKey: AdminSemanticActionKey | (string & {});
    actionFamily?: AdminModuleActionFamily;
    defaultLabel?: string;
    dynamicLabel?: (surface: AdminSurfaceContract) => string;
    priority?: number;
    placement?: AdminModuleActionPlacement;
    openMode?: AdminModuleActionOpenMode;
    variant?: AdminModuleActionVariant;
    requiredCapabilities?: readonly AdminSurfaceCapability[];
    visibility?: (surface: AdminSurfaceContract) => boolean;
};

export type AdminResolvedModuleAction = {
    key: string;
    module: AdminModuleDefinition;
    action: AdminModuleActionDefinition;
    label: string;
    priority: number;
    placement: AdminModuleActionPlacement;
    openMode: AdminModuleActionOpenMode;
    variant: AdminModuleActionVariant;
};

export type AdminModuleActivation = {
    activeActionKey: string | null;
    isActive: boolean;
    action: AdminResolvedModuleAction | null;
    activate: (actionKey?: string) => void;
    deactivate: () => void;
};

export type AdminModuleComponentProps = {
    surface: AdminSurfaceContract;
    module: AdminModuleDefinition;
    activation: AdminModuleActivation;
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
    surfaceKeys?: AdminModuleScope<AdminSurfaceKey>;
    contractKeys?: AdminModuleScope<AdminSurfaceContractKey>;
    entityScope: AdminModuleScope<ScriptureEntityType>;
    surfaceSlots?: AdminModuleScope<AdminSurfaceSlot>;
    regionScope?: AdminModuleScope<string>;
    blockTypes?: AdminModuleScope<string>;
    presentationPlacements?: AdminModuleScope<AdminSurfacePlacement>;
    presentationVariants?: AdminModuleScope<AdminSurfaceVariant>;
    requiredCapabilities?: readonly AdminSurfaceCapability[];
    actions?: readonly AdminModuleActionDefinition[];
    qualifies?: (surface: AdminSurfaceContract) => boolean;
    EditorComponent: AdminModuleComponent;
    order?: number;
    description?: string;
};

