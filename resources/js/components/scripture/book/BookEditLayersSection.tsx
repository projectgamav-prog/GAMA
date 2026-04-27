import { ScriptureSection } from '@/components/scripture/scripture-section';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ScriptureRegisteredAdminEntity } from '@/types';

type EditModeKey = 'contextual' | 'full' | 'canonical';

type Props = {
    adminEntity: ScriptureRegisteredAdminEntity;
    registeredFieldCountByMode: Record<EditModeKey, number>;
};

export function BookEditLayersSection({
    adminEntity,
    registeredFieldCountByMode,
}: Props) {
    return (
        <ScriptureSection
            title="Edit Layers"
            description="Book is the reference entity for contextual, full editorial, and canonical protected separation."
        >
            <div className="grid gap-4 lg:grid-cols-3">
                {(['contextual', 'full', 'canonical'] as const).map(
                    (modeKey) => {
                        const mode = adminEntity.edit_modes[modeKey];
                        const regionCount = adminEntity.regions.filter(
                            (region) =>
                                region.supported_modes.includes(modeKey),
                        ).length;
                        const methodCount =
                            adminEntity.methods_by_mode[modeKey].length;

                        return (
                            <Card key={mode.key}>
                                <CardHeader className="gap-3">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <Badge variant="outline">
                                            {mode.status}
                                        </Badge>
                                    </div>
                                    <CardTitle>{mode.label}</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3 text-sm leading-6 text-muted-foreground">
                                    <p>{mode.description}</p>
                                    {mode.warning && <p>{mode.warning}</p>}
                                    <div className="flex flex-wrap gap-2 pt-1">
                                        <Badge variant="outline">
                                            {
                                                registeredFieldCountByMode[
                                                    modeKey
                                                ]
                                            }{' '}
                                            fields
                                        </Badge>
                                        <Badge variant="outline">
                                            {regionCount} regions
                                        </Badge>
                                        <Badge variant="outline">
                                            {methodCount} methods
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    },
                )}
            </div>
        </ScriptureSection>
    );
}
