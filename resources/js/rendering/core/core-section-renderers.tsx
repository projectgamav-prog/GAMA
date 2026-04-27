import { Link } from '@inertiajs/react';
import { useMemo } from 'react';
import type { ReactNode } from 'react';
import {
    createEntityContextFromSurface,
    useRegisterAdminAddAnchor,
    useRegisterAdminOrderGroup,
    useRegisterAdminOrderItem,
} from '@/admin/awareness/core';
import type {
    AdminAddAnchorContext,
    AdminOrderingContext,
    AdminOrderItemPositionContext,
} from '@/admin/awareness/core';
import {
    ChronicleCompactList,
    ChroniclePaperPanel,
} from '@/components/site/chronicle-primitives';
import { ContentBlockRenderer } from '@/components/scripture/content-block-renderer';
import { ScriptureIntroBlock } from '@/components/scripture/scripture-intro-block';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { UniversalSectionDescriptor } from './descriptor-types';
import type { UniversalRenderContext } from './render-context';
import {
    registerUniversalSectionRenderer,
    hasUniversalSectionRenderer,
    resolveUniversalSectionRenderer,
} from './renderer-registry';
import type { UniversalSectionRendererDefinition } from './renderer-types';
import type {
    UniversalActionDescriptor,
    UniversalActionPanelContent,
    UniversalCompactListContent,
    UniversalContentBlockItem,
    UniversalContentBlocksContent,
    UniversalIntroTextContent,
    UniversalPanelContent,
    UniversalPaperPanelContent,
    UniversalTemporaryPanelContent,
} from './section-content-types';

function renderAction(action: ReactNode | UniversalActionDescriptor) {
    if (
        typeof action !== 'object' ||
        action === null ||
        !('href' in action) ||
        !('label' in action)
    ) {
        return action;
    }

    const Icon = action.icon;

    if (action.variant === 'link') {
        return (
            <Link href={action.href} className="chronicle-link text-xs">
                {action.label}
            </Link>
        );
    }

    return (
        <Button
            asChild
            variant={action.variant === 'primary' ? 'default' : 'outline'}
            className={cn(
                'rounded-sm',
                action.variant === 'primary'
                    ? 'chronicle-button'
                    : 'chronicle-button-outline',
            )}
        >
            <Link href={action.href}>
                {action.label}
                {Icon && <Icon className="size-4" />}
            </Link>
        </Button>
    );
}

function PanelHeader({
    content,
}: {
    content: UniversalPanelContent;
}) {
    if (!content.title && !content.eyebrow && !content.action) {
        return null;
    }

    const Icon = content.icon;

    return (
        <div
            className={cn(
                content.action &&
                    'flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between',
            )}
        >
            <div>
                {content.eyebrow && (
                    <p className="chronicle-kicker">{content.eyebrow}</p>
                )}
                {content.title && (
                    <div className="chronicle-title text-2xl leading-tight">
                        {Icon ? (
                            <span className="flex items-center gap-2">
                                <Icon className="size-5 text-[color:var(--chronicle-gold)]" />
                                {content.title}
                            </span>
                        ) : (
                            content.title
                        )}
                    </div>
                )}
            </div>
            {content.action && (
                <div className="shrink-0">{renderAction(content.action)}</div>
            )}
        </div>
    );
}

function PaperPanelRenderer({
    section,
}: {
    section: UniversalSectionDescriptor<UniversalPaperPanelContent>;
}) {
    const content = section.content;

    return (
        <ChroniclePaperPanel
            variant={section.layout?.panel === 'feature' ? 'feature' : 'paper'}
            className={cn('p-5', section.layout?.className)}
        >
            <div className="space-y-3">
                <PanelHeader content={content} />
                {content.description && (
                    <p className="text-sm leading-6 text-[color:var(--chronicle-brown)]">
                        {content.description}
                    </p>
                )}
                {content.body && (
                    <div className="text-sm leading-6 text-[color:var(--chronicle-ink)]">
                        {content.body}
                    </div>
                )}
                {content.children}
            </div>
        </ChroniclePaperPanel>
    );
}

function CompactListRenderer({
    section,
}: {
    section: UniversalSectionDescriptor<UniversalCompactListContent>;
}) {
    const content = section.content;

    return (
        <ChroniclePaperPanel className={cn('p-5', section.layout?.className)}>
            <div className="space-y-3">
                <PanelHeader content={content} />
                {content.description && (
                    <p className="text-sm leading-6 text-[color:var(--chronicle-brown)]">
                        {content.description}
                    </p>
                )}
                <ChronicleCompactList items={content.items} />
            </div>
        </ChroniclePaperPanel>
    );
}

