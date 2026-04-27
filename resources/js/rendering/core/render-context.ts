import type { AdminSurfaceContract } from '@/admin/surfaces/core/surface-contracts';
import type { BreadcrumbItem } from '@/types';

export type UniversalPageLayoutKind =
    | 'single_column'
    | 'editorial_grid'
    | 'feature_with_rail';

export type UniversalRegionSlot = 'main' | 'rail' | 'footer' | 'cms';

export type PageRenderContext = {
    pageKey: string;
    title: string;
    breadcrumbs?: BreadcrumbItem[];
    layout: 'public' | 'scripture';
};

export type SurfaceRenderContext = {
    surface?: AdminSurfaceContract | null;
    owner?: AdminSurfaceContract['owner'] | null;
};

export type AdminActionContext = {
    showAdminControls: boolean;
    panelClassName?: string;
    surfaces?: Record<string, AdminSurfaceContract | null | undefined>;
};

export type UniversalRenderContext = {
    page: PageRenderContext;
    admin?: AdminActionContext;
};
