import { useState } from 'react';
import type { ScriptureAdminSurfaceOptions } from '@/components/scripture/scripture-admin-surface';
import type { ScriptureBook, ScriptureEntityRegionMeta } from '@/types';
import type { ScriptureBookAdminEditSession } from '@/lib/book-admin-edit-session';
import { createScriptureAdminSurfaceCapability } from '@/lib/scripture-admin-capabilities';
import { isSameScriptureRegionMeta } from '@/lib/scripture-inline-admin';
import { useScriptureAdminFeedback } from '@/hooks/use-scripture-admin-feedback';

type BookLibraryAdminSessionContext = Pick<
    ScriptureBook,
    'id' | 'title' | 'description' | 'admin'
>;

type Props = {
    books: BookLibraryAdminSessionContext[];
};

/**
 * Coordinates capability-driven book-card editing on the public scripture
 * library page. The library only exposes safe book-level detail editing, so it
 * can reuse the existing inline book intro editor without introducing new CMS
 * structures.
 */
export function useBookLibraryAdminSession({ books }: Props) {
    const [editSession, setEditSession] =
        useState<ScriptureBookAdminEditSession | null>(null);
    const { feedbackFor, showFeedback, clearFeedback } =
        useScriptureAdminFeedback();
    const feedbackKey = (bookId: number) => `book_card:${bookId}`;

    const closeEditSession = () => {
        setEditSession(null);
    };

    const openBookCardEditor = (book: BookLibraryAdminSessionContext) => {
        if (!book.admin?.details_update_href) {
            return;
        }

        const meta: ScriptureEntityRegionMeta = {
            entityType: 'book',
            entityId: String(book.id),
            entityLabel: book.title,
            region: 'browse_card',
            capabilityHint: 'intro',
        };

        clearFeedback(feedbackKey(book.id));
        setEditSession({
            kind: 'entity_details',
            meta,
            updateHref: book.admin.details_update_href,
            fullEditHref: `${book.admin.full_edit_href}#details-editor`,
            bookTitle: book.title,
            bookDescription: book.description ?? null,
            values: {
                description: book.description ?? '',
            },
        });
    };

    const getBookCardSurface = (
        book: BookLibraryAdminSessionContext,
    ): ScriptureAdminSurfaceOptions | null => {
        const config = book.admin?.details_update_href
            ? {
                  supportsEdit: true,
                  supportsFullEdit: true,
                  editTarget: 'entity_details' as const,
                  contextualEditHref: book.admin.details_update_href,
                  fullEditHref: `${book.admin.full_edit_href}#details-editor`,
              }
            : book.admin?.full_edit_href
              ? {
                    supportsEdit: false,
                    supportsFullEdit: true,
                    editTarget: 'entity_details' as const,
                    fullEditHref: `${book.admin.full_edit_href}#details-editor`,
                }
              : null;

        const meta: ScriptureEntityRegionMeta = {
            entityType: 'book',
            entityId: String(book.id),
            entityLabel: book.title,
            region: 'browse_card',
            capabilityHint: 'intro',
        };

        return createScriptureAdminSurfaceCapability({
            config,
            onEdit: () => openBookCardEditor(book),
            label: 'Book summary',
            isActive:
                editSession?.kind === 'entity_details' &&
                isSameScriptureRegionMeta(editSession.meta, meta),
            statusLabel: feedbackFor(feedbackKey(book.id))?.label,
            statusTone: feedbackFor(feedbackKey(book.id))?.tone,
        });
    };

    const getInlineBookCardSession = (bookId: number) =>
        editSession?.kind === 'entity_details' &&
        editSession.meta.region === 'browse_card' &&
        editSession.meta.entityId === String(bookId)
            ? editSession
            : null;

    const handleBookCardSaveSuccess = (bookId: number) =>
        showFeedback(feedbackKey(bookId), 'Saved');

    return {
        closeEditSession,
        getBookCardSurface,
        getInlineBookCardSession,
        handleBookCardSaveSuccess,
    };
}
