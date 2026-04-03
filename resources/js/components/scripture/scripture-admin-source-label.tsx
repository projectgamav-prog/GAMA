import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
    scriptureAdminFieldRequirement,
    scriptureAdminFieldTypeLabel,
    scriptureAdminFieldValidationSummary,
} from '@/lib/scripture-admin-field-display';
import type { ScriptureRegisteredAdminField } from '@/types';

type Props = {
    field: ScriptureRegisteredAdminField;
    htmlFor: string;
    labelOverride?: string;
    helperTextOverride?: string;
    showSchemaMeta?: boolean;
    showValidation?: boolean;
};

export function ScriptureAdminSourceLabel({
    field,
    htmlFor,
    labelOverride,
    helperTextOverride,
    showSchemaMeta = true,
    showValidation = true,
}: Props) {
    const requirement = scriptureAdminFieldRequirement(field);
    const validationSummary = scriptureAdminFieldValidationSummary(field);
    const helperText = helperTextOverride ?? field.help_text;

    return (
        <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
                <Label htmlFor={htmlFor}>{labelOverride ?? field.label}</Label>
                {showSchemaMeta && (
                    <Badge variant="outline" className="font-mono text-[11px]">
                        {field.source}
                    </Badge>
                )}
            </div>
            {showSchemaMeta && (
                <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">
                        {scriptureAdminFieldTypeLabel(field)}
                    </Badge>
                    {requirement && (
                        <Badge variant="outline">{requirement}</Badge>
                    )}
                    {field.read_only && (
                        <Badge variant="outline">Read only</Badge>
                    )}
                </div>
            )}
            {helperText && (
                <p className="text-sm leading-6 text-muted-foreground">
                    {helperText}
                </p>
            )}
            {showValidation && validationSummary && (
                <p className="text-xs leading-5 text-muted-foreground">
                    Validation: {validationSummary}
                </p>
            )}
        </div>
    );
}
