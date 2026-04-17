import { type ReactNode, useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';

type Props = {
    title: string;
    description: string;
    actionLabel: string;
    children: ReactNode;
    compact?: boolean;
};

export function CmsAddLauncherCard({
    title,
    description,
    actionLabel,
    children,
    compact = false,
}: Props) {
    const [isOpen, setIsOpen] = useState(false);

    if (compact) {
        return (
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                    <Button type="button" size="sm" variant="outline">
                        <Plus className="size-4" />
                        {actionLabel}
                    </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>{title}</DialogTitle>
                        <DialogDescription>{description}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">{children}</div>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Card className="border-dashed border-border/70 bg-muted/15 shadow-none">
            <CardHeader className="gap-3">
                <CardTitle className="flex items-center gap-2 text-base">
                    <Plus className="size-4" />
                    {title}
                </CardTitle>
                <p className="text-sm leading-6 text-muted-foreground">
                    {description}
                </p>
            </CardHeader>
            <CardContent className="space-y-4">
                {!isOpen ? (
                    <Button type="button" onClick={() => setIsOpen(true)}>
                        <Plus className="size-4" />
                        {actionLabel}
                    </Button>
                ) : (
                    children
                )}
            </CardContent>
        </Card>
    );
}
