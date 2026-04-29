import type { AdminSchemaFamily } from '@/admin/schema/fields';
import type { ScriptureEntityType } from '@/types';

export type ConsciousAdminActionFamily =
    | 'edit'
    | 'full_edit'
    | 'identity'
    | 'create'
    | 'reorder'
    | 'delete'
    | 'manage'
    | 'duplicate'
    | 'move';

export type ConsciousAdminMenuGroup =
    | 'content'
    | 'identity'
    | 'structure'
    | 'media'
    | 'relations'
    | 'support'
    | 'danger';

export type ConsciousAdminControlLevel =
    | 'field'
    | 'entity'
    | 'card'
    | 'section'
    | 'region'
    | 'page';

export type ConsciousAdminUiMode =
    | 'inline'
    | 'modal'
    | 'drawer'
    | 'full_edit'
    | 'confirmation'
    | 'disabled';

export type ConsciousAdminBackendStatus =
    | 'available_now'
    | 'old_endpoint_only'
    | 'needs_conscious_backend'
    | 'future';

export type ConsciousAdminRiskLevel = 'safe' | 'protected' | 'dangerous';

export type ConsciousAdminRequiredCapability =
    | 'edit'
    | 'full_edit'
    | 'create'
    | 'reorder'
    | 'delete'
    | 'manage'
    | 'duplicate'
    | 'move';

export type ConsciousAdminFullEditCategory =
    | 'Basic Content'
    | 'Canonical Identity'
    | 'Structure & Parentage'
    | 'Ordering'
    | 'Publishing / Visibility'
    | 'Media'
    | 'Relations'
    | 'Support Data'
    | 'Advanced / Technical'
    | 'All Categories';

export type ConsciousAdminBackendAction =
    | {
          type: 'field_route';
          fieldName: string;
      }
    | {
          type: 'conscious_full_edit';
      }
    | {
          type: 'schema_action';
          actionKey: string;
      }
    | {
          type: 'old_endpoint_fallback';
          routeName: string;
      }
    | {
          type: 'none';
      };

export type ConsciousAdminActionDefinition = {
    key: string;
    schemaFamily: AdminSchemaFamily;
    entityType: ScriptureEntityType | (string & {});
    family: ConsciousAdminActionFamily;
    label: string;
    menuGroup: ConsciousAdminMenuGroup;
    controlLevel: ConsciousAdminControlLevel;
    uiMode: ConsciousAdminUiMode;
    backendStatus: ConsciousAdminBackendStatus;
    risk: ConsciousAdminRiskLevel;
    requiredCapability: ConsciousAdminRequiredCapability;
    backendAction: ConsciousAdminBackendAction;
    fullEditCategory?: ConsciousAdminFullEditCategory | null;
    showInSurfaceMenu: boolean;
    enabled?: boolean;
    disabledReason?: string | null;
};

export type ConsciousAdminActionQuery = {
    schemaFamily?: AdminSchemaFamily;
    entityType: ScriptureEntityType | (string & {});
    fieldName?: string | null;
    controlLevel?: ConsciousAdminControlLevel | null;
    includeUnavailable?: boolean;
};

export type ConsciousAdminSurfaceActionContext = {
    schemaFamily?: AdminSchemaFamily;
    entityType: ScriptureEntityType | (string & {});
    fieldName?: string | null;
    controlLevel: ConsciousAdminControlLevel;
    hasEditHandler?: boolean;
    hasFullEditHref?: boolean;
};

export type ConsciousAdminSurfaceActionGroup = {
    menuGroup: ConsciousAdminMenuGroup;
    actions: readonly ConsciousAdminActionDefinition[];
};
