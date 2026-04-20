import { ScriptureAdminFieldMeta } from '@/components/scripture/scripture-admin-field-meta';
import { ScriptureSection } from '@/components/scripture/scripture-section';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { scriptureAdminStartCase } from '@/lib/scripture-admin-field-display';
import type {
    ScriptureRegisteredAdminEntity,
    ScriptureRegisteredAdminRegion,
} from '@/types';

type Props = {
    adminEntity: ScriptureRegisteredAdminEntity;
};

export function BookRegisteredRegionContractSection({ adminEntity }: Props) {
    return (
        <ScriptureSection
            title="Registered Region Contract"
            description="These regions define what each edit layer can touch, what surface each region serves, and where Book content is allowed to live."
        >
            <div className="space-y-4">
                {adminEntity.regions.map(
                    (region: ScriptureRegisteredAdminRegion) => (
                        <Card key={region.key}>
                            <CardHeader className="gap-3">
                                <div className="flex flex-wrap items-center gap-2">
                                    <Badge
                                        variant="outline"
                                        className="font-mono text-[11px]"
                                    >
                                        {region.key}
                                    </Badge>
                                    <Badge variant="outline">
                                        {region.surface}
                                    </Badge>
                                </div>
                                <CardTitle>{region.label}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-sm leading-6 text-muted-foreground">
                                    {region.description}
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {region.supported_modes.map((mode) => (
                                        <Badge key={mode} variant="secondary">
                                            {adminEntity.edit_modes[mode].label}
                                        </Badge>
                                    ))}
                                    {region.method_families.map((family) => (
                                        <Badge
                                            key={`${region.key}-${family}`}
                                            variant="outline"
                                        >
                                            {scriptureAdminStartCase(family)}
                                        </Badge>
                                    ))}
                                </div>
                                {region.help_text && (
                                    <p className="text-sm leading-6 text-muted-foreground">
                                        {region.help_text}
                                    </p>
                                )}
                                <div className="grid gap-4 lg:grid-cols-3">
                                    <div className="space-y-3">
                                        <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                                            Contextual
                                        </p>
                                        {region.contextual_fields.length > 0 ? (
                                            region.contextual_fields.map(
                                                (field) => (
                                                    <ScriptureAdminFieldMeta
                                                        key={`${region.key}-${field.key}-contextual`}
                                                        field={field}
                                                    />
                                                ),
                                            )
                                        ) : (
                                            <p className="text-sm text-muted-foreground">
                                                This region is not editable in
                                                contextual mode.
                                            </p>
                                        )}
                                    </div>
                                    <div className="space-y-3">
                                        <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                                            Full editorial
                                        </p>
                                        {region.full_fields.length > 0 ? (
                                            region.full_fields.map((field) => (
                                                <ScriptureAdminFieldMeta
                                                    key={`${region.key}-${field.key}-full`}
                                                    field={field}
                                                />
                                            ))
                                        ) : (
                                            <p className="text-sm text-muted-foreground">
                                                This region is not editable in
                                                full editorial mode.
                                            </p>
                                        )}
                                    </div>
                                    <div className="space-y-3">
                                        <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                                            Canonical protected
                                        </p>
                                        {region.canonical_fields.length > 0 ? (
                                            region.canonical_fields.map(
                                                (field) => (
                                                    <ScriptureAdminFieldMeta
                                                        key={`${region.key}-${field.key}-canonical`}
                                                        field={field}
                                                    />
                                                ),
                                            )
                                        ) : (
                                            <p className="text-sm text-muted-foreground">
                                                This region is not editable in
                                                canonical mode.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ),
                )}
            </div>
        </ScriptureSection>
    );
}
