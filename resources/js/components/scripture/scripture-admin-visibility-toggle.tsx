import { router } from '@inertiajs/react';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAdminContext } from '@/hooks/use-admin-context';

export function ScriptureAdminVisibilityToggle() {
    const adminContext = useAdminContext();
    const [processing, setProcessing] = useState(false);

    if (!adminContext.canAccess || adminContext.visibilityUrl === null) {
        return null;
    }

    const visibilityUrl = adminContext.visibilityUrl;

    const toggleVisibility = () => {
        setProcessing(true);

        router.post(
            visibilityUrl,
            {
                visible: !adminContext.isVisible,
            },
            {
                preserveScroll: true,
                onFinish: () => setProcessing(false),
            },
        );
    };

    return (
        <Button
            type="button"
            size="sm"
            variant={adminContext.isVisible ? 'default' : 'outline'}
            className="h-9 rounded-full px-4"
            data-admin-visibility-toggle="scripture"
            onClick={toggleVisibility}
            disabled={processing}
        >
            {adminContext.isVisible ? (
                <EyeOff className="size-4" />
            ) : (
                <Eye className="size-4" />
            )}
            {adminContext.isVisible ? 'Hide controls' : 'Show controls'}
        </Button>
    );
}
