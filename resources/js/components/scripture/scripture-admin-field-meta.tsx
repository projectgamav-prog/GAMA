import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { ScriptureRegisteredAdminField } from '@/types';

type Props = {
    field: ScriptureRegisteredAdminField;
    className?: string;
    showModes?: boolean;
};

export function ScriptureAdminFieldMeta({
    field,
    className,
    showModes = false,
}: Props) {
    return (
        <div className={cn('space-y-2', className)}>
            <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-medium text-foreground">
                    {field.label}
                </p>
                <Badge variant="outline" className="font-mono text-[11px]">
                    {field.source}
                </Badge>
                <Badge variant="secondary">{field.classification}</Badge>
                {field.read_only && <Badge variant="outline">Read only</Badge>}
            </div>

            {showModes && field.edit_modes.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {field.edit_modes.map((mode) => (
                        <Badge key={mode} variant="outline">
                            {mode}
                        </Badge>
                    ))}
                </div>
            )}

            {field.help_text && (
                <p className="text-sm leading-6 text-muted-foreground">
                    {field.help_text}
                </p>
            )}
        </div>
    );
}
