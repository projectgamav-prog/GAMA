import { useForm } from '@inertiajs/react';
import { ArrowDown, ArrowUp, Layers3, Plus, Save, Trash2 } from 'lucide-react';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type {
    CmsAdminBlock,
    CmsAdminContainer,
    CmsContainerType,
    CmsInsertionMode,
    CmsModuleKey,
    CmsModulePayload,
    CmsPage,
} from '@/types';
import { CmsBlockRenderer } from '../components/CmsBlockRenderer';
import {
    CmsDeleteActionButton,
    CmsPostActionButton,
} from '../components/CmsActionButtons';
import { CmsContainerRenderer } from '../components/CmsContainerRenderer';
import { CmsModuleEditor } from '../components/CmsModuleEditor';
import { cmsModules, defaultCmsModuleValue } from '../core/module-registry';

type Props = {
    page: CmsPage;
    containers: CmsAdminContainer[];
};

type CmsFormRecord = Record<string, any>;

type ContainerInsertFormData = {
    label: string;
    container_type: CmsContainerType;
    insertion_mode: CmsInsertionMode;
    relative_container_id: number | null;
    module_key: CmsModuleKey;
    data_json: CmsFormRecord;
    config_json: CmsFormRecord;
};

type BlockFormData = {
    insertion_mode: CmsInsertionMode;
    relative_block_id: number | null;
    module_key: CmsModuleKey;
    data_json: CmsFormRecord;
    config_json: CmsFormRecord;
};

type ContainerUpdateFormData = {
    label: string;
    container_type: CmsContainerType;
};

const defaultModuleKey: CmsModuleKey = 'rich_text';

const moduleKeys = new Set<CmsModuleKey>(cmsModules.map((module) => module.key));

const resolveModuleKey = (moduleKey: string): CmsModuleKey =>
    moduleKeys.has(moduleKey as CmsModuleKey)
        ? (moduleKey as CmsModuleKey)
        : defaultModuleKey;

const resolveContainerType = (containerType: string): CmsContainerType =>
    containerType === 'section' ? 'section' : 'card';

const modulePayloadFromForm = (
    form: Pick<BlockFormData, 'data_json' | 'config_json'>,
): CmsModulePayload => ({
    data: form.data_json,
    config: form.config_json,
});

function ModuleSelect({
    id,
    value,
    onValueChange,
}: {
    id: string;
    value: CmsModuleKey;
    onValueChange: (nextValue: CmsModuleKey) => void;
}) {
    return (
        <Select
            value={value}
            onValueChange={(nextValue) => onValueChange(nextValue as CmsModuleKey)}
        >
            <SelectTrigger id={id} className="w-full">
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
    );
}

