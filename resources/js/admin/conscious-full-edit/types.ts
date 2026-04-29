export type ConsciousFullEditField = {
    name: string;
    label: string;
    category: string;
    field_kind: string;
    editor_type: 'input' | 'textarea' | 'readonly' | string;
    value: string;
    display_value: string;
    editable: boolean;
    protected: boolean;
    readonly: boolean;
    required: boolean;
    update_href: string | null;
    method: 'patch' | 'post' | 'put';
    payload_key: string;
    hidden_payload_fields: readonly {
        name: string;
        value: string | number | boolean | null;
    }[];
    notice: string | null;
    diagnostic_key: string | null;
};

export type ConsciousFullEditProps = {
    mode: 'conscious_full_edit';
    schema_family: string;
    entity_type: string;
    entity_id: number | string;
    label: string;
    description: string | null;
    public_href: string | null;
    old_full_edit_href: string | null;
    fields: ConsciousFullEditField[];
    is_deprecated_old_full_edit_bypassed: boolean;
};
