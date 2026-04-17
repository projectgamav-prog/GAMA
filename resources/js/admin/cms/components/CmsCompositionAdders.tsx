import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type {
    CmsContainerType,
    CmsInsertionMode,
    CmsModuleCategory,
    CmsModuleKey,
} from '@/types';
import { CmsModuleEditor } from './CmsModuleEditor';
import { CmsAddLauncherCard } from './adders/CmsAddLauncherCard';
import {
    CategoryStep,
    CmsLockedModuleNotice,
    ContainerTypeStep,
    ModuleStep,
    StepHeader,
} from './adders/CmsAddFlowSteps';
import { CmsAddSubmitFooter } from './adders/CmsAddSubmitFooter';
import {
    type BlockFormData,
    type ContainerInsertFormData,
    buildBlockInsertFormData,
    buildContainerInsertFormData,
    defaultModuleKey,
    modulePayloadFromForm,
    resetModuleFormData,
} from './adders/cms-add-flow';

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
    const form = useForm<ContainerInsertFormData>(
        buildContainerInsertFormData({
            insertionMode,
            relativeContainerId,
            returnTo,
            moduleKey: lockedModuleKey ?? defaultModuleKey,
        }),
    );
    const [selectedType, setSelectedType] = useState<CmsContainerType | null>(
        null,
    );
    const [selectedCategory, setSelectedCategory] =
        useState<CmsModuleCategory | null>(
            lockedModuleKey ? null : 'text',
        );

    const setModuleKey = (moduleKey: CmsModuleKey) => {
        form.setData(resetModuleFormData(form.data, moduleKey));
    };

    return (
        <CmsAddLauncherCard
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
                        <CmsLockedModuleNotice message="This path creates a new container and seeds it with a button group immediately." />
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

                    <CmsAddSubmitFooter
                        actionHref={actionHref}
                        processing={form.processing}
                        submitLabel={
                            lockedModuleKey === 'button_group'
                                ? 'Create button container'
                                : 'Create container'
                        }
                        readyMessage="The container is created first, then its first block is seeded from the flow you chose."
                        unavailableMessage="This region experiment is mounted through the universal CMS layer, but persistence outside CMS pages is not wired yet."
                    />
                </form>
            )}
        </CmsAddLauncherCard>
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
    const form = useForm<BlockFormData>(
        buildBlockInsertFormData({
            insertionMode,
            relativeBlockId,
            returnTo,
            moduleKey: lockedModuleKey ?? defaultModuleKey,
        }),
    );
    const [selectedCategory, setSelectedCategory] =
        useState<CmsModuleCategory | null>(
            lockedModuleKey ? null : 'text',
        );

    const setModuleKey = (moduleKey: CmsModuleKey) => {
        form.setData(resetModuleFormData(form.data, moduleKey));
    };

    return (
        <CmsAddLauncherCard
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
                    <CmsLockedModuleNotice message="This path keeps the content in the current container and adds a button group block directly into it." />
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

                <CmsAddSubmitFooter
                    actionHref={actionHref}
                    processing={form.processing}
                    submitLabel={
                        lockedModuleKey === 'button_group'
                            ? 'Add button group'
                            : 'Add block'
                    }
                    readyMessage="This content stays in the current container rather than creating a new one."
                    unavailableMessage="This universal region experiment is visible here, but persistence is still limited to CMS pages."
                />
            </form>
        </CmsAddLauncherCard>
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
