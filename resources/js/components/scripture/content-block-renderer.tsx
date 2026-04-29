import type { ReactNode } from 'react';
import { AdminSchemaFieldDisplay } from '@/admin/core/AdminSchemaFieldDisplay';
import { AdminSurfaceBoundary } from '@/admin/core/AdminSurfaceBoundary';
import { AdminAnchorBoundary } from '@/admin/core/AdminLayoutAnchors';
import {
    AdminSurfaceEmitter,
    createEntityContextFromSurface,
    createSurfaceContextFromContract,
} from '@/admin/awareness/core';
import type { AdminOrderingContext } from '@/admin/awareness/core';
import type { AdminSurfaceContract } from '@/admin/surfaces/core/surface-contracts';
import type { AdminQuickEditPayloadField } from '@/admin/surfaces/core/surface-contracts';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { PublicContentBlock } from '@/types/content-blocks';
import { ScriptureEntityRegion } from './scripture-entity-region';

type Props = {
    block: PublicContentBlock;
    adminSurface?: AdminSurfaceContract | null;
    ordering?: AdminOrderingContext | null;
    headerAction?: ReactNode;
    inlineEditor?: ReactNode;
};

const getDataValue = (
    data: Record<string, unknown> | null,
    key: string,
): string | null => {
    if (!data) {
        return null;
    }

    const value = data[key];

    return typeof value === 'string' && value.length > 0 ? value : null;
};

const schemaFieldUpdateContext = (
    adminSurface: AdminSurfaceContract | null,
    fieldName: 'title' | 'body',
): {
    updateHref: string | null;
    fullEditHref: string | null;
    payloadKey: string | null;
    hiddenPayloadFields: readonly AdminQuickEditPayloadField[];
} => {
    const quickEdit = adminSurface?.quickEdit ?? null;
    const quickEditField = quickEdit?.fields.find(
        (field) => field.name === fieldName || field.payloadKey === fieldName,
    );

    if (!quickEdit || !quickEditField) {
        return {
            updateHref: null,
            fullEditHref: null,
            payloadKey: null,
            hiddenPayloadFields: [],
        };
    }

    const siblingFields = quickEdit.fields
        .filter((field) => field !== quickEditField)
        .map((field) => ({
            name: field.name,
            payloadKey: field.payloadKey,
            value: field.value,
        }));

    return {
        updateHref: quickEdit.updateHref ?? null,
        fullEditHref: quickEdit.fullEditHref ?? null,
        payloadKey: quickEditField.payloadKey ?? null,
        hiddenPayloadFields: [
            ...(quickEdit.payloadFields ?? []),
            ...siblingFields,
        ],
    };
};

