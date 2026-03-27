import type { AdminModuleDefinition } from './module-types';
import { bookIntroEditorModule } from '@/admin/modules/books/BookIntroEditor';
import { bookSheetEditorModule } from '@/admin/modules/books/BookSheetEditor';
import { chapterIntroEditorModule } from '@/admin/modules/chapters/ChapterIntroEditor';
import { chapterSheetEditorModule } from '@/admin/modules/chapters/ChapterSheetEditor';
import { verseNotesEditorModule } from '@/admin/modules/verses/VerseNotesEditor';
import { verseSheetEditorModule } from '@/admin/modules/verses/VerseSheetEditor';
import { blockCreateModule } from '@/admin/modules/blocks/BlockCreate';
import { blockDragReorderModule } from '@/admin/modules/blocks/BlockDragReorder';
import { blockReorderModule } from '@/admin/modules/blocks/BlockReorder';
import { blockDuplicateModule } from '@/admin/modules/blocks/BlockDuplicate';
import { blockDeleteModule } from '@/admin/modules/blocks/BlockDelete';
import { blockFullEditLauncherModule } from '@/admin/modules/blocks/BlockFullEditLauncher';
import { textBlockEditorModule } from '@/admin/modules/blocks/TextBlockEditor';
import { quoteBlockEditorModule } from '@/admin/modules/blocks/QuoteBlockEditor';
import { imageBlockEditorModule } from '@/admin/modules/blocks/ImageBlockEditor';
import { videoBlockEditorModule } from '@/admin/modules/blocks/VideoBlockEditor';

/**
 * Small helper for future module definitions so module files can export typed
 * registrations without repeating the full interface.
 */
export function defineAdminModule(
    module: AdminModuleDefinition,
): AdminModuleDefinition {
    return module;
}

/**
 * Keeps module ordering deterministic regardless of import order.
 */
export function defineAdminModuleRegistry(
    modules: readonly AdminModuleDefinition[],
): readonly AdminModuleDefinition[] {
    return [...modules].sort((left, right) => {
        const orderDifference = (left.order ?? 0) - (right.order ?? 0);

        if (orderDifference !== 0) {
            return orderDifference;
        }

        return left.key.localeCompare(right.key);
    });
}

/**
 * Central registry for reusable admin editor modules.
 *
 * Pages and shared admin surfaces should mount the host and let the registry
 * plus qualification rules attach the right module automatically.
 */
export const adminModuleRegistry = defineAdminModuleRegistry([
    bookIntroEditorModule,
    chapterIntroEditorModule,
    verseNotesEditorModule,
    textBlockEditorModule,
    quoteBlockEditorModule,
    imageBlockEditorModule,
    videoBlockEditorModule,
    blockCreateModule,
    blockDragReorderModule,
    blockReorderModule,
    blockDuplicateModule,
    blockDeleteModule,
    blockFullEditLauncherModule,
    bookSheetEditorModule,
    chapterSheetEditorModule,
    verseSheetEditorModule,
]);

export function getRegisteredAdminModules(): readonly AdminModuleDefinition[] {
    return adminModuleRegistry;
}
