import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Props = {
    actionHref: string | null;
    processing: boolean;
    submitLabel: string;
    readyMessage: string;
    unavailableMessage: string;
};

export function CmsAddSubmitFooter({
    actionHref,
    processing,
    submitLabel,
    readyMessage,
    unavailableMessage,
}: Props) {
    return (
        <div className="flex flex-wrap items-center gap-3">
            <Button type="submit" disabled={processing || actionHref === null}>
                <Plus className="size-4" />
                {submitLabel}
            </Button>
            <p className="text-sm leading-6 text-muted-foreground">
                {actionHref ? readyMessage : unavailableMessage}
            </p>
        </div>
    );
}
