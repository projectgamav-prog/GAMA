import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

export type AdminOverlayTone = 'neutral' | 'active' | 'danger' | 'primary';

export type AdminOverlayPlacement =
    | 'inline'
    | 'top-right'
    | 'bottom-right'
    | 'bottom-edge';

export type AdminOverlayAction = {
    key: string;
    label: ReactNode;
    icon?: LucideIcon;
    tone?: AdminOverlayTone;
    active?: boolean;
};
