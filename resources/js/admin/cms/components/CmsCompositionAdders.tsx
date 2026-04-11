import { type ReactNode, useState } from 'react';
import { useForm } from '@inertiajs/react';
import { ChevronLeft, Plus } from 'lucide-react';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import type {
    CmsContainerType,
    CmsInsertionMode,
    CmsModuleCategory,
    CmsModuleKey,
    CmsModulePayload,
} from '@/types';
import { CmsModuleEditor } from './CmsModuleEditor';
import { cmsModules, defaultCmsModuleValue } from '../core/module-registry';

type CmsFormRecord = Record<string, any>;

type ContainerInsertFormData = {
    label: string;
    container_type: CmsContainerType;
    insertion_mode: CmsInsertionMode;
    relative_container_id: number | null;
    module_key: CmsModuleKey;
    return_to: string;
    data_json: CmsFormRecord;
    config_json: CmsFormRecord;
};

type BlockFormData = {
    insertion_mode: CmsInsertionMode;
    relative_block_id: number | null;
    module_key: CmsModuleKey;
    return_to: string;
    data_json: CmsFormRecord;
    config_json: CmsFormRecord;
};

const defaultModuleKey: CmsModuleKey = 'rich_text';

const modulePayloadFromForm = (
    form: Pick<BlockFormData, 'data_json' | 'config_json'>,
): CmsModulePayload => ({
    data: form.data_json,
    config: form.config_json,
});

const cmsModuleCategories = Array.from(
    new Set(cmsModules.map((module) => module.category)),
) as CmsModuleCategory[];

function categoryLabel(category: CmsModuleCategory): string {
    return category === 'actions'
        ? 'Buttons and actions'
        : category === 'collections'
          ? 'Cards and lists'
        : category === 'media'
          ? 'Media'
          : 'Text';
}

function CategoryStep({
    selectedCategory,
    onSelect,
}: {
    selectedCategory: CmsModuleCategory | null;
    onSelect: (category: CmsModuleCategory) => void;
}) {
    return (
        <div className="space-y-3">
            <p className="text-sm font-medium text-foreground">
                Choose a content category
            </p>
            <div className="flex flex-wrap gap-2">
                {cmsModuleCategories.map((category) => (
                    <Button
                        key={category}
                        type="button"
                        variant={
                            selectedCategory === category
                                ? 'default'
                                : 'outline'
                        }
                        onClick={() => onSelect(category)}
                    >
                        {categoryLabel(category)}
                    </Button>
                ))}
            </div>
        </div>
    );
}

function ModuleStep({
    selectedCategory,
    selectedModuleKey,
    onSelectModule,
}: {
    selectedCategory: CmsModuleCategory;
    selectedModuleKey: CmsModuleKey;
    onSelectModule: (moduleKey: CmsModuleKey) => void;
}) {
    const modules = cmsModules.filter(
        (module) => module.category === selectedCategory,
    );

    return (
        <div className="space-y-3">
            <p className="text-sm font-medium text-foreground">
                Choose a block type
            </p>
            <div className="grid gap-2 md:grid-cols-2">
                {modules.map((module) => (
                    <button
                        key={module.key}
                        type="button"
                        onClick={() => onSelectModule(module.key)}
                        className="rounded-2xl border border-border/70 bg-background px-4 py-4 text-left transition hover:border-primary/50 hover:bg-muted/20"
                    >
                        <div className="flex items-center gap-2">
                            <Badge
                                variant={
                                    selectedModuleKey === module.key
                                        ? 'secondary'
                                        : 'outline'
                                }
                            >
                                {module.category}
                            </Badge>
                            <p className="font-medium text-foreground">
                                {module.label}
                            </p>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                            {module.description}
                        </p>
                    </button>
                ))}
            </div>
        </div>
    );
}

