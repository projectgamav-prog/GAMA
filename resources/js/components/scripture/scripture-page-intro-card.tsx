import type { ReactNode } from 'react';
import { ScriptureEntityRegion } from '@/components/scripture/scripture-entity-region';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { ScriptureEntityRegionInput } from '@/types/scripture';

type Props = {
    badges?: ReactNode;
    title: ReactNode;
    description?: ReactNode;
    children?: ReactNode;
    className?: string;
    contentClassName?: string;
    titleClassName?: string;
    entityMeta?: ScriptureEntityRegionInput;
};

export function ScripturePageIntroCard({
    badges,
    title,
    description,
    children,
    className,
    contentClassName,
    titleClassName,
    entityMeta,
}: Props) {
    const card = (
        <Card className={className}>
            <CardHeader className="gap-4">
                {badges && (
                    <div className="flex flex-wrap items-center gap-2">
                        {badges}
                    </div>
                )}

                <div className="space-y-2">
                    <CardTitle className={cn('text-3xl', titleClassName)}>
                        {title}
                    </CardTitle>
                    {description && (
                        <CardDescription className="max-w-3xl text-base leading-7">
                            {description}
                        </CardDescription>
                    )}
                </div>
            </CardHeader>

            {children && (
                <CardContent className={contentClassName}>
                    {children}
                </CardContent>
            )}
        </Card>
    );

    if (!entityMeta) {
        return card;
    }

    return (
        <ScriptureEntityRegion meta={entityMeta} asChild>
            {card}
        </ScriptureEntityRegion>
    );
}
