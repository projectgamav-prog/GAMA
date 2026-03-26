import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';

type Props = {
    title: ReactNode;
    description: ReactNode;
    action?: ReactNode;
    icon?: LucideIcon;
};

export function ScriptureEmptyState({
    title,
    description,
    action,
    icon: Icon,
}: Props) {
    return (
        <Card>
            <CardHeader className="gap-3">
                {Icon && (
                    <div className="w-fit rounded-md bg-primary/10 p-2 text-primary">
                        <Icon className="size-4" />
                    </div>
                )}

                <div className="space-y-2">
                    <CardTitle className="text-lg">{title}</CardTitle>
                    <CardDescription className="max-w-3xl leading-7">
                        {description}
                    </CardDescription>
                </div>
            </CardHeader>

            {action && <CardContent>{action}</CardContent>}
        </Card>
    );
}
