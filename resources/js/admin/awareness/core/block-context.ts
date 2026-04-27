import type { AdminSurfaceIdentifier } from '@/admin/surfaces/core/surface-contracts';
import type { AdminQuickEditContentKind } from '@/admin/surfaces/core/surface-contracts';

export type AdminFieldKind =
    | 'title'
    | 'description'
    | 'body'
    | 'caption'
    | 'metadata'
    | 'relation'
    | 'media'
    | (string & {});

export type AdminBlockContext = {
    blockId?: AdminSurfaceIdentifier | null;
    blockType?: string | null;
    contentKind?: AdminQuickEditContentKind | null;
    fieldKind?: AdminFieldKind | null;
    moduleKey?: string | null;
};
