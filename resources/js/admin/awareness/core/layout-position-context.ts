export type AdminLayoutZone =
    | 'hero'
    | 'main'
    | 'rail'
    | 'section_header'
    | 'block'
    | 'list_row'
    | 'card'
    | 'media'
    | 'inline_prose'
    | (string & {});

export type AdminVisualRole =
    | 'container'
    | 'item'
    | 'field'
    | 'anchor'
    | (string & {});

export type AdminPreferredPlacement =
    | 'top-right'
    | 'bottom-edge'
    | 'inline-end'
    | 'section-header'
    | 'between-items'
    | 'floating-chip'
    | (string & {});

export type AdminLayoutPositionContext = {
    layoutZone: AdminLayoutZone;
    visualRole?: AdminVisualRole | null;
    preferredPlacement?: AdminPreferredPlacement | null;
};
