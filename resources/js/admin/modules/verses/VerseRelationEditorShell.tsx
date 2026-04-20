import { Link } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

type Props = {
    count: number;
    countLabelSingular: string;
    countLabelPlural: string;
    sourceCount: number;
    title: string;
    description: string;
    fullEditHref: string | null;
    onClose: () => void;
    children: ReactNode;
};

export function VerseRelationEditorShell({
    count,
    countLabelSingular,
    countLabelPlural,
    sourceCount,
    title,
    description,
    fullEditHref,
    onClose,
    children,
}: Props) {
    return (
        <div className="basis-full pt-2">
            <div className="space-y-4 rounded-2xl border border-border/70 bg-background/95 px-4 py-4 shadow-sm sm:px-5">
                <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline">
                            {count}{' '}
                            {count === 1
                                ? countLabelSingular
                                : countLabelPlural}
                        </Badge>
                        <Badge variant="outline">
                            {sourceCount} saved source
                            {sourceCount === 1 ? '' : 's'}
                        </Badge>
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-base font-semibold">{title}</h3>
                        <p className="text-sm leading-6 text-muted-foreground">
                            {description}
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2 border-t pt-4">
                    <Button type="button" variant="outline" onClick={onClose}>
                        Close
                    </Button>
                    {fullEditHref && (
                        <Button asChild variant="outline">
                            <Link href={fullEditHref}>Open full edit</Link>
                        </Button>
                    )}
                </div>

                {children}
            </div>
        </div>
    );
}
