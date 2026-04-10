import { AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { CmsModulePayload } from '@/types';
import { getCmsModuleManifest } from '../core/module-registry';

type Props = {
    moduleKey: string;
    value: CmsModulePayload;
    onChange: (next: CmsModulePayload) => void;
    idPrefix: string;
    errors: Record<string, string | undefined>;
};

export function CmsModuleEditor({
    moduleKey,
    value,
    onChange,
    idPrefix,
    errors,
}: Props) {
    const manifest = getCmsModuleManifest(moduleKey);

    if (! manifest) {
        return (
            <div className="rounded-2xl border border-dashed border-amber-300 bg-amber-50 px-4 py-4 text-sm leading-6 text-amber-900">
                <div className="flex items-center gap-2 font-medium">
                    <AlertTriangle className="size-4" />
                    Unknown CMS module
                </div>
                <p className="mt-2">
                    This block uses an unregistered module key: {moduleKey}
                </p>
            </div>
        );
    }

    const Editor = manifest.Editor;
    const mergedErrors = {
        ...(manifest.validate?.(value) ?? {}),
        ...errors,
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">{manifest.category}</Badge>
                <p className="text-sm font-medium text-foreground">
                    {manifest.label}
                </p>
            </div>
            <p className="text-sm leading-6 text-muted-foreground">
                {manifest.description}
            </p>
            <Editor
                value={value}
                onChange={onChange}
                idPrefix={idPrefix}
                errors={mergedErrors}
            />
        </div>
    );
}
