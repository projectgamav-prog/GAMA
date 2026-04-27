import { Link } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: ReactNode;
    description: ReactNode;
    surfaceLabel?: string;
    mode?: 'edit' | 'create';
    contextLabel?: string;
    contextSlot?: ReactNode;
    fullEditHref?: string | null;
    primaryActionLabel: string;
    processingLabel?: string;
    onPrimaryAction: () => void;
    processing?: boolean;
    children: ReactNode;
};

export function ScriptureInlineAdminSheet({
    open,
    onOpenChange,
    title,
    description,
    surfaceLabel,
    mode = 'edit',
    contextLabel = 'Editing context',
    contextSlot,
    fullEditHref,
    primaryActionLabel,
    processingLabel = mode === 'create' ? 'Adding...' : 'Saving...',
    onPrimaryAction,
    processing = false,
    children,
}: Props) {
    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="w-full sm:max-w-xl">
                <div className="flex h-full flex-col">
                    <SheetHeader className="space-y-3 border-b pb-5">
                        <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                                <Badge
                                    variant={
                                        mode === 'create'
                                            ? 'secondary'
                                            : 'outline'
                                    }
                                >
                                    {mode === 'create' ? 'Adding' : 'Editing'}
                                </Badge>
                                {surfaceLabel && (
                                    <Badge variant="outline">
                                        {surfaceLabel}
                                    </Badge>
                                )}
                            </div>
                            <SheetTitle>{title}</SheetTitle>
                            <SheetDescription>{description}</SheetDescription>
                        </div>

                        {contextSlot && (
                            <div className="rounded-2xl border border-border/70 bg-muted/30 px-4 py-4">
                                <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                                    {contextLabel}
                                </p>
                                <div className="mt-3 space-y-2 text-sm">
                                    {contextSlot}
                                </div>
                            </div>
                        )}
                    </SheetHeader>

                    <div className="flex-1 space-y-6 overflow-y-auto px-4 py-5">
                        {children}
                    </div>

                    <SheetFooter className="border-t bg-background/95 px-4 py-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        {fullEditHref && (
                            <Button asChild variant="outline">
                                <Link href={fullEditHref}>Full edit</Link>
                            </Button>
                        )}
                        <Button
                            type="button"
                            onClick={onPrimaryAction}
                            disabled={processing}
                        >
                            {processing ? processingLabel : primaryActionLabel}
                        </Button>
                    </SheetFooter>
                </div>
            </SheetContent>
        </Sheet>
    );
}
