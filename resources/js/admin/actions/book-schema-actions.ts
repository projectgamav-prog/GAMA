import type { ConsciousAdminActionDefinition } from './conscious-action-types';

const unavailable = (
    reason: string,
): Pick<ConsciousAdminActionDefinition, 'enabled' | 'showInSurfaceMenu' | 'disabledReason'> => ({
    enabled: false,
    showInSurfaceMenu: false,
    disabledReason: reason,
});

const availableHidden = (): Pick<
    ConsciousAdminActionDefinition,
    'enabled' | 'showInSurfaceMenu' | 'disabledReason'
> => ({
    enabled: true,
    showInSurfaceMenu: false,
    disabledReason: null,
});

const FUTURE = 'Future action; no Conscious Admin backend contract exists yet.';
const REORDER_DISABLED =
    'Registered for awareness only. Reorder remains disabled until policy, diagnostics, and UI contracts are ready.';
const STRUCTURAL_DISABLED =
    'Registered for awareness only. Move/reparent remains disabled until explicit policy, diagnostics, and UI contracts are ready.';

const canonicalEntities = ['book', 'book_section', 'chapter', 'chapter_section', 'verse'] as const;
const contentBlockOwners = canonicalEntities;

const canonicalCreateActions = [
    ['book', 'canonical.create_book', 'Create book', 'page'],
    ['book', 'canonical.create_book_section', 'Add book section', 'section'],
    ['book_section', 'canonical.create_chapter', 'Add chapter', 'section'],
    ['chapter', 'canonical.create_chapter_section', 'Add chapter section', 'section'],
    ['chapter_section', 'canonical.create_verse', 'Add verse', 'section'],
] as const;

const contentBlockActions = [
    ['content_block.create', 'Create content block', 'create', 'section', 'protected'],
    ['content_block.update', 'Update content block', 'manage', 'card', 'protected'],
    ['content_block.delete', 'Delete content block', 'delete', 'card', 'dangerous'],
    ['content_block.duplicate', 'Duplicate content block', 'duplicate', 'card', 'protected'],
    ['content_block.reorder', 'Reorder content blocks', 'reorder', 'section', 'protected'],
] as const;

const mediaAssignmentActions = [
    ['media_assignment.attach', 'Attach media assignment', 'create', 'section', 'protected'],
    ['media_assignment.replace', 'Replace media assignment media', 'manage', 'card', 'protected'],
    ['media_assignment.update', 'Update media assignment', 'manage', 'card', 'protected'],
    ['media_assignment.detach', 'Detach media assignment', 'delete', 'card', 'dangerous'],
] as const;

const verseSupportActions = [
    ['verse_support.meta.update', 'Update verse meta', 'manage', 'entity', 'protected'],
    ['verse_support.translation.create', 'Create verse translation', 'create', 'section', 'protected'],
    ['verse_support.translation.update', 'Update verse translation', 'manage', 'section', 'protected'],
    ['verse_support.translation.delete', 'Delete verse translation', 'delete', 'section', 'dangerous'],
    ['verse_support.commentary.create', 'Create verse commentary', 'create', 'section', 'protected'],
    ['verse_support.commentary.update', 'Update verse commentary', 'manage', 'section', 'protected'],
    ['verse_support.commentary.delete', 'Delete verse commentary', 'delete', 'section', 'dangerous'],
] as const;

