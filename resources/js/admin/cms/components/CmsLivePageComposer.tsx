import { useForm } from '@inertiajs/react';
import {
    Pencil,
    Save,
    SquarePen,
    Trash2,
} from 'lucide-react';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type {
    CmsAdminBlock,
    CmsAdminContainer,
    CmsContainerType,
    CmsModuleKey,
    CmsPage,
    CmsPublicContainer,
} from '@/types';
import {
    CmsDeleteActionButton,
} from './CmsActionButtons';
import {
    CmsContainerEdgeAdderZone,
    CmsInsideContainerAdderZone,
} from './CmsCompositionAdders';
import { CmsBlockRenderer } from './CmsBlockRenderer';
import { CmsContainerRenderer } from './CmsContainerRenderer';
import { CmsModuleEditor } from './CmsModuleEditor';
import { cmsModules, defaultCmsModuleValue } from '../core/module-registry';

type ContainerFormData = {
    label: string;
    container_type: CmsContainerType;
    return_to: string;
};

type BlockFormData = {
    module_key: CmsModuleKey;
    return_to: string;
    data_json: Record<string, any>;
    config_json: Record<string, any>;
};

const moduleKeys = new Set<CmsModuleKey>(cmsModules.map((module) => module.key));

const resolveModuleKey = (moduleKey: string): CmsModuleKey =>
    moduleKeys.has(moduleKey as CmsModuleKey)
        ? (moduleKey as CmsModuleKey)
        : 'rich_text';

