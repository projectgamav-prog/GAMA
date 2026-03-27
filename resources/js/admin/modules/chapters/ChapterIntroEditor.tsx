import { ScriptureChapterIntroInlineEditor } from '@/components/scripture/scripture-chapter-intro-inline-editor';
import type { ScriptureChapterAdminEditSession } from '@/components/scripture/scripture-chapter-admin-edit-sheet';
import { defineAdminModule } from '@/admin/modules/shared/module-registry';
import type { AdminModuleComponentProps } from '@/admin/modules/shared/module-types';
import type { AdminSurfaceContract } from '@/admin/modules/shared/surface-contracts';

type ChapterIntroSurfaceMetadata = {
    session: ScriptureChapterAdminEditSession | null;
    onCancel: () => void;
    onSaveSuccess?: () => void;
};

const getMetadata = (
    surface: AdminSurfaceContract,
): ChapterIntroSurfaceMetadata | null => {
    const metadata = surface.metadata;

    if (!metadata || typeof metadata !== 'object') {
        return null;
    }

    const candidate = metadata as Partial<ChapterIntroSurfaceMetadata>;

    return typeof candidate.onCancel === 'function'
        ? (candidate as ChapterIntroSurfaceMetadata)
        : null;
};

function ChapterIntroEditor({ surface }: AdminModuleComponentProps) {
    const metadata = getMetadata(surface);

    if (metadata === null) {
        return null;
    }

    return (
        <ScriptureChapterIntroInlineEditor
            session={metadata.session}
            onCancel={metadata.onCancel}
            onSaveSuccess={metadata.onSaveSuccess}
        />
    );
}

export const chapterIntroEditorModule = defineAdminModule({
    key: 'chapter-intro-editor',
    entityScope: 'chapter',
    surfaceSlots: 'inline_editor',
    regionScope: 'page_intro',
    requiredCapabilities: ['edit'],
    EditorComponent: ChapterIntroEditor,
    order: 10,
    description:
        'Renders the live inline chapter intro editor for the page-intro surface.',
});