export const bookSchemaConsciousActions: readonly ConsciousAdminActionDefinition[] =
    [
        ...canonicalEntities.flatMap(
            (entityType) =>
                [
                    {
                        key: `${entityType}.schema_field.edit`,
                        schemaFamily: 'scripture',
                        entityType,
                        family: 'edit',
                        label: 'Edit',
                        menuGroup: 'content',
                        controlLevel: 'field',
                        uiMode: 'modal',
                        backendStatus: 'available_now',
                        risk: 'safe',
                        requiredCapability: 'edit',
                        backendAction: { type: 'field_route', fieldName: '*' },
                        fullEditCategory: 'Basic Content',
                        showInSurfaceMenu: true,
                        enabled: true,
                    },
                    {
                        key: `${entityType}.schema_entity.full_edit`,
                        schemaFamily: 'scripture',
                        entityType,
                        family: 'full_edit',
                        label: 'Full Edit',
                        menuGroup: 'identity',
                        controlLevel: 'entity',
                        uiMode: 'full_edit',
                        backendStatus: 'available_now',
                        risk: 'protected',
                        requiredCapability: 'full_edit',
                        backendAction: { type: 'conscious_full_edit' },
                        fullEditCategory: 'All Categories',
                        showInSurfaceMenu: true,
                        enabled: true,
                    },
                    {
                        key: `${entityType}.protected_identity.update`,
                        schemaFamily: 'scripture',
                        entityType,
                        family: 'identity',
                        label: 'Update protected identity',
                        menuGroup: 'identity',
                        controlLevel: 'entity',
                        uiMode: 'full_edit',
                        backendStatus: 'available_now',
                        risk: 'protected',
                        requiredCapability: 'manage',
                        backendAction: {
                            type: 'schema_action',
                            actionKey: 'protected_identity.update',
                        },
                        fullEditCategory: 'Canonical Identity',
                        ...availableHidden(),
                    },
                    {
                        key: `${entityType}.canonical.delete`,
                        schemaFamily: 'scripture',
                        entityType,
                        family: 'delete',
                        label: 'Delete canonical entity',
                        menuGroup: 'danger',
                        controlLevel: 'entity',
                        uiMode: 'confirmation',
                        backendStatus: 'available_now',
                        risk: 'dangerous',
                        requiredCapability: 'delete',
                        backendAction: {
                            type: 'schema_action',
                            actionKey: 'canonical.delete',
                        },
                        fullEditCategory: 'Advanced / Technical',
                        ...availableHidden(),
                    },
                ] satisfies ConsciousAdminActionDefinition[],
        ),
        ...canonicalCreateActions.map(
            ([entityType, actionKey, label, controlLevel]) =>
                ({
                    key: `${entityType}.${actionKey}`,
                    schemaFamily: 'scripture',
                    entityType,
                    family: 'create',
                    label,
                    menuGroup: 'structure',
                    controlLevel,
                    uiMode: 'modal',
                    backendStatus: 'available_now',
                    risk: 'protected',
                    requiredCapability: 'create',
                    backendAction: {
                        type: 'schema_action',
                        actionKey,
                    },
                    fullEditCategory: 'Structure & Parentage',
                    ...availableHidden(),
                }) satisfies ConsciousAdminActionDefinition,
        ),
        ...contentBlockOwners.flatMap((entityType) =>
            contentBlockActions.map(
                ([actionKey, label, family, controlLevel, risk]) =>
                    ({
                        key: `${entityType}.${actionKey}`,
                        schemaFamily: 'scripture',
                        entityType,
                        family,
                        label,
                        menuGroup: 'structure',
                        controlLevel,
                        uiMode: family === 'delete' || family === 'duplicate' ? 'confirmation' : 'modal',
                        backendStatus: 'available_now',
                        risk,
                        requiredCapability: family,
                        backendAction: {
                            type: 'schema_action',
                            actionKey,
                        },
                        fullEditCategory:
                            family === 'reorder'
                                ? 'Ordering'
                                : 'Advanced / Technical',
                        ...availableHidden(),
                    }) satisfies ConsciousAdminActionDefinition,
            ),
        ),
        ...mediaAssignmentActions.map(
            ([actionKey, label, family, controlLevel, risk]) =>
                ({
                    key: `book.${actionKey}`,
                    schemaFamily: 'scripture',
                    entityType: 'book',
                    family,
                    label,
                    menuGroup: 'media',
                    controlLevel,
                    uiMode: family === 'delete' ? 'confirmation' : 'drawer',
                    backendStatus: 'available_now',
                    risk,
                    requiredCapability: family === 'create' ? 'create' : 'manage',
                    backendAction: {
                        type: 'schema_action',
                        actionKey,
                    },
                    fullEditCategory: 'Media',
                    ...availableHidden(),
                }) satisfies ConsciousAdminActionDefinition,
        ),
        ...verseSupportActions.map(
            ([actionKey, label, family, controlLevel, risk]) =>
                ({
                    key: `verse.${actionKey}`,
                    schemaFamily: 'scripture',
                    entityType: 'verse',
                    family,
                    label,
                    menuGroup: 'support',
                    controlLevel,
                    uiMode: family === 'delete' ? 'confirmation' : 'drawer',
                    backendStatus: 'available_now',
                    risk,
                    requiredCapability: family === 'create' ? 'create' : 'manage',
                    backendAction: {
                        type: 'schema_action',
                        actionKey,
                    },
                    fullEditCategory: 'Support Data',
                    ...availableHidden(),
                }) satisfies ConsciousAdminActionDefinition,
        ),
        ...canonicalEntities.map(
            (entityType) =>
                ({
                    key: `${entityType}.canonical.reorder`,
                    schemaFamily: 'scripture',
                    entityType,
                    family: 'reorder',
                    label: 'Reorder canonical hierarchy',
                    menuGroup: 'structure',
                    controlLevel: 'section',
                    uiMode: 'drawer',
                    backendStatus: 'needs_conscious_backend',
                    risk: 'protected',
                    requiredCapability: 'reorder',
                    backendAction: {
                        type: 'schema_action',
                        actionKey: 'canonical.reorder',
                    },
                    fullEditCategory: 'Ordering',
                    ...unavailable(REORDER_DISABLED),
                }) satisfies ConsciousAdminActionDefinition,
        ),
        ...canonicalEntities.flatMap(
            (entityType) =>
                [
                    {
                        key: `${entityType}.canonical.move`,
                        schemaFamily: 'scripture',
                        entityType,
                        family: 'move',
                        label: 'Move canonical entity',
                        menuGroup: 'structure',
                        controlLevel: 'entity',
                        uiMode: 'drawer',
                        backendStatus: 'needs_conscious_backend',
                        risk: 'protected',
                        requiredCapability: 'move',
                        backendAction: {
                            type: 'schema_action',
                            actionKey: 'canonical.move',
                        },
                        fullEditCategory: 'Structure & Parentage',
                        ...unavailable(STRUCTURAL_DISABLED),
                    },
                    {
                        key: `${entityType}.canonical.reparent`,
                        schemaFamily: 'scripture',
                        entityType,
                        family: 'move',
                        label: 'Reparent canonical entity',
                        menuGroup: 'structure',
                        controlLevel: 'entity',
                        uiMode: 'drawer',
                        backendStatus: 'needs_conscious_backend',
                        risk: 'protected',
                        requiredCapability: 'move',
                        backendAction: {
                            type: 'schema_action',
                            actionKey: 'canonical.reparent',
                        },
                        fullEditCategory: 'Structure & Parentage',
                        ...unavailable(STRUCTURAL_DISABLED),
                    },
                ] satisfies ConsciousAdminActionDefinition[],
        ),
        {
            key: 'book.media_assignment.reorder',
            schemaFamily: 'scripture',
            entityType: 'book',
            family: 'reorder',
            label: 'Reorder media assignments',
            menuGroup: 'media',
            controlLevel: 'section',
            uiMode: 'drawer',
            backendStatus: 'needs_conscious_backend',
            risk: 'protected',
            requiredCapability: 'reorder',
            backendAction: {
                type: 'schema_action',
                actionKey: 'media_assignment.reorder',
            },
            fullEditCategory: 'Media',
            ...unavailable(REORDER_DISABLED),
        },
        ...(['translation', 'commentary'] as const).map(
            (kind) =>
                ({
                    key: `verse.verse_support.${kind}.reorder`,
                    schemaFamily: 'scripture',
                    entityType: 'verse',
                    family: 'reorder',
                    label: `Reorder verse ${kind === 'translation' ? 'translations' : 'commentaries'}`,
                    menuGroup: 'support',
                    controlLevel: 'section',
                    uiMode: 'drawer',
                    backendStatus: 'needs_conscious_backend',
                    risk: 'protected',
                    requiredCapability: 'reorder',
                    backendAction: {
                        type: 'schema_action',
                        actionKey: `verse_support.${kind}.reorder`,
                    },
                    fullEditCategory: 'Support Data',
                    ...unavailable(REORDER_DISABLED),
                }) satisfies ConsciousAdminActionDefinition,
        ),
        {
            key: 'topic.admin.future',
            schemaFamily: 'scripture',
            entityType: 'topic',
            family: 'manage',
            label: 'Manage topic',
            menuGroup: 'support',
            controlLevel: 'entity',
            uiMode: 'disabled',
            backendStatus: 'future',
            risk: 'protected',
            requiredCapability: 'manage',
            backendAction: { type: 'none' },
            fullEditCategory: 'Support Data',
            ...unavailable(FUTURE),
        },
        {
            key: 'character.admin.future',
            schemaFamily: 'scripture',
            entityType: 'character',
            family: 'manage',
            label: 'Manage character',
            menuGroup: 'support',
            controlLevel: 'entity',
            uiMode: 'disabled',
            backendStatus: 'future',
            risk: 'protected',
            requiredCapability: 'manage',
            backendAction: { type: 'none' },
            fullEditCategory: 'Support Data',
            ...unavailable(FUTURE),
        },
    ];
