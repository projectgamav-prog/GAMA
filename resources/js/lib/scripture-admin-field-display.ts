import type { ScriptureRegisteredAdminField } from '@/types';

export function scriptureAdminStartCase(value: string): string {
    return value
        .split(/[_-]+/)
        .filter(Boolean)
        .map((part) =>
            part.length > 0 ? `${part[0].toUpperCase()}${part.slice(1)}` : part,
        )
        .join(' ');
}

export function scriptureAdminFieldTypeLabel(
    field: ScriptureRegisteredAdminField,
): string {
    return scriptureAdminStartCase(field.type);
}

export function scriptureAdminFieldRequirement(
    field: ScriptureRegisteredAdminField,
): 'Required' | 'Optional' | null {
    if (field.validation_rules.length === 0) {
        return null;
    }

    return field.validation_rules.includes('required')
        ? 'Required'
        : 'Optional';
}

export function scriptureAdminFieldValidationSummary(
    field: ScriptureRegisteredAdminField,
): string | null {
    const rules = field.validation_rules.filter(
        (rule) => rule !== 'required' && rule !== 'nullable',
    );

    return rules.length > 0 ? rules.join(' | ') : null;
}
