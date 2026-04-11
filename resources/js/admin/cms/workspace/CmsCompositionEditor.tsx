import { useForm } from '@inertiajs/react';
import { ArrowDown, ArrowUp, Layers3, Save, Trash2 } from 'lucide-react';
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
    CmsPage,
} from '@/types';
import {
    CmsContainerEdgeAdderZone,
    CmsInsideContainerAdderZone,
} from '../components/CmsCompositionAdders';
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
    mode?: 'workspace' | 'live';
};

type CmsFormRecord = Record<string, any>;

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
) => ({
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

                <CmsInsideContainerAdderZone
                    actionHref={container.block_store_href}
                    formKeyPrefix={`container-${container.id}-block-start`}
                    insertionMode="start"
                    relativeBlockId={null}
                />

                <div className="space-y-4">
                    {container.blocks.map((block) => (
                        <BlockEditorCard key={block.id} block={block} />
                    ))}
                </div>

                <CmsInsideContainerAdderZone
                    actionHref={container.block_store_href}
                    formKeyPrefix={`container-${container.id}-block-end`}
                    insertionMode="after"
                    relativeBlockId={
                        container.blocks[container.blocks.length - 1]?.id ?? null
                    }
                />
            </CardContent>
        </Card>
    );
}

export function CmsCompositionEditor({
    page,
    containers,
    mode = 'workspace',
}: Props) {
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
                        {mode === 'live'
                            ? 'Live Page Composition'
                            : 'Page Containers and Blocks'}
                    </CardTitle>
                    <CardDescription>
                        {mode === 'live'
                            ? 'Compose this published page in place. Create a new container when content should become a new card or layout section, and add a block inside a container when the content belongs in the same card.'
                            : 'Pages own ordered containers, and containers own ordered blocks. This workspace mirrors that structure for support editing, while routine composition should stay on the real page layout when available.'}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5 text-sm leading-6 text-muted-foreground">
                    <p>
                        This structure is what gives the CMS clean placement
                        control: above a card, below a card, inside a card, and
                        between blocks inside the same card.
                    </p>
                    <p>
                        {mode === 'live'
                            ? 'These controls now appear directly on the live page for permitted users instead of forcing record-hunting through the dashboard first.'
                            : 'Use this support view for management and utility edits without turning it into a separate builder shell.'}
                    </p>
                </CardContent>
            </Card>

            <CmsContainerEdgeAdderZone
                actionHref={page.container_store_href}
                formKeyPrefix={
                    containers.length > 0
                        ? 'page-container-edge-start'
                        : 'page-container-edge-empty'
                }
                insertionMode={containers.length > 0 ? 'start' : 'end'}
                relativeContainerId={null}
                isBlankRegion={containers.length === 0}
            />

            {containers.length > 0 ? (
                <div className="space-y-6">
                    {containers.map((container) => (
                        <div key={container.id} className="space-y-6">
                            <ContainerEditorCard container={container} />
                            <CmsContainerEdgeAdderZone
                                actionHref={page.container_store_href}
                                formKeyPrefix={`page-container-edge-after-${container.id}`}
                                insertionMode="after"
                                relativeContainerId={container.id}
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
