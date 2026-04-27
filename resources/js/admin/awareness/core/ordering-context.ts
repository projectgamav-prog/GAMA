export type AdminOrderFamily =
    | 'canonical'
    | 'cms'
    | 'relation'
    | 'media'
    | 'block'
    | 'custom'
    | (string & {});

export type AdminOrderingContext = {
    orderGroupKey: string;
    orderFamily: AdminOrderFamily;
    index?: number | null;
    isFirst?: boolean;
    isLast?: boolean;
    canReorder: boolean;
    protectedReason?: string | null;
};
