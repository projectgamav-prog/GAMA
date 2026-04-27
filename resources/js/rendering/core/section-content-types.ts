import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import type { AdminOrderingContext } from '@/admin/awareness/core';
import type { AdminSurfaceContract } from '@/admin/surfaces/core/surface-contracts';
import type { PublicContentBlock } from '@/types/content-blocks';

export type UniversalActionDescriptor = {
    label: ReactNode;
    href: string;
    icon?: LucideIcon;
    variant?: 'primary' | 'outline' | 'link';
};

export type UniversalListItemDescriptor = {
    label: ReactNode;
    meta?: ReactNode;
    icon?: LucideIcon;
    href?: string;
};

export type UniversalPanelContent = {
    title?: ReactNode;
    eyebrow?: ReactNode;
    description?: ReactNode;
    body?: ReactNode;
    icon?: LucideIcon;
    action?: ReactNode | UniversalActionDescriptor;
};

export type UniversalPaperPanelContent = UniversalPanelContent & {
    children?: ReactNode;
};

export type UniversalCompactListContent = UniversalPanelContent & {
    items: UniversalListItemDescriptor[];
};

export type UniversalActionPanelContent = UniversalPanelContent & {
    actions: UniversalActionDescriptor[];
};

export type UniversalTemporaryPanelContent = UniversalPanelContent & {
    marker?: ReactNode;
    items?: UniversalListItemDescriptor[];
};

export type UniversalIntroTextContent = {
    label: string;
    block: PublicContentBlock | null | undefined;
    adminSurface?: AdminSurfaceContract | null;
    variant?: 'default' | 'header';
    className?: string;
};

export type UniversalContentBlockItem = {
    block: PublicContentBlock;
    adminSurface?: AdminSurfaceContract | null;
    ordering?: AdminOrderingContext | null;
    headerAction?: ReactNode;
    inlineEditor?: ReactNode;
};

export type UniversalContentBlocksContent = {
    blocks: UniversalContentBlockItem[];
    className?: string;
};
