import { ContentBlockRenderer } from '@/components/scripture/content-block-renderer';
import type { ScriptureContentBlock } from '@/types';
import { cn } from '@/lib/utils';

type Props = {
    label: string;
    block: ScriptureContentBlock | null | undefined;
    variant?: 'default' | 'header';
    className?: string;
};

export function ScriptureIntroBlock({
    label,
    block,
    variant = 'default',
    className,
}: Props) {
    if (!block) {
        return null;
    }

    const isHeaderVariant = variant === 'header';

    if (block.block_type === 'text') {
        return (
            <div
                className={cn(
                    isHeaderVariant
                        ? 'rounded-xl border border-border/60 bg-muted/15 px-4 py-4 sm:px-5 sm:py-5'
                        : 'rounded-2xl border border-border/70 bg-muted/20 px-5 py-5 sm:px-6 sm:py-6',
                    className,
                )}
            >
                <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                    {label}
                </p>
                {block.title && (
                    <p className="mt-4 text-lg font-semibold">{block.title}</p>
                )}
                {block.body && (
                    <p className="mt-3 leading-7 text-muted-foreground">
                        {block.body}
                    </p>
                )}
            </div>
        );
    }

    return (
        <div
            className={cn(
                isHeaderVariant
                    ? 'rounded-xl border border-border/60 bg-muted/15 p-2'
                    : 'rounded-2xl border border-border/70 bg-muted/20 p-2 sm:p-3',
                className,
            )}
        >
            <p className="px-3 pt-3 text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase sm:px-4">
                {label}
            </p>
            <div className="mt-3">
                <ContentBlockRenderer block={block} />
            </div>
        </div>
    );
}
