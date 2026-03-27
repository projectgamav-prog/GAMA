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
    ADMIN_SURFACE_KEYS,
    BOOK_CONTENT_BLOCKS_SURFACE_KEY,
    BOOK_INTRO_SURFACE_KEY,
    BOOK_MEDIA_SLOTS_SURFACE_KEY,
    CHAPTER_CONTENT_BLOCKS_SURFACE_KEY,
    CHAPTER_INTRO_SURFACE_KEY,
    VERSE_INTRO_SURFACE_KEY,
    VERSE_META_SURFACE_KEY,
    VERSE_NOTES_SURFACE_KEY,
    resolveSemanticSurfaceKey,
} from './surface-keys';
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
