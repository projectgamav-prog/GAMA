import { ChevronDown, CirclePlay } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import type { ScriptureBookMediaSlot } from '@/types/scripture';

type Props = {
    slot: ScriptureBookMediaSlot;
    className?: string;
    buttonClassName?: string;
    contentClassName?: string;
};

export function BookOverviewVideoDisclosure({
    slot,
    className,
    buttonClassName,
    contentClassName,
}: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const videoUrl = slot.media.url ?? slot.media.path;

    if (slot.media.media_type !== 'video' || !videoUrl) {
        return null;
    }

    return (
        <Collapsible
            open={isOpen}
            onOpenChange={setIsOpen}
            className={cn('space-y-3', className)}
        >
            <CollapsibleTrigger asChild>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className={cn('w-full justify-between', buttonClassName)}
                >
                    <span className="inline-flex items-center gap-2">
                        <CirclePlay className="size-4" />
                        {isOpen ? 'Hide Overview' : 'Watch Overview'}
                    </span>
                    <ChevronDown
                        className={cn(
                            'size-4 transition-transform',
                            isOpen && 'rotate-180',
                        )}
                    />
                </Button>
            </CollapsibleTrigger>

            <CollapsibleContent
                className={cn(
                    'rounded-xl border border-border/70 bg-muted/30 p-3',
                    contentClassName,
                )}
            >
                <div className="space-y-3">
                    <video
                        controls
                        preload="none"
                        className="aspect-video w-full rounded-lg border bg-black"
                        poster={slot.media.poster_url ?? undefined}
                        src={videoUrl}
                    />

                    {(slot.title || slot.caption) && (
                        <div className="space-y-1">
                            {slot.title && (
                                <p className="text-sm font-medium">
                                    {slot.title}
                                </p>
                            )}
                            {slot.caption && (
                                <p className="text-sm leading-6 text-muted-foreground">
                                    {slot.caption}
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </CollapsibleContent>
        </Collapsible>
    );
}
