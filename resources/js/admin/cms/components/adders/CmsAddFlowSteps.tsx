import { ChevronLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { CmsContainerType, CmsModuleCategory, CmsModuleKey } from '@/types';
import { cmsModules } from '../../core/module-registry';

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

export function CategoryStep({
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

export function ModuleStep({
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

export function ContainerTypeStep({
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

export function StepHeader({
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

export function CmsLockedModuleNotice({ message }: { message: string }) {
    return (
        <div className="rounded-2xl border border-border/70 bg-background px-4 py-4">
            <p className="text-sm leading-6 text-muted-foreground">{message}</p>
        </div>
    );
}