export function ContentBlockRenderer({
    block,
    adminSurface = null,
    ordering = null,
    headerAction,
    inlineEditor,
}: Props) {
    const mediaUrl = getDataValue(block.data_json, 'url');
    const altText = getDataValue(block.data_json, 'alt');
    const caption = getDataValue(block.data_json, 'caption');
    const poster = getDataValue(block.data_json, 'poster');
    const titleUpdateContext = schemaFieldUpdateContext(adminSurface, 'title');
    const bodyUpdateContext = schemaFieldUpdateContext(adminSurface, 'body');
    const entityMeta = {
        entityType: 'content_block' as const,
        entityId: block.id,
        entityLabel: block.title ?? block.region,
        region: block.region,
        capabilityHint: 'content_block',
    };

    const hasSchemaFieldOwnedQuickEdit = Boolean(
        titleUpdateContext.updateHref || bodyUpdateContext.updateHref,
    );
    const renderCard = (card: ReactNode) => {
        const anchoredCard = (
            <AdminAnchorBoundary
                level="block"
                anchorKey={`content-block:${block.id}`}
            >
                {card}
            </AdminAnchorBoundary>
        );

        if (!adminSurface) {
            return (
                <ScriptureEntityRegion meta={entityMeta} asChild>
                    {anchoredCard}
                </ScriptureEntityRegion>
            );
        }

        return (
            <ScriptureEntityRegion meta={entityMeta}>
                <AdminSurfaceEmitter
                    manifestKey={`content-block:${block.id}:${adminSurface.regionKey ?? block.region}`}
                    entity={createEntityContextFromSurface(adminSurface)}
                    surface={createSurfaceContextFromContract(adminSurface)}
                    block={{
                        blockId: block.id,
                        blockType: block.block_type,
                        contentKind:
                            block.block_type === 'text'
                                ? 'content_block_text'
                                : block.block_type === 'quote'
                                  ? 'content_block_quote'
                                  : block.block_type,
                        fieldKind:
                            block.block_type === 'image' ||
                            block.block_type === 'video'
                                ? 'media'
                                : 'body',
                    }}
                    layout={{
                        layoutZone:
                            block.block_type === 'image' ||
                            block.block_type === 'video'
                                ? 'media'
                                : 'block',
                        visualRole: 'item',
                        preferredPlacement: 'top-right',
                    }}
                    actionCapabilities={{
                        canQuickEdit: Boolean(adminSurface.quickEdit),
                        canStructuredEdit:
                            adminSurface.capabilities.includes('edit'),
                        canFullEdit:
                            adminSurface.capabilities.includes('full_edit'),
                        canManageMedia:
                            adminSurface.capabilities.includes('manage_media'),
                        canDelete: adminSurface.capabilities.includes('delete'),
                        canCreateInside:
                            adminSurface.capabilities.includes('add_block'),
                        canReorder: ordering?.canReorder ?? false,
                    }}
                    ordering={ordering}
                    quickEdit={{
                        quickEdit: adminSurface.quickEdit ?? null,
                        fullEditFallbackAvailable:
                            Boolean(adminSurface.quickEdit?.fullEditHref),
                    }}
                />
                {hasSchemaFieldOwnedQuickEdit ? (
                    anchoredCard
                ) : (
                    <AdminSurfaceBoundary
                        surface={adminSurface}
                        emptyPlaceholder={
                            <p className="text-sm leading-6 text-[color:var(--chronicle-brown)]">
                                Add content here.
                            </p>
                        }
                    >
                        {anchoredCard}
                    </AdminSurfaceBoundary>
                )}
            </ScriptureEntityRegion>
        );
    };

    const renderTitle = (className?: string) =>
        block.title ? (
            <AdminSchemaFieldDisplay
                entityType="content_block"
                entityId={block.id}
                fieldName="title"
                value={block.title}
                displayValue={block.title}
                updateHref={titleUpdateContext.updateHref}
                fullEditHref={titleUpdateContext.fullEditHref}
                payloadKey={titleUpdateContext.payloadKey}
                hiddenPayloadFields={titleUpdateContext.hiddenPayloadFields}
            >
                <CardTitle className={className}>{block.title}</CardTitle>
            </AdminSchemaFieldDisplay>
        ) : null;

    const renderBody = (
        children: ReactNode,
        className?: string,
        value = block.body,
    ) =>
        value ? (
            <AdminSchemaFieldDisplay
                entityType="content_block"
                entityId={block.id}
                fieldName="body"
                value={value}
                displayValue={value}
                updateHref={bodyUpdateContext.updateHref}
                fullEditHref={bodyUpdateContext.fullEditHref}
                payloadKey={bodyUpdateContext.payloadKey}
                hiddenPayloadFields={bodyUpdateContext.hiddenPayloadFields}
                className={className}
            >
                {children}
            </AdminSchemaFieldDisplay>
        ) : null;

    if (block.block_type === 'quote') {
        return renderCard(
            <Card className="border-l-4 border-l-primary">
                <CardHeader className="gap-3">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex items-center gap-2">
                            <Badge variant="outline">{block.region}</Badge>
                            <Badge variant="secondary">Quote</Badge>
                        </div>
                        {headerAction}
                    </div>
                    {renderTitle()}
                </CardHeader>
                {block.body && (
                    <CardContent>
                        {renderBody(
                            <blockquote className="text-lg leading-8 italic">
                                {block.body}
                            </blockquote>,
                        )}
                    </CardContent>
                )}
            </Card>,
        );
    }

    if (block.block_type === 'image') {
        return renderCard(
            <Card>
                <CardHeader className="gap-3">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex items-center gap-2">
                            <Badge variant="outline">{block.region}</Badge>
                            <Badge variant="secondary">Image</Badge>
                        </div>
                        {headerAction}
                    </div>
                    {renderTitle()}
                </CardHeader>
                <CardContent className="space-y-4">
                    {mediaUrl && (
                        <img
                            src={mediaUrl}
                            alt={altText ?? block.title ?? 'Scripture image'}
                            className="w-full rounded-lg border object-cover"
                        />
                    )}
                    {(block.body ?? caption) && (
                        <>
                            {block.body
                                ? renderBody(
                                      <p className="text-sm leading-6 text-muted-foreground">
                                          {block.body}
                                      </p>,
                                  )
                                : (
                                      <p className="text-sm leading-6 text-muted-foreground">
                                          {caption}
                                      </p>
                                  )}
                        </>
                    )}
                </CardContent>
            </Card>,
        );
    }

    if (block.block_type === 'video') {
        return renderCard(
            <Card>
                <CardHeader className="gap-3">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex items-center gap-2">
                            <Badge variant="outline">{block.region}</Badge>
                            <Badge variant="secondary">Video</Badge>
                        </div>
                        {headerAction}
                    </div>
                    {renderTitle()}
                </CardHeader>
                <CardContent className="space-y-4">
                    {mediaUrl && (
                        <video
                            controls
                            className="w-full rounded-lg border"
                            poster={poster ?? undefined}
                            src={mediaUrl}
                        />
                    )}
                    {block.body &&
                        renderBody(
                            <p className="text-sm leading-6 text-muted-foreground">
                                {block.body}
                            </p>,
                        )}
                </CardContent>
            </Card>,
        );
    }

    return renderCard(
        <Card>
            <CardHeader className="gap-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-center gap-2">
                        <Badge variant="outline">{block.region}</Badge>
                        <Badge variant="secondary">Text</Badge>
                    </div>
                    {headerAction}
                </div>
                {!inlineEditor && renderTitle()}
            </CardHeader>
            {inlineEditor ? (
                <CardContent>
                    {inlineEditor}
                </CardContent>
            ) : block.body ? (
                <CardContent>
                    {renderBody(
                        <p className="leading-7 text-muted-foreground">
                            {block.body}
                        </p>,
                    )}
                </CardContent>
            ) : null}
        </Card>,
    );
}