function ContainerEditDialog({
    container,
    returnTo,
}: {
    container: CmsAdminContainer;
    returnTo: string;
}) {
    const form = useForm<ContainerFormData>({
        label: container.label ?? '',
        container_type:
            container.container_type === 'section' ? 'section' : 'card',
        return_to: returnTo,
    });

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button type="button" size="sm" variant="ghost">
                    <Pencil className="size-4" />
                    Edit card
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit container</DialogTitle>
                    <DialogDescription>
                        Update the container label or type without leaving the real page.
                    </DialogDescription>
                </DialogHeader>

                <form
                    className="space-y-5"
                    onSubmit={(event) => {
                        event.preventDefault();
                        form.patch(container.update_href, {
                            preserveScroll: true,
                        });
                    }}
                >
                    <div className="grid gap-2">
                        <Label htmlFor={`live-container-${container.id}-label`}>
                            Container label
                        </Label>
                        <Input
                            id={`live-container-${container.id}-label`}
                            value={form.data.label}
                            onChange={(event) =>
                                form.setData('label', event.target.value)
                            }
                            placeholder="Feature card"
                        />
                        <InputError message={form.errors.label} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor={`live-container-${container.id}-type`}>
                            Container type
                        </Label>
                        <Select
                            value={form.data.container_type}
                            onValueChange={(value) =>
                                form.setData(
                                    'container_type',
                                    value as CmsContainerType,
                                )
                            }
                        >
                            <SelectTrigger
                                id={`live-container-${container.id}-type`}
                            >
                                <SelectValue placeholder="Choose container type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="card">Card</SelectItem>
                                <SelectItem value="section">Section</SelectItem>
                            </SelectContent>
                        </Select>
                        <InputError message={form.errors.container_type} />
                    </div>

                    <div className="flex items-center gap-3">
                        <Button type="submit" disabled={form.processing}>
                            <Save className="size-4" />
                            {form.processing ? 'Saving...' : 'Save'}
                        </Button>
                        <span className="text-sm text-muted-foreground">
                            Keep the real page layout and update only this container.
                        </span>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function BlockEditDialog({
    block,
    returnTo,
}: {
    block: CmsAdminBlock;
    returnTo: string;
}) {
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
                <Button type="button" size="sm" variant="ghost">
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
                        value={{
                            data: form.data.data_json,
                            config: form.data.config_json,
                        }}
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
                        <Button type="submit" disabled={form.processing}>
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

function LiveBlockCard({
    block,
    returnTo,
}: {
    block: CmsAdminBlock;
    returnTo: string;
}) {
    return (
        <div className="space-y-2 rounded-2xl border border-border/60 bg-background/40 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">
                        {block.module_key.replace('_', ' ')}
                    </Badge>
                    <Badge variant="outline">Block {block.sort_order}</Badge>
                </div>

                <div className="flex flex-wrap items-center gap-1">
                    <BlockEditDialog block={block} returnTo={returnTo} />
                    <CmsDeleteActionButton
                        href={block.destroy_href}
                        label="Delete"
                        confirmMessage="Delete this block from the current container?"
                        icon={Trash2}
                        size="sm"
                        data={{ return_to: returnTo }}
                    />
                </div>
            </div>

            <div className="pl-1">
                <CmsBlockRenderer block={block} />
            </div>
        </div>
    );
}

function LiveContainerCard({
    container,
    returnTo,
}: {
    container: CmsAdminContainer;
    returnTo: string;
}) {
    return (
        <section className="space-y-4 rounded-[1.75rem] border border-border/70 bg-background/85 p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                    <Badge
                        variant={
                            container.container_type === 'card'
                                ? 'secondary'
                                : 'outline'
                        }
                    >
                        {container.container_type === 'card'
                            ? 'Card container'
                            : 'Section container'}
                    </Badge>
                    <Badge variant="outline">
                        Container {container.sort_order}
                    </Badge>
                    {container.label && (
                        <p className="text-sm font-medium text-foreground">
                            {container.label}
                        </p>
                    )}
                </div>

                <div className="flex flex-wrap items-center gap-1">
                    <ContainerEditDialog container={container} returnTo={returnTo} />
                    <CmsDeleteActionButton
                        href={container.destroy_href}
                        label="Delete"
                        confirmMessage="Delete this container and every block inside it?"
                        icon={Trash2}
                        size="sm"
                        data={{ return_to: returnTo }}
                    />
                </div>
            </div>

            <CmsInsideContainerAdderZone
                actionHref={container.block_store_href}
                formKeyPrefix={`live-container-${container.id}-top`}
                insertionMode="start"
                relativeBlockId={null}
                placementLabel="Top of card"
                compact
                returnTo={returnTo}
            />

            {container.blocks.length > 0 ? (
                <div className="space-y-4">
                    {container.blocks.map((block) => (
                        <LiveBlockCard
                            key={block.id}
                            block={block}
                            returnTo={returnTo}
                        />
                    ))}
                </div>
            ) : (
                <div className="rounded-2xl border border-dashed border-border/60 bg-background/60 px-4 py-5 text-sm text-muted-foreground">
                    This container does not contain any blocks yet.
                </div>
            )}

            <CmsInsideContainerAdderZone
                actionHref={container.block_store_href}
                formKeyPrefix={`live-container-${container.id}-bottom`}
                insertionMode="after"
                relativeBlockId={
                    container.blocks[container.blocks.length - 1]?.id ?? null
                }
                placementLabel="Bottom of card"
                compact
                returnTo={returnTo}
            />
        </section>
    );
}

type Props = {
    page: CmsPage;
    containers: CmsAdminContainer[];
};

export function CmsLivePageComposer({
    page,
    containers,
}: Props) {
    if (containers.length === 0) {
        return (
            <CmsContainerEdgeAdderZone
                actionHref={page.container_store_href}
                formKeyPrefix="live-page-container-empty"
                insertionMode="end"
                relativeContainerId={null}
                isBlankRegion
                compact
                returnTo={page.public_href}
            />
        );
    }

    return (
        <div className="space-y-6">
            {containers.map((container) => (
                <LiveContainerCard
                    key={container.id}
                    container={container}
                    returnTo={page.public_href}
                />
            ))}
        </div>
    );
}

export function CmsPublicContainerStack({
    containers,
}: {
    containers: CmsPublicContainer[];
}) {
    if (containers.length === 0) {
        return (
            <div className="rounded-[2rem] border border-dashed border-border/70 bg-background/85 p-8 text-sm leading-7 text-muted-foreground">
                This page is published, but it does not have any containers yet.
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {containers.map((container) => (
                <CmsContainerRenderer
                    key={container.id}
                    container={container}
                />
            ))}
        </div>
    );
}