function ActionPanelRenderer({
    section,
}: {
    section: UniversalSectionDescriptor<UniversalActionPanelContent>;
}) {
    const content = section.content;

    return (
        <ChroniclePaperPanel className={cn('p-5', section.layout?.className)}>
            <div className="space-y-4">
                <PanelHeader content={content} />
                {content.description && (
                    <p className="text-sm leading-6 text-[color:var(--chronicle-brown)]">
                        {content.description}
                    </p>
                )}
                <div className="flex flex-col gap-2">
                    {content.actions.map((action, index) => (
                        <div key={`${String(action.label)}-${index}`}>
                            {renderAction(action)}
                        </div>
                    ))}
                </div>
            </div>
        </ChroniclePaperPanel>
    );
}

function TemporaryPanelRenderer({
    section,
}: {
    section: UniversalSectionDescriptor<UniversalTemporaryPanelContent>;
}) {
    const content = section.content;

    return (
        <ChroniclePaperPanel className={cn('p-5', section.layout?.className)}>
            <div className="space-y-3">
                <PanelHeader content={content} />
                {content.marker && (
                    <span className="inline-flex rounded-full bg-[color:var(--chronicle-paper-soft)] px-2 py-0.5 text-xs text-[color:var(--chronicle-brown)]">
                        {content.marker}
                    </span>
                )}
                {content.description && (
                    <p className="text-sm leading-6 text-[color:var(--chronicle-brown)]">
                        {content.description}
                    </p>
                )}
                {content.body && (
                    <div className="text-sm leading-6 text-[color:var(--chronicle-ink)]">
                        {content.body}
                    </div>
                )}
                {content.items && <ChronicleCompactList items={content.items} />}
            </div>
        </ChroniclePaperPanel>
    );
}

function SupportRailGroupRenderer({
    section,
    renderContext,
}: {
    section: UniversalSectionDescriptor;
    renderContext: UniversalRenderContext;
}) {
    return (
        <div className={cn('space-y-4', section.layout?.className)}>
            {(section.children ?? []).map((child) => (
                <UniversalSectionRendererBridge
                    key={child.id}
                    section={child}
                    renderContext={renderContext}
                />
            ))}
        </div>
    );
}

function IntroTextRenderer({
    section,
}: {
    section: UniversalSectionDescriptor<UniversalIntroTextContent>;
}) {
    const content = section.content;

    return (
        <ScriptureIntroBlock
            label={content.label}
            block={content.block}
            adminSurface={content.adminSurface ?? section.surface ?? null}
            variant={content.variant}
            className={cn(content.className, section.layout?.className)}
        />
    );
}

function ContentBlockItemRenderer({
    section,
}: {
    section: UniversalSectionDescriptor<UniversalContentBlockItem>;
}) {
    const content = section.content;

    return (
        <ContentBlockRenderer
            block={content.block}
            adminSurface={content.adminSurface ?? section.surface ?? null}
            ordering={content.ordering ?? null}
            headerAction={content.headerAction}
            inlineEditor={content.inlineEditor}
        />
    );
}

function ContentBlockOrderingItem({
    groupKey,
    index,
    item,
    totalItems,
}: {
    groupKey: string;
    index: number;
    item: UniversalContentBlockItem;
    totalItems: number;
}) {
    const itemKey = `${groupKey}:item:${item.block.id}`;
    const isFirst = index === 0;
    const isLast = index === totalItems - 1;
    const canDelete = item.adminSurface?.capabilities.includes('delete') ?? false;
    const ordering = useMemo<AdminOrderingContext>(
        () => ({
            orderGroupKey: groupKey,
            orderFamily: 'block',
            index,
            isFirst,
            isLast,
            canReorder: false,
        }),
        [groupKey, index, isFirst, isLast],
    );
    const itemPosition = useMemo<AdminOrderItemPositionContext>(
        () => ({
            orderGroupKey: groupKey,
            itemKey,
            itemType: item.block.block_type,
            itemId: item.block.id,
            index,
            isFirst,
            isLast,
            canMoveEarlier: false,
            canMoveLater: false,
            canDelete,
        }),
        [
            canDelete,
            groupKey,
            index,
            isFirst,
            isLast,
            item.block.block_type,
            item.block.id,
            itemKey,
        ],
    );
    const beforeAnchor = useMemo<AdminAddAnchorContext>(
        () => ({
            anchorKey: `${groupKey}:anchor:before:${item.block.id}`,
            orderGroupKey: groupKey,
            anchorType: 'add_before',
            beforeItemKey: itemKey,
            allowedContentTypes: [],
            preferredPlacement: 'between-items',
            canCreate: false,
            disabledReason:
                'No create action metadata emitted for this block stack.',
        }),
        [groupKey, item.block.id, itemKey],
    );
    const afterAnchor = useMemo<AdminAddAnchorContext>(
        () => ({
            anchorKey: `${groupKey}:anchor:after:${item.block.id}`,
            orderGroupKey: groupKey,
            anchorType: 'add_after',
            afterItemKey: itemKey,
            allowedContentTypes: [],
            preferredPlacement: isLast ? 'bottom-edge' : 'between-items',
            canCreate: false,
            disabledReason:
                'No create action metadata emitted for this block stack.',
        }),
        [groupKey, isLast, item.block.id, itemKey],
    );

    useRegisterAdminOrderItem(itemPosition, [itemPosition]);
    useRegisterAdminAddAnchor(beforeAnchor, [beforeAnchor]);
    useRegisterAdminAddAnchor(afterAnchor, [afterAnchor]);

    return (
        <ContentBlockRenderer
            block={item.block}
            adminSurface={item.adminSurface ?? null}
            ordering={ordering}
            headerAction={item.headerAction}
            inlineEditor={item.inlineEditor}
        />
    );
}

