import type { ReactNode } from 'react';
import type { AdminSurfaceContract } from '@/admin/surfaces/core/surface-contracts';
import type {
    PageRenderContext,
    UniversalPageLayoutKind,
    UniversalRegionSlot,
} from './render-context';

export type UniversalPageLayoutDescriptor = {
    kind: UniversalPageLayoutKind;
    mainClassName?: string;
    contentClassName?: string;
};

export type SectionPanelVariant = 'paper' | 'panel' | 'feature' | 'none';

export type SectionDensity = 'compact' | 'comfortable';

export type SectionGridVariant =
    | 'none'
    | 'cards'
    | 'editorial'
    | 'support';

export type SectionLayoutDescriptor = {
    panel?: SectionPanelVariant;
    density?: SectionDensity;
    grid?: SectionGridVariant;
    className?: string;
};

export type UniversalSectionRendererKey = string & {};

export type UniversalSectionDescriptor<TContent = unknown> = {
    id: string;
    renderer: UniversalSectionRendererKey;
    layout?: SectionLayoutDescriptor;
    content: TContent;
    surface?: AdminSurfaceContract | null;
    children?: UniversalSectionDescriptor[];
};

export type UniversalRegionDescriptor = {
    key: string;
    slot: UniversalRegionSlot;
    sections: UniversalSectionDescriptor[];
};

export type PageDescriptor = {
    context: PageRenderContext;
    layout: UniversalPageLayoutDescriptor;
    regions: UniversalRegionDescriptor[];
};

export type MissingSectionRendererContent = {
    message?: ReactNode;
};
