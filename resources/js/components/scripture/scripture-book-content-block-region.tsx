import type { ReactNode } from 'react';
import { AdminModuleHost } from '@/admin/core/AdminModuleHost';
import {
    createBookBlockRegionSurface,
    createBookContentBlockActionsSurface,
    createBookContentBlockSurface,
} from '@/admin/surfaces/scripture/books/surface-builders';
import { scriptureInlineRegionLabel } from '@/lib/scripture-inline-admin';
import type {
    ScriptureBook,
    ScriptureBookAdmin,
    ScriptureContentBlock,
} from '@/types';
import { Badge } from '@/components/ui/badge';
import { ContentBlockRenderer } from './content-block-renderer';
import { ScriptureSection } from './scripture-section';

type Props = {
    book: ScriptureBook;
    blocks: ScriptureContentBlock[];
    isAdmin: boolean;
    admin?: ScriptureBookAdmin | null;
    title?: string;
    description?: string;
    emptyState?: ReactNode;
};

const PANEL_CLASS_NAME =
    'flex flex-wrap items-center gap-2 rounded-2xl border border-border/70 bg-muted/20 p-3';

export function ScriptureBookContentBlockRegion({
    book,
    blocks,
    isAdmin,
    admin,
    title = 'Reading Notes',
    description = 'Published study content attached to this book.',
    emptyState,
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
            ? createBookBlockRegionSurface({
                  book,
                  entityLabel: book.title,
                  blocks,
                  storeHref: admin.content_block_store_href,
                  fullEditHref: admin.full_edit_href,
                  defaultRegion: admin.content_block_default_region,
                  blockTypes: admin.content_block_types,
              })
            : null;

    return (
        <ScriptureSection
            id="reading-notes"
            entityMeta={{
                entityType: 'book',
                entityId: book.id,
                entityLabel: book.title,
                region: 'content_blocks',
                capabilityHint: 'content_blocks',
            }}
            title={title}
            description={description}
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
                    emptyState ?? (
                        <div className="rounded-2xl border border-dashed border-border/80 bg-muted/20 px-5 py-5 text-sm leading-6 text-muted-foreground sm:px-6 sm:py-6">
                            Published content blocks have not been added to
                            this book yet.
                        </div>
                    )
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
                                ? createBookContentBlockSurface({
                                      book,
                                      entityLabel: book.title,
                                      block,
                                      updateHref,
                                      fullEditHref: admin.full_edit_href,
                                  })
                                : null;
                        const actionsSurface =
                            isAdmin && admin && updateHref
                                ? createBookContentBlockActionsSurface({
                                      book,
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

