import { ScriptureBookIntroInlineEditor } from '@/components/scripture/scripture-book-intro-inline-editor';
import type { ScriptureBookAdminEditSession } from '@/lib/book-admin-edit-session';
import { defineAdminModule } from '@/admin/modules/shared/module-registry';
import type { AdminModuleComponentProps } from '@/admin/modules/shared/module-types';
import type { AdminSurfaceContract } from '@/admin/modules/shared/surface-contracts';

type InlineBookIntroSession = Extract<
    ScriptureBookAdminEditSession,
    { kind: 'entity_details' }
>;

type BookIntroSurfaceMetadata = {
    session: InlineBookIntroSession | null;
    onCancel: () => void;
    onSaveSuccess?: () => void;
};

const getMetadata = (
    surface: AdminSurfaceContract,
): BookIntroSurfaceMetadata | null => {
    const metadata = surface.metadata;

    if (!metadata || typeof metadata !== 'object') {
        return null;
    }

    const candidate = metadata as Partial<BookIntroSurfaceMetadata>;

    return typeof candidate.onCancel === 'function'
        ? (candidate as BookIntroSurfaceMetadata)
        : null;
};

function BookIntroEditor({ surface }: AdminModuleComponentProps) {
    const metadata = getMetadata(surface);

    if (metadata === null) {
        return null;
    }

    return (
        <ScriptureBookIntroInlineEditor
            session={metadata.session}
            onCancel={metadata.onCancel}
            onSaveSuccess={metadata.onSaveSuccess}
        />
    );
}

export const bookIntroEditorModule = defineAdminModule({
    key: 'book-intro-editor',
    entityScope: 'book',
    surfaceSlots: 'inline_editor',
    regionScope: 'page_intro',
    requiredCapabilities: ['edit'],
    EditorComponent: BookIntroEditor,
    order: 10,
    description:
        'Renders the current inline book intro editor when the page-intro surface qualifies.',
});
