import { AdminModuleHost } from '@/admin/modules/shared';
import {
    createVerseBlockRegionSurface,
    createVerseNoteBlockActionsSurface,
    createVerseNoteBlockSurface,
} from '@/admin/modules/verses/surface-builders';
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
    isAdmin: boolean;
    admin?: ScriptureVerseAdmin | null;
};

const PANEL_CLASS_NAME =
    'flex flex-wrap items-center gap-2 rounded-2xl border border-border/70 bg-muted/20 p-3';

export function ScriptureVerseContentBlockRegion({
    verse,
    verseTitle,
    blocks,
    isAdmin,
    admin,
}: Props) {
    if (blocks.length === 0 && (!isAdmin || !admin)) {
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
        isAdmin && admin
            ? createVerseBlockRegionSurface({
                  verse,
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
                            isAdmin && admin && updateHref
                                ? createVerseNoteBlockSurface({
                                      verse,
                                      entityLabel: verseTitle,
                                      block,
                                      updateHref,
                                      fullEditHref: `${admin.full_edit_href}#block-${block.id}`,
                                  })
                                : null;
                        const actionsSurface =
                            isAdmin && admin && updateHref
                                ? createVerseNoteBlockActionsSurface({
                                      verse,
                                      block,
                                      fullEditHref: `${admin.full_edit_href}#block-${block.id}`,
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
                                    <div className="space-y-2 rounded-2xl border border-border/70 bg-muted/20 p-3">
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
