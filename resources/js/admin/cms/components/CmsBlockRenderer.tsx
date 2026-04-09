import { AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type {
    CmsAdminBlock,
    CmsModulePayload,
    CmsPublicBlock,
} from '@/types';
import { getCmsModuleManifest } from '../core/module-registry';

type Props = {
    block: CmsAdminBlock | CmsPublicBlock;
    mode?: 'admin' | 'public';
};

const toPayload = (
    block: CmsAdminBlock | CmsPublicBlock,
): CmsModulePayload => ({
    data: block.data_json ?? {},
    config: block.config_json ?? {},
});

export function CmsBlockRenderer({
    block,
    mode = 'public',
}: Props) {
    const manifest = getCmsModuleManifest(block.module_key);

    if (! manifest) {
        return (
            <div className="rounded-2xl border border-dashed border-amber-300 bg-amber-50 px-4 py-4 text-sm leading-6 text-amber-900">
                <div className="flex items-center gap-2 font-medium">
                    <AlertTriangle className="size-4" />
                    Unknown CMS block
                </div>
                <p className="mt-2">
                    The module key `{block.module_key}` is not registered in the
                    CMS frontend registry yet.
                </p>
            </div>
        );
    }

    const Renderer = manifest.Renderer;

    return (
        <div className="space-y-3">
            {mode === 'admin' && (
                <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">{manifest.label}</Badge>
                    <Badge variant="outline">{manifest.category}</Badge>
                </div>
            )}
            <Renderer value={toPayload(block)} mode={mode} />
        </div>
    );
}
