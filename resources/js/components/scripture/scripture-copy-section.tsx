import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { ScriptureEntityRegionInput } from '@/types/scripture';
import { ScriptureSection } from './scripture-section';

type Props = {
    title: string;
    description: string;
    body: string | null;
    preserveWhitespace?: boolean;
    entityMeta?: ScriptureEntityRegionInput;
};

export function ScriptureCopySection({
    title,
    description,
    body,
    preserveWhitespace = false,
    entityMeta,
}: Props) {
    if (!body) {
        return null;
    }

    return (
        <ScriptureSection
            title={title}
            description={description}
            entityMeta={entityMeta}
        >
            <Card>
                <CardContent className="pt-6">
                    <p
                        className={cn(
                            'leading-7',
                            preserveWhitespace && 'whitespace-pre-line',
                        )}
                    >
                        {body}
                    </p>
                </CardContent>
            </Card>
        </ScriptureSection>
    );
}
