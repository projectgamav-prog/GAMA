import type { AdminSurfaceContract } from '@/admin/surfaces/core/surface-contracts';
import type { ScriptureContentBlock } from '@/types';
import {
    createContentBlocksSection,
    createIntroTextSection,
    type UniversalSectionDescriptor,
} from '@/rendering/core';

type ScriptureIntroSectionArgs = {
    id: string;
    label: string;
    block: ScriptureContentBlock | null | undefined;
    adminSurface?: AdminSurfaceContract | null;
    variant?: 'default' | 'header';
    className?: string;
    layout?: UniversalSectionDescriptor['layout'];
};

type ScriptureContentBlocksSectionArgs = {
    id: string;
    blocks: ScriptureContentBlock[];
    adminSurfaces?: Record<number, AdminSurfaceContract | null | undefined>;
    className?: string;
    layout?: UniversalSectionDescriptor['layout'];
};

export function createScriptureIntroTextSection({
    id,
    label,
    block,
    adminSurface = null,
    variant,
    className,
    layout,
}: ScriptureIntroSectionArgs) {
    return createIntroTextSection({
        id,
        content: {
            label,
            block,
            adminSurface,
            variant,
            className,
        },
        surface: adminSurface,
        layout,
    });
}

export function createScriptureContentBlocksSection({
    id,
    blocks,
    adminSurfaces,
    className,
    layout,
}: ScriptureContentBlocksSectionArgs) {
    return createContentBlocksSection({
        id,
        content: {
            blocks: blocks.map((block) => ({
                block,
                adminSurface: adminSurfaces?.[block.id] ?? null,
            })),
            className,
        },
        layout,
    });
}
