import { useState } from 'react';
import { ScriptureAdminRegionToolbar } from '@/components/scripture/scripture-admin-region-toolbar';
import { ScriptureAdminVisibilityToggle } from '@/components/scripture/scripture-admin-visibility-toggle';
import { ScriptureContentBlocksSection } from '@/components/scripture/scripture-content-blocks-section';
import { ScriptureCopySection } from '@/components/scripture/scripture-copy-section';
import { ScripturePageIntroCard } from '@/components/scripture/scripture-page-intro-card';
import { ScriptureRelatedVersesSection } from '@/components/scripture/scripture-related-verses-section';
import { ScriptureTopicAdminEditSheet } from '@/components/scripture/scripture-topic-admin-edit-sheet';
import type { ScriptureTopicAdminEditSession } from '@/components/scripture/scripture-topic-admin-edit-sheet';
import { Badge } from '@/components/ui/badge';
import ScriptureLayout from '@/layouts/scripture-layout';
import type {
    BreadcrumbItem,
    ScriptureAdminRegionConfig,
    ScriptureContentBlock,
    ScriptureEntityRegionMeta,
    TopicShowProps,
} from '@/types';

export default function TopicShow({
    topic,
    related_verses,
    content_blocks,
    admin,
}: TopicShowProps) {
    const [editSession, setEditSession] =
        useState<ScriptureTopicAdminEditSession | null>(null);
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Topics',
            href: '/topics',
        },
        {
            title: topic.name,
            href: topic.href,
        },
    ];
    const topicEntity = {
        entityType: 'topic' as const,
        entityId: topic.id,
        entityLabel: topic.name,
    };
    const topicDetailsConfig: ScriptureAdminRegionConfig | null = admin
        ? {
              supportsEdit: true,
              supportsFullEdit: true,
              editTarget: 'entity_details',
              contextualEditHref: admin.details_update_href,
              fullEditHref: `${admin.full_edit_href}#details-editor`,
          }
        : null;
    const openTopicDetailsEditor = (
        meta: ScriptureEntityRegionMeta,
        config: ScriptureAdminRegionConfig,
    ) => {
        if (!config.contextualEditHref) {
            return;
        }

        setEditSession({
            kind: 'entity_details',
            meta,
            updateHref: config.contextualEditHref,
            fullEditHref: config.fullEditHref ?? admin?.full_edit_href ?? '#',
            topicName: topic.name,
            topicDescription: topic.description,
            values: {
                description: topic.description ?? '',
            },
        });
    };
    const getContentBlockConfig = (
        block: ScriptureContentBlock,
    ): ScriptureAdminRegionConfig | null => {
        const updateHref = admin?.content_block_update_hrefs[String(block.id)];

        if (!updateHref || !admin) {
            return null;
        }

        return {
            supportsEdit: true,
            supportsFullEdit: true,
            editTarget: 'content_block',
            contextualEditHref: updateHref,
            fullEditHref: `${admin.full_edit_href}#block-${block.id}`,
        };
    };
    const openContentBlockEditor = (
        meta: ScriptureEntityRegionMeta,
        block: ScriptureContentBlock,
        config: ScriptureAdminRegionConfig,
    ) => {
        if (!config.contextualEditHref) {
            return;
        }

        setEditSession({
            kind: 'content_block',
            meta,
            updateHref: config.contextualEditHref,
            fullEditHref: config.fullEditHref ?? admin?.full_edit_href ?? '#',
            topicName: topic.name,
            topicDescription: topic.description,
            block,
            values: {
                title: block.title ?? '',
                body: block.body ?? '',
                region: block.region,
                sort_order: block.sort_order,
                status: 'published',
            },
        });
    };

    return (
        <ScriptureLayout title={topic.name} breadcrumbs={breadcrumbs}>
            <ScripturePageIntroCard
                entityMeta={{
                    ...topicEntity,
                    region: 'page_intro',
                    capabilityHint: 'intro',
                }}
                badges={<Badge variant="outline">Topic</Badge>}
                title={topic.name}
                headerAction={
                    <>
                        <ScriptureAdminVisibilityToggle />
                        {topicDetailsConfig && (
                            <ScriptureAdminRegionToolbar
                                config={topicDetailsConfig}
                                onEdit={openTopicDetailsEditor}
                            />
                        )}
                    </>
                }
            />

            <ScriptureCopySection
                title="Description"
                description="Public overview text attached directly to this topic."
                body={topic.description}
                preserveWhitespace
                action={
                    topicDetailsConfig && (
                        <ScriptureAdminRegionToolbar
                            config={topicDetailsConfig}
                            onEdit={openTopicDetailsEditor}
                        />
                    )
                }
                entityMeta={{
                    ...topicEntity,
                    region: 'description',
                    capabilityHint: 'copy',
                }}
            />

            <ScriptureContentBlocksSection
                title="Topic Content"
                description="Published editorial blocks attached to this topic."
                blocks={content_blocks}
                renderBlockHeaderAction={(block) => {
                    const config = getContentBlockConfig(block);

                    if (config === null) {
                        return null;
                    }

                    return (
                        <ScriptureAdminRegionToolbar
                            config={config}
                            onEdit={(meta, regionConfig) =>
                                openContentBlockEditor(
                                    meta,
                                    block,
                                    regionConfig,
                                )
                            }
                        />
                    );
                }}
                entityMeta={{
                    ...topicEntity,
                    region: 'content_blocks',
                    capabilityHint: 'content_blocks',
                }}
            />

            <ScriptureRelatedVersesSection
                verses={related_verses}
                description="Verses associated with this topic in the public study data."
                emptyDescription="This topic is public, but no verse assignments are currently available for it."
                entityMeta={{
                    ...topicEntity,
                    region: 'related_verses',
                    capabilityHint: 'relationships',
                }}
            />

            <ScriptureTopicAdminEditSheet
                session={editSession}
                onOpenChange={(open) => {
                    if (!open) {
                        setEditSession(null);
                    }
                }}
            />
        </ScriptureLayout>
    );
}
