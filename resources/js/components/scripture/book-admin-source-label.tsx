import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import type { ScriptureRegisteredAdminField } from '@/types';

type Props = {
    field: ScriptureRegisteredAdminField;
    htmlFor: string;
};

export function BookAdminSourceLabel({ field, htmlFor }: Props) {
    return (
        <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
                <Label htmlFor={htmlFor}>{field.label}</Label>
                <Badge variant="outline" className="font-mono text-[11px]">
                    {field.source}
                </Badge>
            </div>
            {field.help_text && (
                <p className="text-sm leading-6 text-muted-foreground">
                    {field.help_text}
                </p>
            )}
        </div>
    );
}