function ContentBlocksRenderer({
    section,
}: {
    section: UniversalSectionDescriptor<UniversalContentBlocksContent>;
}) {
    const content = section.content;

    if (content.blocks.length === 0) {
        return null;
    }

    const orderGroupKey = `content-blocks:${section.id}`;
    const acceptedContentTypes = useMemo(
        () =>
            Array.from(
                new Set(content.blocks.map((item) => item.block.block_type)),
            ),
        [content.blocks],
    );
    const owner = useMemo(
        () =>
            section.surface
                ? createEntityContextFromSurface(section.surface)
                : null,
        [section.surface],
    );
    const canDelete = content.blocks.some(
        (item) => item.adminSurface?.capabilities.includes('delete') ?? false,
    );
    const orderGroup = useMemo(
        () => ({
            orderGroupKey,
            orderFamily: 'block' as const,
            owner,
            itemType: 'content_block',
            sortField: 'sort_order',
            totalItemCount: content.blocks.length,
            canReorder: false,
            canCreate: false,
            canDelete,
            protectedReason:
                'Content block ordering is observed in shadow mode until explicit mutation metadata is registered.',
            acceptedContentTypes,
        }),
        [
            acceptedContentTypes,
            canDelete,
            content.blocks.length,
            orderGroupKey,
            owner,
        ],
    );

    useRegisterAdminOrderGroup(orderGroup, [orderGroup]);

    return (
        <div className={cn('space-y-4', content.className, section.layout?.className)}>
            {content.blocks.map((item, index) => (
                <ContentBlockOrderingItem
                    key={item.block.id}
                    groupKey={orderGroupKey}
                    index={index}
                    item={{
                        ...item,
                        adminSurface: item.adminSurface ?? section.surface ?? null,
                    }}
                    totalItems={content.blocks.length}
                />
            ))}
        </div>
    );
}

function UniversalSectionRendererBridge({
    section,
    renderContext,
}: {
    section: UniversalSectionDescriptor;
    renderContext: UniversalRenderContext;
}) {
    const Renderer = resolveUniversalSectionRenderer(section.renderer);

    if (!Renderer) {
        return null;
    }

    return (
        <Renderer
            section={section}
            renderContext={renderContext}
            surfaceContext={{
                surface: section.surface ?? null,
                owner: section.surface?.owner ?? null,
            }}
        />
    );
}

const coreSectionRenderers = [
    {
        key: 'paper_panel',
        Renderer: PaperPanelRenderer,
        description: 'Generic chronicle paper panel section.',
    },
    {
        key: 'compact_list',
        Renderer: CompactListRenderer,
        description: 'Generic chronicle compact-list panel section.',
    },
    {
        key: 'action_panel',
        Renderer: ActionPanelRenderer,
        description: 'Generic action panel with chronicle buttons.',
    },
    {
        key: 'temporary_panel',
        Renderer: TemporaryPanelRenderer,
        description: 'Generic temporary/support placeholder panel.',
    },
    {
        key: 'support_rail_group',
        Renderer: SupportRailGroupRenderer,
        description: 'Groups support rail sections without page-specific logic.',
    },
    {
        key: 'intro_text',
        Renderer: IntroTextRenderer,
        description: 'Renders an intro block through the shared intro component.',
    },
    {
        key: 'content_block_item',
        Renderer: ContentBlockItemRenderer,
        description: 'Renders one content block through the shared content block component.',
    },
    {
        key: 'content_blocks',
        Renderer: ContentBlocksRenderer,
        description: 'Renders a stack of content blocks through shared block renderers.',
    },
] satisfies readonly UniversalSectionRendererDefinition<any>[];

export function ensureCoreSectionRenderersRegistered(): void {
    coreSectionRenderers.forEach((renderer) => {
        if (!hasUniversalSectionRenderer(renderer.key)) {
            registerUniversalSectionRenderer(
                renderer as UniversalSectionRendererDefinition<any>,
            );
        }
    });
}