function ContainerTypeStep({
    selectedType,
    onSelectType,
}: {
    selectedType: CmsContainerType | null;
    onSelectType: (containerType: CmsContainerType) => void;
}) {
    return (
        <div className="space-y-3">
            <p className="text-sm font-medium text-foreground">
                Choose a container type
            </p>
            <div className="grid gap-2 md:grid-cols-2">
                {(
                    [
                        {
                            type: 'card' as const,
                            label: 'Card',
                            description:
                                'Use a card when this content should feel like its own contained panel.',
                        },
                        {
                            type: 'section' as const,
                            label: 'Section',
                            description:
                                'Use a section when this content should feel more like an open layout band.',
                        },
                    ] satisfies Array<{
                        type: CmsContainerType;
                        label: string;
                        description: string;
                    }>
                ).map((option) => (
                    <button
                        key={option.type}
                        type="button"
                        onClick={() => onSelectType(option.type)}
                        className="rounded-2xl border border-border/70 bg-background px-4 py-4 text-left transition hover:border-primary/50 hover:bg-muted/20"
                    >
                        <div className="flex items-center gap-2">
                            <Badge
                                variant={
                                    selectedType === option.type
                                        ? 'secondary'
                                        : 'outline'
                                }
                            >
                                {option.label}
                            </Badge>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                            {option.description}
                        </p>
                    </button>
                ))}
            </div>
        </div>
    );
}

function StepHeader({
    title,
    description,
    onBack,
}: {
    title: string;
    description: string;
    onBack?: (() => void) | null;
}) {
    return (
        <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline">Progressive reveal</Badge>
                    <p className="text-sm font-medium text-foreground">
                        {title}
                    </p>
                </div>
                {onBack && (
                    <Button type="button" variant="ghost" size="sm" onClick={onBack}>
                        <ChevronLeft className="size-4" />
                        Back
                    </Button>
                )}
            </div>
            <p className="text-sm leading-6 text-muted-foreground">
                {description}
            </p>
        </div>
    );
}

