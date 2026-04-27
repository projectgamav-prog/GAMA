import type {
    AdminEntityContext,
    AdminPreferredPlacement,
} from './awareness-types';

export type AdminAddAnchorType =
    | 'add_before'
    | 'add_after'
    | 'add_inside'
    | 'add_child'
    | 'add_block'
    | 'add_media'
    | 'add_relation';

export type AdminAddAnchorContext = {
    anchorKey: string;
    orderGroupKey: string;
    anchorType: AdminAddAnchorType;
    beforeItemKey?: string | null;
    afterItemKey?: string | null;
    parent?: AdminEntityContext | null;
    allowedContentTypes?: readonly string[];
    preferredPlacement?: AdminPreferredPlacement | null;
    canCreate: boolean;
    disabledReason?: string | null;
};
