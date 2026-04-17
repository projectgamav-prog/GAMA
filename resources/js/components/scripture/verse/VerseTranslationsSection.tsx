import type { ComponentProps } from 'react';
import { Languages } from 'lucide-react';
import { AdminModuleHost } from '@/admin/core/AdminModuleHost';
import { ScriptureEntityRegion } from '@/components/scripture/scripture-entity-region';
import { ScriptureSection } from '@/components/scripture/scripture-section';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import type { VerseShowProps } from '@/types';
import type { ScriptureEntityRegionInput } from '@/types/scripture';

type Props = {
    entityMeta: ScriptureEntityRegionInput;
    translations: VerseShowProps['translations'];
    translationsSurface: ComponentProps<typeof AdminModuleHost>['surface'];
};

export function VerseTranslationsSection({
    entityMeta,
    translations,
    translationsSurface,
}: Props) {
    return (
        <ScriptureSection
            entityMeta={{
                ...entityMeta,
                region: 'translations',
                capabilityHint: 'translation',
            }}
            title="Translations"
            description="Supporting translations for this verse, kept separate from the canonical text above."
            icon={Languages}
            action={
                <Badge variant="outline">
                    {translations.length} translation
                    {translations.length === 1 ? '' : 's'}
                </Badge>
            }
        >
            <div className="space-y-4">
                {translationsSurface && (
                    <AdminModuleHost
                        surface={translationsSurface}
                        className="flex flex-wrap items-start gap-1.5"
                    />
                )}

                {translations.length === 0 && translationsSurface && (
                    <div className="rounded-2xl border border-dashed border-border/80 bg-muted/20 px-5 py-5 text-sm leading-6 text-muted-foreground sm:px-6 sm:py-6">
                        No translations have been added yet.
                    </div>
                )}

                {translations.map((translation) => (
                    <ScriptureEntityRegion
                        key={translation.id}
                        meta={{
                            entityType: 'verse_translation',
                            entityId: translation.id,
                            entityLabel: translation.source_name,
                            region: 'translation_card',
                            capabilityHint: 'translation',
                        }}
                        asChild
                    >
                        <Card className="overflow-hidden">
                            <CardHeader className="gap-3 border-b bg-muted/20">
                                <div className="flex flex-wrap items-center gap-2">
                                    <Badge variant="outline">
                                        {translation.language_code}
                                    </Badge>
                                    <Badge variant="secondary">
                                        {translation.source_name}
                                    </Badge>
                                </div>
                                <CardTitle className="text-xl">
                                    {translation.source_name}
                                </CardTitle>
                                <CardDescription>
                                    Source key: {translation.source_key}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <p className="leading-8">{translation.text}</p>
                            </CardContent>
                        </Card>
                    </ScriptureEntityRegion>
                ))}
            </div>
        </ScriptureSection>
    );
}
