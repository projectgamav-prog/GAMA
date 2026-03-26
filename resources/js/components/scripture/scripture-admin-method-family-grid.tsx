import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    groupScriptureAdminMethodsByFamily,
    scriptureAdminMethodTargetLabel,
} from '@/lib/scripture-admin-methods';
import type {
    ScriptureRegisteredAdminField,
    ScriptureRegisteredAdminMethod,
} from '@/types';

type Props = {
    methods: ScriptureRegisteredAdminMethod[];
    fields: Record<string, ScriptureRegisteredAdminField>;
    emptyMessage: string;
};

export function ScriptureAdminMethodFamilyGrid({
    methods,
    fields,
    emptyMessage,
}: Props) {
    const groups = groupScriptureAdminMethodsByFamily(methods);

    if (groups.length === 0) {
        return <p className="text-sm text-muted-foreground">{emptyMessage}</p>;
    }

    return (
        <div className="grid gap-4 xl:grid-cols-2">
            {groups.map((group) => (
                <Card key={group.family}>
                    <CardHeader className="gap-3">
                        <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="secondary">
                                {group.family_label}
                            </Badge>
                            <Badge variant="outline">
                                {group.methods.length} target
                                {group.methods.length === 1 ? '' : 's'}
                            </Badge>
                            {group.content_aware && (
                                <Badge variant="outline">Content-aware</Badge>
                            )}
                            {group.ui_hint && (
                                <Badge
                                    variant="outline"
                                    className="font-mono text-[11px]"
                                >
                                    {group.ui_hint}
                                </Badge>
                            )}
                        </div>
                        <CardTitle className="text-base">
                            {group.family_label}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm leading-6 text-muted-foreground">
                            {group.family_description}
                        </p>

                        <div className="space-y-3">
                            {group.methods.map((method) => (
                                <div
                                    key={method.key}
                                    className="rounded-xl border border-border/70 bg-muted/20 px-4 py-4"
                                >
                                    <div className="flex flex-wrap items-center gap-2">
                                        <p className="text-sm font-medium text-foreground">
                                            {method.label}
                                        </p>
                                        <Badge variant="outline">
                                            {method.scope}
                                        </Badge>
                                        <Badge
                                            variant="outline"
                                            className="font-mono text-[11px]"
                                        >
                                            {scriptureAdminMethodTargetLabel(
                                                method,
                                                fields,
                                            )}
                                        </Badge>
                                    </div>
                                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                        {method.description}
                                    </p>
                                    {method.surface && (
                                        <p className="mt-2 text-xs leading-5 text-muted-foreground">
                                            Surface: {method.surface}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
