import type {
    ScriptureRegisteredAdminField,
    ScriptureRegisteredAdminMethod,
} from '@/types';

export type ScriptureAdminMethodFamilyGroup = {
    family: ScriptureRegisteredAdminMethod['family'];
    family_label: string;
    family_description: string;
    ui_hint: string | null;
    content_aware: boolean;
    methods: ScriptureRegisteredAdminMethod[];
};

export function groupScriptureAdminMethodsByFamily(
    methods: ScriptureRegisteredAdminMethod[],
): ScriptureAdminMethodFamilyGroup[] {
    const groups = new Map<
        ScriptureRegisteredAdminMethod['family'],
        ScriptureAdminMethodFamilyGroup
    >();

    methods.forEach((method) => {
        const existing = groups.get(method.family);

        if (existing) {
            existing.methods.push(method);
            return;
        }

        groups.set(method.family, {
            family: method.family,
            family_label: method.family_label,
            family_description: method.family_description,
            ui_hint: method.ui_hint,
            content_aware: method.content_aware,
            methods: [method],
        });
    });

    return Array.from(groups.values()).sort((left, right) =>
        left.family_label.localeCompare(right.family_label),
    );
}

export function scriptureAdminMethodTargetLabel(
    method: ScriptureRegisteredAdminMethod,
    fields: Record<string, ScriptureRegisteredAdminField>,
): string {
    if (method.scope === 'field') {
        const field = method.field_keys[0]
            ? fields[method.field_keys[0]]
            : undefined;

        if (field) {
            return field.source;
        }
    }

    return method.region_key ?? 'entity';
}
