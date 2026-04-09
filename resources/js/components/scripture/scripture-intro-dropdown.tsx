import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { ContentBlockRenderer } from '@/components/scripture/content-block-renderer';
import { Button } from '@/components/ui/button';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import type { ScriptureContentBlock } from '@/types';

type Props = {
    textValue?: string | null;
    block?: ScriptureContentBlock | null;
    buttonLabel?: string;
    contentLabel?: string;
    className?: string;
    triggerClassName?: string;
    contentClassName?: string;
};

export function ScriptureIntroDropdown({
    textValue = null,
    block = null,
    buttonLabel = 'Intro',
    contentLabel = 'Intro',
    className,
    triggerClassName,
    contentClassName,
}: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const normalizedText = textValue?.trim() ?? '';
    const hasContent = normalizedText !== '' || block !== null;

    if (!hasContent) {
        return null;
    }

    return (
        <Collapsible
            open={isOpen}
            onOpenChange={setIsOpen}
            className={cn('space-y-2', className)}
        >
            <CollapsibleTrigger asChild>
                <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className={cn(
                        'h-7 justify-between rounded-md border border-border/80 bg-background px-2.5 text-xs font-medium text-foreground shadow-sm hover:bg-muted',
                        triggerClassName,
                    )}
                >
                    <span>{buttonLabel}</span>
                    <ChevronDown
                        className={cn(
                            'size-3.5 transition-transform',
                            isOpen && 'rotate-180',
                        )}
                    />
                </Button>
            </CollapsibleTrigger>

            <CollapsibleContent
                className={cn(
                    'rounded-xl border border-border/60 bg-muted/20 px-3.5 py-3',
                    contentClassName,
                )}
            >
                <p className="text-[10px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                    {contentLabel}
                </p>

                {block ? (
                    block.block_type === 'text' ? (
                        <div className="mt-3 space-y-3">
                            {block.title && (
                                <p className="text-sm font-semibold">
                                    {block.title}
                                </p>
                            )}
                            {block.body && (
                                <p className="text-sm leading-6 whitespace-pre-line text-muted-foreground">
                                    {block.body}
                                </p>
                            )}
                        </div>
                    ) : (
                        <div className="mt-3">
                            <ContentBlockRenderer block={block} />
                        </div>
                    )
                ) : (
                    <p className="mt-3 text-sm leading-6 whitespace-pre-line text-muted-foreground">
                        {normalizedText}
                    </p>
                )}
            </CollapsibleContent>
        </Collapsible>
    );
}
