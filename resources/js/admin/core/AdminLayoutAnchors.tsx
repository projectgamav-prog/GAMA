import { Slot } from '@radix-ui/react-slot';
import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type AdminAnchorLevel =
    | 'page'
    | 'region'
    | 'section'
    | 'card'
    | 'block'
    | 'field';

export type AdminFieldAnchorSlot =
    | 'field.top-right'
    | 'field.bottom-right'
    | 'field.top-left'
    | 'field.bottom-left';

export type AdminCardAnchorSlot =
    | 'card.top-right'
    | 'card.top-left'
    | 'card.bottom-right'
    | 'card.bottom-left'
    | 'card.bottom-edge';

export type AdminSectionAnchorSlot =
    | 'section.header-right'
    | 'section.header-left'
    | 'section.bottom-edge'
    | 'section.between-items';

export type AdminRegionAnchorSlot =
    | 'region.top'
    | 'region.bottom'
    | 'region.empty-state'
    | 'region.between-sections';

export type AdminPageAnchorSlot =
    | 'page.header'
    | 'page.footer'
    | 'page.settings';

export type AdminAnchorSlot =
    | AdminFieldAnchorSlot
    | AdminCardAnchorSlot
    | AdminSectionAnchorSlot
    | AdminRegionAnchorSlot
    | AdminPageAnchorSlot;

type AdminAnchorBoundaryProps = ComponentProps<'div'> & {
    level: AdminAnchorLevel;
    anchorKey?: string | null;
    asChild?: boolean;
    children: ReactNode;
};

type AdminControlAnchorProps = ComponentProps<'div'> & {
    level: AdminAnchorLevel;
    anchorSlot: AdminAnchorSlot;
    anchorKey?: string | null;
};

export function AdminAnchorBoundary({
    level,
    anchorKey = null,
    asChild = false,
    children,
    className,
    ...props
}: AdminAnchorBoundaryProps) {
    const Comp = asChild ? Slot : 'div';

    return (
        <Comp
            className={cn('chronicle-admin-anchor-boundary', className)}
            data-admin-anchor-level={level}
            data-admin-anchor-key={anchorKey ?? undefined}
            {...props}
        >
            {children}
        </Comp>
    );
}

export function AdminControlAnchor({
    level,
    anchorSlot,
    anchorKey = null,
    children,
    className,
    ...props
}: AdminControlAnchorProps) {
    return (
        <div
            className={cn('chronicle-admin-control-anchor', className)}
            data-admin-anchor-level={level}
            data-admin-anchor-slot={anchorSlot}
            data-admin-anchor-key={anchorKey ?? undefined}
            {...props}
        >
            {children}
        </div>
    );
}