function AddLauncherCard({
    title,
    description,
    actionLabel,
    children,
    compact = false,
}: {
    title: string;
    description: string;
    actionLabel: string;
    children: ReactNode;
    compact?: boolean;
}) {
    const [isOpen, setIsOpen] = useState(false);

    if (compact) {
        return (
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                    <Button type="button" size="sm" variant="outline">
                        <Plus className="size-4" />
                        {actionLabel}
                    </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>{title}</DialogTitle>
                        <DialogDescription>{description}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">{children}</div>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Card className="border-dashed border-border/70 bg-muted/15 shadow-none">
            <CardHeader className="gap-3">
                <CardTitle className="flex items-center gap-2 text-base">
                    <Plus className="size-4" />
                    {title}
                </CardTitle>
                <p className="text-sm leading-6 text-muted-foreground">
                    {description}
                </p>
            </CardHeader>
            <CardContent className="space-y-4">
                {!isOpen ? (
                    <Button type="button" onClick={() => setIsOpen(true)}>
                        <Plus className="size-4" />
                        {actionLabel}
                    </Button>
                ) : (
                    children
                )}
            </CardContent>
        </Card>
    );
}

function ContainerComposerAdder({
    actionHref,
    formKey,
    insertionMode,
    relativeContainerId,
    title,
    description,
    actionLabel,
    lockedModuleKey = null,
    compact = false,
    returnTo,
}: {
    actionHref: string | null;
    formKey: string;
    insertionMode: CmsInsertionMode;
    relativeContainerId: number | null;
    title: string;
    description: string;
    actionLabel: string;
    lockedModuleKey?: CmsModuleKey | null;
    compact?: boolean;
    returnTo?: string | null;
}) {
    const buildInitialData = (
        moduleKey: CmsModuleKey = lockedModuleKey ?? defaultModuleKey,
    ): ContainerInsertFormData => {
        const defaults = defaultCmsModuleValue(moduleKey);

        return {
            label: '',
            container_type: 'card',
            insertion_mode: insertionMode,
            relative_container_id: relativeContainerId,
            module_key: moduleKey,
            return_to: returnTo ?? '',
            data_json: defaults.data,
            config_json: defaults.config,
        };
    };

    const form = useForm<ContainerInsertFormData>(buildInitialData());
    const [selectedType, setSelectedType] = useState<CmsContainerType | null>(
        null,
    );
    const [selectedCategory, setSelectedCategory] =
        useState<CmsModuleCategory | null>(
            lockedModuleKey ? null : 'text',
        );

    const setModuleKey = (moduleKey: CmsModuleKey) => {
        const defaults = defaultCmsModuleValue(moduleKey);

        form.setData({
            ...form.data,
            module_key: moduleKey,
            data_json: defaults.data,
            config_json: defaults.config,
        });
    };

    return (
        <AddLauncherCard
            title={title}
            description={description}
            actionLabel={actionLabel}
            compact={compact}
        >
            {selectedType === null ? (
                <div className="space-y-4">
                    <StepHeader
                        title="Step 1"
                        description="Choose the kind of container this content should create."
                    />
                    <ContainerTypeStep
                        selectedType={selectedType}
                        onSelectType={(containerType) => {
                            setSelectedType(containerType);
                            form.setData('container_type', containerType);
                        }}
                    />
                </div>
            ) : (
                <form
                    className="space-y-5"
                    onSubmit={(event) => {
                        event.preventDefault();

                        if (!actionHref) {
                            return;
                        }

                        form.post(actionHref, {
                            preserveScroll: true,
                        });
                    }}
                >
                    <StepHeader
                        title="Step 2"
                        description={
                            lockedModuleKey === 'button_group'
                                ? 'Configure the button container in place. This creates a new container with a button group as its first block.'
                                : 'Name the new container, then choose the first content block that should live inside it.'
                        }
                        onBack={() => setSelectedType(null)}
                    />

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
                            placeholder={
                                selectedType === 'card'
                                    ? 'Feature card'
                                    : 'Feature section'
                            }
                        />
                        <InputError message={form.errors.label} />
                    </div>

                    {lockedModuleKey === null ? (
                        <div className="space-y-5">
                            <CategoryStep
                                selectedCategory={selectedCategory}
                                onSelect={setSelectedCategory}
                            />

                            {selectedCategory && (
                                <ModuleStep
                                    selectedCategory={selectedCategory}
                                    selectedModuleKey={form.data.module_key}
                                    onSelectModule={setModuleKey}
                                />
                            )}
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-border/70 bg-background px-4 py-4">
                            <p className="text-sm leading-6 text-muted-foreground">
                                This path creates a new container and seeds it
                                with a button group immediately.
                            </p>
                        </div>
                    )}

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
                        <Button
                            type="submit"
                            disabled={form.processing || actionHref === null}
                        >
                            <Plus className="size-4" />
                            {lockedModuleKey === 'button_group'
                                ? 'Create button container'
                                : 'Create container'}
                        </Button>
                        <p className="text-sm leading-6 text-muted-foreground">
                            {actionHref
                                ? 'The container is created first, then its first block is seeded from the flow you chose.'
                                : 'This region experiment is mounted through the universal CMS layer, but persistence outside CMS pages is not wired yet.'}
                        </p>
                    </div>
                </form>
            )}
        </AddLauncherCard>
    );
}

function BlockComposerAdder({
    actionHref,
    formKey,
    insertionMode,
    relativeBlockId,
    title,
    description,
    actionLabel,
    lockedModuleKey = null,
    compact = false,
    returnTo,
}: {
    actionHref: string | null;
    formKey: string;
    insertionMode: CmsInsertionMode;
    relativeBlockId: number | null;
    title: string;
    description: string;
    actionLabel: string;
    lockedModuleKey?: CmsModuleKey | null;
    compact?: boolean;
    returnTo?: string | null;
}) {
    const buildInitialData = (
        moduleKey: CmsModuleKey = lockedModuleKey ?? defaultModuleKey,
    ): BlockFormData => {
        const defaults = defaultCmsModuleValue(moduleKey);

        return {
            insertion_mode: insertionMode,
            relative_block_id: relativeBlockId,
            module_key: moduleKey,
            return_to: returnTo ?? '',
            data_json: defaults.data,
            config_json: defaults.config,
        };
    };

    const form = useForm<BlockFormData>(buildInitialData());
    const [selectedCategory, setSelectedCategory] =
        useState<CmsModuleCategory | null>(
            lockedModuleKey ? null : 'text',
        );

    const setModuleKey = (moduleKey: CmsModuleKey) => {
        const defaults = defaultCmsModuleValue(moduleKey);

        form.setData({
            ...form.data,
            module_key: moduleKey,
            data_json: defaults.data,
            config_json: defaults.config,
        });
    };

    return (
        <AddLauncherCard
            title={title}
            description={description}
            actionLabel={actionLabel}
            compact={compact}
        >
            <form
                className="space-y-5"
                onSubmit={(event) => {
                    event.preventDefault();

                    if (!actionHref) {
                        return;
                    }

                    form.post(actionHref, {
                        preserveScroll: true,
                    });
                }}
            >
                <StepHeader
                    title="Progressive add"
                    description={
                        lockedModuleKey === 'button_group'
                            ? 'Configure a button group in steps so the container only gets the action content it needs.'
                            : 'Choose a block category first, then narrow down to the block type that belongs in this container.'
                    }
                />

                {lockedModuleKey === null ? (
                    <div className="space-y-5">
                        <CategoryStep
                            selectedCategory={selectedCategory}
                            onSelect={setSelectedCategory}
                        />

                        {selectedCategory && (
                            <ModuleStep
                                selectedCategory={selectedCategory}
                                selectedModuleKey={form.data.module_key}
                                onSelectModule={setModuleKey}
                            />
                        )}
                    </div>
                ) : (
                    <div className="rounded-2xl border border-border/70 bg-background px-4 py-4">
                        <p className="text-sm leading-6 text-muted-foreground">
                            This path keeps the content in the current container
                            and adds a button group block directly into it.
                        </p>
                    </div>
                )}

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
                    <Button
                        type="submit"
                        disabled={form.processing || actionHref === null}
                    >
                        <Plus className="size-4" />
                        {lockedModuleKey === 'button_group'
                            ? 'Add button group'
                            : 'Add block'}
                    </Button>
                    <p className="text-sm leading-6 text-muted-foreground">
                        {actionHref
                            ? 'This content stays in the current container rather than creating a new one.'
                            : 'This universal region experiment is visible here, but persistence is still limited to CMS pages.'}
                    </p>
                </div>
            </form>
        </AddLauncherCard>
    );
}

export function CmsContainerEdgeAdderZone({
    actionHref,
    formKeyPrefix,
    insertionMode,
    relativeContainerId,
    isBlankRegion = false,
    compact = false,
    returnTo,
}: {
    actionHref: string | null;
    formKeyPrefix: string;
    insertionMode: CmsInsertionMode;
    relativeContainerId: number | null;
    isBlankRegion?: boolean;
    compact?: boolean;
    returnTo?: string | null;
}) {
    return (
        <div className="grid gap-4 xl:grid-cols-2">
            <ContainerComposerAdder
                actionHref={actionHref}
                formKey={`${formKeyPrefix}-card`}
                insertionMode={insertionMode}
                relativeContainerId={relativeContainerId}
                title={isBlankRegion ? 'Add Card' : 'Add Card Here'}
                description={
                    isBlankRegion
                        ? 'This region is blank, so start by creating a new card or section.'
                        : 'Create a new card or section at this container edge.'
                }
                actionLabel="Add Card"
                compact={compact}
                returnTo={returnTo}
            />
            <ContainerComposerAdder
                actionHref={actionHref}
                formKey={`${formKeyPrefix}-button`}
                insertionMode={insertionMode}
                relativeContainerId={relativeContainerId}
                title={isBlankRegion ? 'Add Button' : 'Add Button Here'}
                description={
                    isBlankRegion
                        ? 'Start with a focused action container when the region should open around a button set first.'
                        : 'Create a new action container at this edge.'
                }
                actionLabel="Add Button"
                lockedModuleKey="button_group"
                compact={compact}
                returnTo={returnTo}
            />
        </div>
    );
}

export function CmsInsideContainerAdderZone({
    actionHref,
    formKeyPrefix,
    insertionMode,
    relativeBlockId,
    placementLabel,
    compact = false,
    returnTo,
}: {
    actionHref: string | null;
    formKeyPrefix: string;
    insertionMode: CmsInsertionMode;
    relativeBlockId: number | null;
    placementLabel?: string;
    compact?: boolean;
    returnTo?: string | null;
}) {
    return (
        <div className="grid gap-4 xl:grid-cols-2">
            <BlockComposerAdder
                actionHref={actionHref}
                formKey={`${formKeyPrefix}-block`}
                insertionMode={insertionMode}
                relativeBlockId={relativeBlockId}
                title="Add Block"
                description={
                    placementLabel
                        ? `Add content at the ${placementLabel.toLowerCase()} without creating a new outer card.`
                        : 'Add content inside this container without creating a new outer card.'
                }
                actionLabel="Add Block"
                compact={compact}
                returnTo={returnTo}
            />
            <BlockComposerAdder
                actionHref={actionHref}
                formKey={`${formKeyPrefix}-button`}
                insertionMode={insertionMode}
                relativeBlockId={relativeBlockId}
                title="Add Button"
                description={
                    placementLabel
                        ? `Add a button group at the ${placementLabel.toLowerCase()} in a smaller progressive flow.`
                        : 'Add a button group inside this container in a smaller progressive flow.'
                }
                actionLabel="Add Button"
                lockedModuleKey="button_group"
                compact={compact}
                returnTo={returnTo}
            />
        </div>
    );
}
