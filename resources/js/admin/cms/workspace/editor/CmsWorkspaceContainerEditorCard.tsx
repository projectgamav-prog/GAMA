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
import type { CmsAdminContainer, CmsContainerType } from '@/types';
import {
    CmsDeleteActionButton,
    CmsPostActionButton,
} from '../../components/CmsActionButtons';
import {
    CmsInsideContainerAdderZone,
} from '../../components/CmsCompositionAdders';
import { CmsContainerRenderer } from '../../components/CmsContainerRenderer';
import {
    type ContainerUpdateFormData,
    resolveContainerType,
} from './cms-workspace-editor-helpers';
import { CmsWorkspaceBlockEditorCard } from './CmsWorkspaceBlockEditorCard';

type Props = {
    container: CmsAdminContainer;
};

export function CmsWorkspaceContainerEditorCard({ container }: Props) {
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
                    <CmsContainerRenderer container={container} mode="admin" />
                </div>

                <CmsInsideContainerAdderZone
                    actionHref={container.block_store_href}
                    formKeyPrefix={`container-${container.id}-block-start`}
                    insertionMode="start"
                    relativeBlockId={null}
                />

                <div className="space-y-4">
                    {container.blocks.map((block) => (
                        <CmsWorkspaceBlockEditorCard
                            key={block.id}
                            block={block}
                        />
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
