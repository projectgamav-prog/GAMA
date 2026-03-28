import { AdminModuleHost } from '@/admin/core/AdminModuleHost';
import { resolveBookMediaSurface } from '@/admin/integrations/scripture/books';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    isAdmin: boolean;
    admin?: ScriptureBookAdmin | null;
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

export function BookPublicMediaSection({ book, admin, isAdmin }: Props) {
    const { overview_video, hero_media, supporting_media } = book.media_slots;
    const hasMedia =
        overview_video !== null ||
        hero_media !== null ||
        supporting_media.length > 0;
    const mediaSurface = resolveBookMediaSurface({
        book,
        admin,
        enabled: isAdmin,
    });

    if (!hasMedia && !mediaSurface) {
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
        >
            <div className="space-y-4">
                {mediaSurface && (
                    <AdminModuleHost
                        surface={mediaSurface}
                        className={PANEL_CLASS_NAME}
                    />
                )}

                {!hasMedia && mediaSurface && (
                    <div className="rounded-2xl border border-dashed border-border/80 bg-muted/20 px-5 py-5 text-sm leading-6 text-muted-foreground sm:px-6 sm:py-6">
                        No published media slots are assigned to this book yet.
                        The semantic media surface still stays available for
                        admins because this book can manage media assignments.
                    </div>
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

