import type { AdminSurfaceQuickEdit } from '@/admin/surfaces/core/surface-contracts';

export type AdminQuickEditContext = {
    quickEdit?: AdminSurfaceQuickEdit | null;
    allowedFieldNames?: readonly string[];
    structuredFallbackAvailable?: boolean;
    fullEditFallbackAvailable?: boolean;
};