function ContainerInsertForm({
    actionHref,
    formKey,
    insertionMode,
    relativeContainerId,
    title,
    description,
}: {
    actionHref: string;
    formKey: string;
    insertionMode: CmsInsertionMode;
    relativeContainerId: number | null;
    title: string;
    description: string;
}) {
    const buildInitialData = (
        moduleKey: CmsModuleKey = defaultModuleKey,
    ): ContainerInsertFormData => {
        const defaults = defaultCmsModuleValue(moduleKey);

        return {
            label: '',
            container_type: 'card',
            insertion_mode: insertionMode,
            relative_container_id: relativeContainerId,
            module_key: moduleKey,
            data_json: defaults.data,
            config_json: defaults.config,
        };
    };

    const form = useForm<ContainerInsertFormData>(buildInitialData());

    return (
        <Card className="border-dashed border-border/70 bg-muted/15 shadow-none">
            <CardHeader className="gap-3">
                <CardTitle className="flex items-center gap-2 text-base">
                    <Plus className="size-4" />
                    {title}
                </CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
                <form
                    className="space-y-5"
                    onSubmit={(event) => {
                        event.preventDefault();

                        form.post(actionHref, {
                            preserveScroll: true,
                        });
                    }}
                >
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor={`${formKey}-container-type`}>
                                Container type
                            </Label>
                            <Select
                                value={form.data.container_type}
                                onValueChange={(nextValue) =>
                                    form.setData(
                                        'container_type',
                                        nextValue as CmsContainerType,
                                    )
                                }
                            >
                                <SelectTrigger
                                    id={`${formKey}-container-type`}
                                    className="w-full"
                                >
                                    <SelectValue placeholder="Choose container type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="card">Card</SelectItem>
                                    <SelectItem value="section">
                                        Section
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            <InputError message={form.errors.container_type} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor={`${formKey}-container-label`}>
                                Container label
                            </Label>
                            <Input
                                id={`${formKey}-container-label`}
                                value={form.data.label}
                                onChange={(event) =>
                                    form.setData('label', event.target.value)
                                }
                                placeholder="Hero card"
                            />
                            <InputError message={form.errors.label} />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor={`${formKey}-module`}>First block module</Label>
                        <ModuleSelect
                            id={`${formKey}-module`}
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
                        idPrefix={formKey}
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
                        <Button type="submit" disabled={form.processing}>
                            <Plus className="size-4" />
                            {form.processing
                                ? 'Creating container...'
                                : 'Create container'}
                        </Button>
                        <p className="text-sm leading-6 text-muted-foreground">
                            Choose this path when the content should become its
                            own card or section rather than stay inside an
                            existing container.
                        </p>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}

function BlockInsertForm({
    actionHref,
    formKey,
    insertionMode,
    relativeBlockId,
    title,
    description,
}: {
    actionHref: string;
    formKey: string;
    insertionMode: CmsInsertionMode;
    relativeBlockId: number | null;
    title: string;
    description: string;
}) {
    const buildInitialData = (
        moduleKey: CmsModuleKey = defaultModuleKey,
    ): BlockFormData => {
        const defaults = defaultCmsModuleValue(moduleKey);

        return {
            insertion_mode: insertionMode,
            relative_block_id: relativeBlockId,
            module_key: moduleKey,
            data_json: defaults.data,
            config_json: defaults.config,
        };
    };

    const form = useForm<BlockFormData>(buildInitialData());

    return (
        <Card className="border-dashed border-border/70 bg-muted/15 shadow-none">
            <CardHeader className="gap-3">
                <CardTitle className="flex items-center gap-2 text-base">
                    <Plus className="size-4" />
                    {title}
                </CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
                <form
                    className="space-y-5"
                    onSubmit={(event) => {
                        event.preventDefault();

                        form.post(actionHref, {
                            preserveScroll: true,
                        });
                    }}
                >
                    <div className="grid gap-2">
                        <Label htmlFor={`${formKey}-module`}>Module</Label>
                        <ModuleSelect
                            id={`${formKey}-module`}
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
                        idPrefix={formKey}
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
                        <Button type="submit" disabled={form.processing}>
                            <Plus className="size-4" />
                            {form.processing ? 'Adding block...' : 'Add block'}
                        </Button>
                        <p className="text-sm leading-6 text-muted-foreground">
                            Use this path when the new content belongs inside
                            the current card or section.
                        </p>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}

function BlockEditorCard({
    block,
}: {
    block: CmsAdminBlock;
}) {
    const knownModuleKey = resolveModuleKey(block.module_key);
    const form = useForm<BlockFormData>({
        insertion_mode: 'end',
        relative_block_id: null,
        module_key: knownModuleKey,
        data_json: block.data_json ?? {},
        config_json: block.config_json ?? {},
    });

    return (
        <Card className="shadow-none">
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
                        <ModuleSelect
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
                        <Button type="submit" disabled={form.processing}>
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

function ContainerEditorCard({
    container,
}: {
    container: CmsAdminContainer;
}) {
    const form = useForm<ContainerUpdateFormData>({
        label: container.label ?? '',
        container_type: resolveContainerType(container.container_type),
    });

    return (
        <Card className="overflow-hidden">
            <CardHeader className="gap-4 border-b border-border/60 bg-muted/10">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="outline">
                                Container {container.sort_order}
                            </Badge>
                            <Badge
                                variant={
                                    container.container_type === 'card'
                                        ? 'secondary'
                                        : 'outline'
                                }
                            >
                                {container.container_type}
                            </Badge>
                        </div>
                        <CardTitle className="text-lg">
                            {container.label || 'Untitled container'}
                        </CardTitle>
                        <CardDescription>
                            This container owns its own ordered block list.
                            Add blocks here when the content should stay inside
                            the same card or section.
                        </CardDescription>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <CmsPostActionButton
                            href={container.move_up_href}
                            label="Move up"
                            icon={ArrowUp}
                        />
                        <CmsPostActionButton
                            href={container.move_down_href}
                            label="Move down"
                            icon={ArrowDown}
                        />
                        <CmsDeleteActionButton
                            href={container.destroy_href}
                            label="Delete container"
                            confirmMessage="Delete this container and every block inside it?"
                            icon={Trash2}
                        />
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
                <form
                    className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px_auto]"
                    onSubmit={(event) => {
                        event.preventDefault();

                        form.patch(container.update_href, {
                            preserveScroll: true,
                        });
                    }}
                >
                    <div className="grid gap-2">
                        <Label htmlFor={`container-${container.id}-label`}>
                            Container label
                        </Label>
                        <Input
                            id={`container-${container.id}-label`}
                            value={form.data.label}
                            onChange={(event) =>
                                form.setData('label', event.target.value)
                            }
                            placeholder="Feature grid"
                        />
                        <InputError message={form.errors.label} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor={`container-${container.id}-type`}>
                            Container type
                        </Label>
                        <Select
                            value={form.data.container_type}
                            onValueChange={(nextValue) =>
                                form.setData(
                                    'container_type',
                                    nextValue as CmsContainerType,
                                )
                            }
                        >
                            <SelectTrigger
                                id={`container-${container.id}-type`}
                                className="w-full"
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

                    <div className="flex items-end">
                        <Button type="submit" disabled={form.processing}>
                            <Save className="size-4" />
                            {form.processing
                                ? 'Saving container...'
                                : 'Save container'}
                        </Button>
                    </div>
                </form>

                <div className="space-y-3">
                    <div>
                        <p className="text-sm font-medium text-foreground">
                            Container preview
                        </p>
                        <p className="text-sm leading-6 text-muted-foreground">
                            This is the current rendered shape of the container
                            with all of its blocks.
                        </p>
                    </div>
                    <CmsContainerRenderer
                        container={container}
                        mode="admin"
                    />
                </div>

                <BlockInsertForm
                    actionHref={container.block_store_href}
                    formKey={`container-${container.id}-block-start`}
                    insertionMode="start"
                    relativeBlockId={null}
                    title="Add block at the top of this container"
                    description="This places the new block above the current container content."
                />

                <div className="space-y-4">
                    {container.blocks.map((block) => (
                        <div key={block.id} className="space-y-4">
                            <BlockEditorCard block={block} />
                            <BlockInsertForm
                                actionHref={container.block_store_href}
                                formKey={`container-${container.id}-block-after-${block.id}`}
                                insertionMode="after"
                                relativeBlockId={block.id}
                                title="Add block below this block"
                                description="Use this to place content between blocks or at the bottom of the current container."
                            />
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

export function CmsCompositionEditor({ page, containers }: Props) {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline">CMS Composition</Badge>
                        <Badge variant="secondary">
                            {page.container_count} containers
                        </Badge>
                        <Badge variant="secondary">
                            {page.block_count} blocks
                        </Badge>
                    </div>
                    <CardTitle className="flex items-center gap-2">
                        <Layers3 className="size-5" />
                        Page Containers and Blocks
                    </CardTitle>
                    <CardDescription>
                        Pages own ordered containers, and containers own ordered
                        blocks. Create a new container when content should
                        become a new card or layout section. Add a block inside
                        a container when the content belongs in the same card.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5 text-sm leading-6 text-muted-foreground">
                    <p>
                        This structure is what gives the CMS clean placement
                        control: above a card, below a card, inside a card, and
                        between blocks inside the same card.
                    </p>
                    <p>
                        The workspace below keeps that choice local instead of
                        hiding it behind page-specific hacks.
                    </p>
                </CardContent>
            </Card>

            <ContainerInsertForm
                key={
                    containers.length > 0
                        ? 'page-container-insert-start'
                        : 'page-container-insert-empty'
                }
                actionHref={page.container_store_href}
                formKey={
                    containers.length > 0
                        ? 'page-container-insert-start'
                        : 'page-container-insert-empty'
                }
                insertionMode={containers.length > 0 ? 'start' : 'end'}
                relativeContainerId={null}
                title={
                    containers.length > 0
                        ? 'Create a container above all current containers'
                        : 'Create the first container on this page'
                }
                description={
                    containers.length > 0
                        ? 'Use this when the new content should start in its own card or section at the top of the page.'
                        : 'A page starts empty. Create the first container, then add more blocks inside it or add more containers below.'
                }
            />

            {containers.length > 0 ? (
                <div className="space-y-6">
                    {containers.map((container) => (
                        <div key={container.id} className="space-y-6">
                            <ContainerEditorCard container={container} />
                            <ContainerInsertForm
                                key={`page-container-insert-after-${container.id}`}
                                actionHref={page.container_store_href}
                                formKey={`page-container-insert-after-${container.id}`}
                                insertionMode="after"
                                relativeContainerId={container.id}
                                title="Create a new container below this one"
                                description="Choose this when the next content should break out into a new card or layout section instead of staying inside the current container."
                            />
                        </div>
                    ))}
                </div>
            ) : (
                <Card className="border-dashed border-border/70 bg-muted/15 shadow-none">
                    <CardContent className="pt-6">
                        <p className="text-sm leading-6 text-muted-foreground">
                            This page does not have any containers yet. Create
                            the first container above, then compose inside it
                            with rich text, button groups, or media blocks.
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
