import { useForm } from '@inertiajs/react';
import { Save, SquarePen } from 'lucide-react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type { CmsAdminBlock, CmsModuleKey } from '@/types';
import { CmsModuleEditor } from '../CmsModuleEditor';
import { cmsModules, defaultCmsModuleValue } from '../../core/module-registry';
import {
    type BlockFormData,
    modulePayloadFromForm,
    resolveModuleKey,
} from './cms-live-composer-helpers';

type Props = {
    block: CmsAdminBlock;
    returnTo: string;
};

export function CmsLiveBlockEditDialog({ block, returnTo }: Props) {
    const knownModuleKey = resolveModuleKey(block.module_key);
    const form = useForm<BlockFormData>({
        module_key: knownModuleKey,
        return_to: returnTo,
        data_json: block.data_json ?? {},
        config_json: block.config_json ?? {},
    });

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    data-cms-live-block-edit={block.id}
                >
                    <SquarePen className="size-4" />
                    Edit block
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Edit block</DialogTitle>
                    <DialogDescription>
                        Adjust this block in place from the real page layout.
                    </DialogDescription>
                </DialogHeader>

                <form
                    className="space-y-5"
                    data-cms-live-block-edit-form={block.id}
                    onSubmit={(event) => {
                        event.preventDefault();
                        form.patch(block.update_href, {
                            preserveScroll: true,
                        });
                    }}
                >
                    <div className="grid gap-2">
                        <Label htmlFor={`live-block-${block.id}-module`}>
                            Module type
                        </Label>
                        <Select
                            value={form.data.module_key}
                            onValueChange={(value) => {
                                const nextModuleKey = value as CmsModuleKey;
                                const defaults = defaultCmsModuleValue(nextModuleKey);

                                form.setData({
                                    ...form.data,
                                    module_key: nextModuleKey,
                                    data_json: defaults.data,
                                    config_json: defaults.config,
                                });
                            }}
                        >
                            <SelectTrigger id={`live-block-${block.id}-module`}>
                                <SelectValue placeholder="Choose a CMS module" />
                            </SelectTrigger>
                            <SelectContent>
                                {cmsModules.map((module) => (
                                    <SelectItem key={module.key} value={module.key}>
                                        {module.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError message={form.errors.module_key} />
                    </div>

                    <CmsModuleEditor
                        moduleKey={form.data.module_key}
                        idPrefix={`live-block-${block.id}`}
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

                    <div className="flex items-center gap-3">
                        <Button
                            type="submit"
                            disabled={form.processing}
                            data-cms-live-block-save={block.id}
                        >
                            <Save className="size-4" />
                            {form.processing ? 'Saving...' : 'Save'}
                        </Button>
                        <span className="text-sm text-muted-foreground">
                            This updates only the selected block.
                        </span>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
