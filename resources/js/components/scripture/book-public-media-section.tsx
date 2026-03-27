import { AdminModuleHost } from '@/admin/modules/shared';
import { createBookMediaSlotsSurface } from '@/admin/modules/books/surface-builders';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ScriptureAdminRegionConfig } from '@/types';
import { getBookMediaSlotMeta } from '@/lib/book-media-slot-meta';
import type {
    ScriptureBook,
    ScriptureBookAdmin,
    ScriptureBookMediaSlot,
} from '@/types/scripture';
import { BookOverviewVideoDisclosure } from './book-overview-video-disclosure';
import { ScriptureSection } from './scripture-section';

type Props = {
    book: ScriptureBook;
    admin?: ScriptureBookAdmin | null;
    isAdmin?: boolean;
};

const PANEL_CLASS_NAME =
    'flex flex-wrap items-center gap-2 rounded-2xl border border-border/70 bg-muted/20 p-3';

function BookMediaSlotCard({ slot }: { slot: ScriptureBookMediaSlot }) {
    const mediaUrl = slot.media.url ?? slot.media.path;
    const slotLabel = getBookMediaSlotMeta(slot.role).label;

    if (!mediaUrl) {
        return null;
    }

    return (
        <Card>
            <CardHeader className="gap-3">
                <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline">{slotLabel}</Badge>
                    <Badge variant="secondary">{slot.media.media_type}</Badge>
                </div>
                {(slot.title ?? slot.media.title) && (
                    <CardTitle>{slot.title ?? slot.media.title}</CardTitle>
                )}
            </CardHeader>
            <CardContent className="space-y-4">
                {slot.media.media_type === 'video' ? (
                    <video
                        controls
                        preload="none"
                        className="aspect-video w-full rounded-lg border bg-black"
                        poster={slot.media.poster_url ?? undefined}
                        src={mediaUrl}
                    />
                ) : slot.media.media_type === 'image' ? (
                    <img
                        src={mediaUrl}
                        alt={
                            slot.media.alt_text ??
                            slot.title ??
                            slot.media.title ??
                            slotLabel
                        }
                        className="w-full rounded-lg border object-cover"
                    />
                ) : (
                    <Button asChild variant="outline" size="sm">
                        <a href={mediaUrl} target="_blank" rel="noreferrer">
                            Open Media
                        </a>
                    </Button>
                )}

                {(slot.caption ?? slot.media.caption) && (
                    <p className="text-sm leading-6 text-muted-foreground">
                        {slot.caption ?? slot.media.caption}
                    </p>
                )}
            </CardContent>
        </Card>
    );
}

export function BookPublicMediaSection({ book, admin, isAdmin = false }: Props) {
    const { overview_video, hero_media, supporting_media } = book.media_slots;
    const hasMedia =
        overview_video !== null ||
        hero_media !== null ||
        supporting_media.length > 0;
    const mediaAdminConfig: ScriptureAdminRegionConfig | null = !isAdmin && admin
        ? {
              supportsEdit: false,
              supportsFullEdit: true,
              editTarget: 'content_block',
              fullEditHref: `${admin.full_edit_href}#media-slots`,
          }
        : null;
    const mediaSurface =
        isAdmin &&
        admin?.media_assignment_store_href &&
        admin.media_assignments &&
        admin.available_media &&
        admin.next_media_assignment_sort_order !== undefined
            ? createBookMediaSlotsSurface({
                  book,
                  storeHref: admin.media_assignment_store_href,
                  fullEditHref: `${admin.full_edit_href}#media-slots`,
                  assignments: admin.media_assignments,
                  availableMedia: admin.available_media,
                  nextSortOrder: admin.next_media_assignment_sort_order,
              })
            : null;

    if (!hasMedia) {
        return null;
    }

    return (
        <ScriptureSection
            title="Book Media"
            description="Published book-level media rendered from registered Book media slots."
            entityMeta={{
                entityType: 'book',
                entityId: book.id,
                entityLabel: book.title,
                region: 'book_media_slots',
                capabilityHint: 'media',
            }}
            adminSurface={{
                config: mediaAdminConfig,
                label: 'Media slots',
                highlight: false,
            }}
        >
            <div className="space-y-4">
                {mediaSurface && (
                    <AdminModuleHost
                        surface={mediaSurface}
                        className={PANEL_CLASS_NAME}
                    />
                )}

                {overview_video && (
                    <BookOverviewVideoDisclosure slot={overview_video} />
                )}
                {hero_media && <BookMediaSlotCard slot={hero_media} />}
                {supporting_media.map((slot, index) => (
                    <BookMediaSlotCard
                        key={`${slot.role}-${slot.media.id ?? index}`}
                        slot={slot}
                    />
                ))}
            </div>
        </ScriptureSection>
    );
}
