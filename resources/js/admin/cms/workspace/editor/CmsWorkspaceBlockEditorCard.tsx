import { useForm } from '@inertiajs/react';
import { ArrowDown, ArrowUp, Save, Trash2 } from 'lucide-react';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import type { CmsAdminBlock } from '@/types';
import {
    CmsDeleteActionButton,
    CmsPostActionButton,
} from '../../components/CmsActionButtons';
import { CmsBlockRenderer } from '../../components/CmsBlockRenderer';
import { CmsModuleEditor } from '../../components/CmsModuleEditor';
import { defaultCmsModuleValue } from '../../core/module-registry';
import {
    type BlockFormData,
    modulePayloadFromForm,
    resolveModuleKey,
} from './cms-workspace-editor-helpers';
import { CmsWorkspaceModuleSelect } from './CmsWorkspaceModuleSelect';

type Props = {
    block: CmsAdminBlock;
};

export function CmsWorkspaceBlockEditorCard({ block }: Props) {
    const knownModuleKey = resolveModuleKey(block.module_key);
    const form = useForm<BlockFormData>({
        insertion_mode: 'end',
        relative_block_id: null,
        module_key: knownModuleKey,
        data_json: block.data_json ?? {},
        config_json: block.config_json ?? {},
    });

    return (
        <Card
            className="shadow-none"
            data-cms-workspace-block={block.id}
            data-cms-workspace-block-module={block.module_key}
        >
            <CardHeader className="gap-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="outline">Block {block.sort_order}</Badge>
                            <Badge variant="secondary">
                                {form.data.module_key.replace('_', ' ')}
                            </Badge>
                        </div>
                        <CardDescription>
                            Edit the current block in place, then add another
                            block below it if the content belongs in the same
                            container.
                        </CardDescription>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <CmsPostActionButton
                            href={block.move_up_href}
                            label="Move up"
                            icon={ArrowUp}
                        />
                        <CmsPostActionButton
                            href={block.move_down_href}
                            label="Move down"
                            icon={ArrowDown}
                        />
                        <CmsDeleteActionButton
                            href={block.destroy_href}
                            label="Delete block"
                            confirmMessage="Delete this block from the current container?"
                            icon={Trash2}
                        />
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-5">
                <div className="rounded-2xl border border-border/70 bg-muted/10 p-4">
                    <CmsBlockRenderer block={block} mode="admin" />
                </div>

                <form
                    className="space-y-5"
                    onSubmit={(event) => {
                        event.preventDefault();

                        form.patch(block.update_href, {
                            preserveScroll: true,
                        });
                    }}
                >
                    <div className="grid gap-2">
                        <Label htmlFor={`block-${block.id}-module`}>
                            Module type
                        </Label>
                        <CmsWorkspaceModuleSelect
                            id={`block-${block.id}-module`}
                            value={form.data.module_key}
                            onValueChange={(nextValue) => {
                                const defaults = defaultCmsModuleValue(nextValue);

                                form.setData({
                                    ...form.data,
                                    module_key: nextValue,
                                    data_json: defaults.data,
                                    config_json: defaults.config,
                                });
                            }}
                        />
                        <InputError message={form.errors.module_key} />
                    </div>

                    <CmsModuleEditor
                        moduleKey={form.data.module_key}
                        idPrefix={`block-${block.id}`}
                        value={modulePayloadFromForm(form.data)}
                        onChange={(nextValue) =>
                            form.setData({
                                ...form.data,
                                data_json: nextValue.data,
                                config_json: nextValue.config,
                            })
                        }
                        errors={form.errors}
                    />

                    <div className="flex flex-wrap items-center gap-3">
                        <Button
                            type="submit"
                            disabled={form.processing}
                            data-cms-workspace-block-save={block.id}
                        >
                            <Save className="size-4" />
                            {form.processing ? 'Saving block...' : 'Save block'}
                        </Button>
                        <p
                            className={cn(
                                'text-sm leading-6 text-muted-foreground',
                                form.recentlySuccessful && 'text-foreground',
                            )}
                        >
                            {form.recentlySuccessful
                                ? 'Block saved.'
                                : 'Block editing stays independent from page identity.'}
                        </p>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
