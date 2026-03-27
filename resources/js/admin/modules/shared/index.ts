export { AdminModuleHost } from './AdminModuleHost';
export {
    adminModuleRegistry,
    defineAdminModule,
    defineAdminModuleRegistry,
    getRegisteredAdminModules,
} from './module-registry';
export {
    BLOCK_CREATE_SURFACE_CAPABILITIES,
    EDITOR_SURFACE_CAPABILITIES,
    createAdminSurface,
    createBlockActionsSurface,
    createInlineEditorModuleSurface,
    createInlineEditorSurface,
    createInsertControlSurface,
    createSheetEditorModuleSurface,
    createSheetEditorSurface,
    createSurfaceOwner,
} from './surface-builders';
export {
    getQualifyingAdminModules,
    qualifyAdminModule,
} from './qualify-module';
export {
    getInlineEditorSurfaceMetadata,
    getSheetEditorSurfaceMetadata,
    isSurfaceMetadataObject,
} from './surface-metadata';
export type * from './module-types';
export type * from './surface-contracts';
