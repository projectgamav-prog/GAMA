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
};

export function ScriptureAdminSourceLabel({ field, htmlFor }: Props) {
    const requirement = scriptureAdminFieldRequirement(field);
    const validationSummary = scriptureAdminFieldValidationSummary(field);

    return (
        <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
                <Label htmlFor={htmlFor}>{field.label}</Label>
                <Badge variant="outline" className="font-mono text-[11px]">
                    {field.source}
                </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">
                    {scriptureAdminFieldTypeLabel(field)}
                </Badge>
                {requirement && <Badge variant="outline">{requirement}</Badge>}
                {field.read_only && <Badge variant="outline">Read only</Badge>}
            </div>
            {field.help_text && (
                <p className="text-sm leading-6 text-muted-foreground">
                    {field.help_text}
                </p>
            )}
            {validationSummary && (
                <p className="text-xs leading-5 text-muted-foreground">
                    Validation: {validationSummary}
                </p>
            )}
        </div>
    );
}
