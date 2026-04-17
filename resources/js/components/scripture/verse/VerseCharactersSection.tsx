import { Link } from '@inertiajs/react';
import { Users } from 'lucide-react';
import { ScriptureEntityRegion } from '@/components/scripture/scripture-entity-region';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { VerseShowProps } from '@/types';
import type { ScriptureEntityRegionInput } from '@/types/scripture';

type Props = {
    entityMeta: ScriptureEntityRegionInput;
    characters: VerseShowProps['characters'];
};

export function VerseCharactersSection({ entityMeta, characters }: Props) {
    return (
        <ScriptureEntityRegion
            meta={{
                ...entityMeta,
                region: 'related_characters',
                capabilityHint: 'relationships',
            }}
            asChild
        >
            <Card>
                <CardHeader className="gap-3">
                    <CardTitle className="flex items-center gap-2 text-xl">
                        <Users className="size-5" />
                        Related Characters
                    </CardTitle>
                    <CardDescription>
                        Character associations attached to this verse.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {characters.map((assignment, index) => (
                        <ScriptureEntityRegion
                            key={assignment.id}
                            meta={{
                                entityType: 'verse_character_assignment',
                                entityId: assignment.id,
                                entityLabel:
                                    assignment.character?.name ??
                                    'Untitled character',
                                region: 'character_assignment',
                                capabilityHint: 'relationships',
                            }}
                            asChild
                        >
                            <div
                                className={cn(
                                    'space-y-2',
                                    index > 0 && 'border-t pt-4',
                                )}
                            >
                                <div className="flex flex-wrap items-center gap-2">
                                    {assignment.character?.href ? (
                                        <Link
                                            href={assignment.character.href}
                                            className="font-medium underline-offset-4 hover:text-primary hover:underline"
                                        >
                                            {assignment.character.name}
                                        </Link>
                                    ) : (
                                        <span className="font-medium">
                                            {assignment.character?.name ??
                                                'Untitled character'}
                                        </span>
                                    )}
                                    {assignment.weight !== null && (
                                        <Badge variant="outline">
                                            Weight {assignment.weight}
                                        </Badge>
                                    )}
                                </div>
                                {assignment.notes && (
                                    <p className="text-sm leading-6 text-muted-foreground">
                                        {assignment.notes}
                                    </p>
                                )}
                            </div>
                        </ScriptureEntityRegion>
                    ))}
                </CardContent>
            </Card>
        </ScriptureEntityRegion>
    );
}
