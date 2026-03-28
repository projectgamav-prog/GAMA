import { AdminModuleHost } from '@/admin/core/AdminModuleHost';
import {
    createRegisteredBlockActionsSurface,
    createRegisteredBlockEditorSurface,
    createRegisteredBlockRegionSurface,
} from '@/admin/surfaces/blocks/surface-builders';
import { VERSE_NOTES_SURFACE_KEY } from '@/admin/surfaces/core/surface-keys';
import { SCRIPTURE_INLINE_ADMIN_PANEL_CLASS_NAME } from '@/components/scripture/scripture-section-group-wrapper';
import { scriptureInlineRegionLabel } from '@/lib/scripture-inline-admin';
import type {
    ScriptureContentBlock,
    ScriptureVerse,
    ScriptureVerseAdmin,
} from '@/types';
import { Badge } from '@/components/ui/badge';
import { ContentBlockRenderer } from './content-block-renderer';
import { ScriptureSection } from './scripture-section';

type Props = {
    verse: ScriptureVerse;
    verseTitle: string;
    blocks: ScriptureContentBlock[];
    showAdminControls: boolean;
    admin?: ScriptureVerseAdmin | null;
};

const PANEL_CLASS_NAME = SCRIPTURE_INLINE_ADMIN_PANEL_CLASS_NAME;

export function ScriptureVerseContentBlockRegion({
    verse,
    verseTitle,
    blocks,
    showAdminControls,
    admin,
}: Props) {
    if (blocks.length === 0 && (!showAdminControls || !admin)) {
        return null;
    }

    const totalBlocksByRegion = blocks.reduce<Record<string, number>>(
        (totals, block) => ({
            ...totals,
            [block.region]: (totals[block.region] ?? 0) + 1,
        }),
        {},
    );
    const seenBlocksByRegion = new Map<string, number>();
    const regionSurface =
        showAdminControls && admin
            ? createRegisteredBlockRegionSurface({
                  surfaceKey: VERSE_NOTES_SURFACE_KEY,
                  ownerEntity: 'verse',
                  ownerEntityId: verse.id,
                  entityLabel: verseTitle,
                  blocks,
                  storeHref: admin.content_block_store_href,
                  fullEditHref: admin.full_edit_href,
                  defaultRegion: admin.content_block_default_region,
                  blockTypes: admin.content_block_types,
              })
            : null;

    return (
        <ScriptureSection
            id="published-notes"
            entityMeta={{
                entityType: 'verse',
                entityId: verse.id,
                entityLabel: verseTitle,
                region: 'content_blocks',
                capabilityHint: 'content_blocks',
            }}
            title="Published Notes"
            description="Published content blocks attached directly to this verse."
            action={
                <Badge variant="outline">
                    {blocks.length} block{blocks.length === 1 ? '' : 's'}
                </Badge>
            }
        >
            <div className="space-y-4">
                {regionSurface && (
                    <AdminModuleHost
                        surface={regionSurface}
                        className={PANEL_CLASS_NAME}
                    />
                )}

                {blocks.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-border/80 bg-muted/20 px-5 py-5 text-sm leading-6 text-muted-foreground sm:px-6 sm:py-6">
                        Published note blocks have not been added to this verse
                        yet.
                    </div>
                ) : (
                    blocks.map((block) => {
                        const positionInRegion =
                            (seenBlocksByRegion.get(block.region) ?? 0) + 1;
                        seenBlocksByRegion.set(block.region, positionInRegion);
                        const updateHref =
                            admin?.content_block_update_hrefs[String(block.id)] ??
                            null;

                        const editorSurface =
                            showAdminControls && admin && updateHref
                                ? createRegisteredBlockEditorSurface({
                                      surfaceKey: VERSE_NOTES_SURFACE_KEY,
                                      ownerEntity: 'verse',
                                      ownerEntityId: verse.id,
                                      entityLabel: verseTitle,
                                      block,
                                      updateHref,
                                      fullEditHref: admin.full_edit_href,
                                  })
                                : null;
                        const actionsSurface =
                            showAdminControls && admin && updateHref
                                ? createRegisteredBlockActionsSurface({
                                      surfaceKey: VERSE_NOTES_SURFACE_KEY,
                                      ownerEntity: 'verse',
                                      ownerEntityId: verse.id,
                                      block,
                                      fullEditHref: admin.full_edit_href,
                                      moveUpHref:
                                          admin.content_block_move_up_hrefs[
                                              String(block.id)
                                          ],
                                      moveDownHref:
                                          admin.content_block_move_down_hrefs[
                                              String(block.id)
                                          ],
                                      reorderHref:
                                          admin.content_block_reorder_hrefs[
                                              String(block.id)
                                          ],
                                      duplicateHref:
                                          admin.content_block_duplicate_hrefs[
                                              String(block.id)
                                          ],
                                      deleteHref:
                                          admin.content_block_delete_hrefs[
                                              String(block.id)
                                          ],
                                      positionInRegion,
                                      totalInRegion:
                                          totalBlocksByRegion[block.region] ?? 1,
                                      regionLabel: scriptureInlineRegionLabel(
                                          block.region,
                                      ),
                                  })
                                : null;

                        return (
                            <div key={block.id} className="space-y-3">
                                {(editorSurface || actionsSurface) && (
                                    <div className="space-y-2">
                                        {editorSurface && (
                                            <AdminModuleHost
                                                surface={editorSurface}
                                                className="flex flex-wrap items-center gap-2"
                                            />
                                        )}
                                        {actionsSurface && (
                                            <AdminModuleHost
                                                surface={actionsSurface}
                                                className="flex flex-wrap items-center gap-2"
                                            />
                                        )}
                                    </div>
                                )}

                                <ContentBlockRenderer block={block} />
                            </div>
                        );
                    })
                )}
            </div>
        </ScriptureSection>
    );
}

