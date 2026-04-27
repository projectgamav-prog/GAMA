import { AdminSurfaceBoundary } from '@/admin/core/AdminSurfaceBoundary';
import {
    AdminSurfaceEmitter,
    createEntityContextFromSurface,
    createSurfaceContextFromContract,
} from '@/admin/awareness/core';
import type { AdminSurfaceContract } from '@/admin/surfaces/core/surface-contracts';
import { ContentBlockRenderer } from '@/components/scripture/content-block-renderer';
import { cn } from '@/lib/utils';
import type { ScriptureContentBlock } from '@/types';
import type { ReactNode } from 'react';

type Props = {
    label: string;
    block: ScriptureContentBlock | null | undefined;
    adminSurface?: AdminSurfaceContract | null;
    variant?: 'default' | 'header';
    className?: string;
};

export function ScriptureIntroBlock({
    label,
    block,
    adminSurface = null,
    variant = 'default',
    className,
}: Props) {
    if (!block) {
        return null;
    }

    const isHeaderVariant = variant === 'header';
    const wrapWithAdminBoundary = (content: ReactNode) => (
        <>
            {adminSurface && (
                <AdminSurfaceEmitter
                    manifestKey={`intro:${adminSurface.entity}:${adminSurface.entityId}:${adminSurface.regionKey ?? 'intro'}`}
                    entity={createEntityContextFromSurface(adminSurface)}
                    surface={createSurfaceContextFromContract(adminSurface)}
                    block={{
                        blockId: block.id,
                        blockType: block.block_type,
                        contentKind:
                            block.block_type === 'text'
                                ? 'intro_block_text'
                                : block.block_type,
                        fieldKind: 'body',
                    }}
                    layout={{
                        layoutZone: isHeaderVariant ? 'hero' : 'block',
                        visualRole: 'field',
                        preferredPlacement: 'top-right',
                    }}
                    actionCapabilities={{
                        canQuickEdit: Boolean(adminSurface.quickEdit),
                        canStructuredEdit:
                            adminSurface.capabilities.includes('edit'),
                        canFullEdit:
                            adminSurface.capabilities.includes('full_edit'),
                    }}
                    quickEdit={{
                        quickEdit: adminSurface.quickEdit ?? null,
                        fullEditFallbackAvailable:
                            Boolean(adminSurface.quickEdit?.fullEditHref),
                    }}
                />
            )}
            <AdminSurfaceBoundary
                surface={adminSurface}
                emptyPlaceholder={
                    <p className="text-sm leading-6 text-[color:var(--chronicle-brown)]">
                        Add intro text here.
                    </p>
                }
            >
                {content}
            </AdminSurfaceBoundary>
        </>
    );

    if (block.block_type === 'text') {
        return wrapWithAdminBoundary(
            <div
                className={cn(
                    isHeaderVariant
                        ? 'rounded-sm border border-[color:var(--chronicle-border)] bg-[rgba(173,122,44,0.06)] px-4 py-4 sm:px-5 sm:py-5'
                        : 'chronicle-panel rounded-sm px-5 py-5 sm:px-6 sm:py-6',
                    className,
                )}
            >
                <p className="chronicle-kicker">{label}</p>
                {block.title && (
                    <p className="mt-4 font-serif text-lg font-semibold text-[color:var(--chronicle-ink)]">
                        {block.title}
                    </p>
                )}
                {block.body && (
                    <p className="mt-3 leading-7 text-[color:var(--chronicle-brown)]">
                        {block.body}
                    </p>
                )}
            </div>,
        );
    }

    return wrapWithAdminBoundary(
        <div
            className={cn(
                isHeaderVariant
                    ? 'rounded-sm border border-[color:var(--chronicle-border)] bg-[rgba(173,122,44,0.06)] p-2'
                    : 'chronicle-panel rounded-sm p-2 sm:p-3',
                className,
            )}
        >
            <p className="chronicle-kicker px-3 pt-3 sm:px-4">{label}</p>
            <div className="mt-3">
                <ContentBlockRenderer block={block} />
            </div>
        </div>,
    );
}
