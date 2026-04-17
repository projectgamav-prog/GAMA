import { AdminModuleHost } from '@/admin/core/AdminModuleHost';
import { resolveVerseRelationSurfaces } from '@/admin/integrations/scripture/verses';
import { ScriptureSection } from '@/components/scripture/scripture-section';
import {
    CreateVerseContentBlockCard,
    ProtectedVerseContentBlockCard,
    VerseContentBlockEditorCard,
} from '@/components/scripture/verse-admin-content-block-cards';
import { VerseFullEditIntroCard } from '@/components/scripture/verse/VerseFullEditIntroCard';
import { VerseIdentityEditorCard } from '@/components/scripture/verse/VerseIdentityEditorCard';
import { VerseMetaEditorCard } from '@/components/scripture/verse/VerseMetaEditorCard';
import { Badge } from '@/components/ui/badge';
import { useScriptureAdminTargetNavigation } from '@/hooks/use-scripture-admin-target-navigation';
import ScriptureLayout from '@/layouts/scripture-layout';
import { chapterLabel, sectionLabel, verseLabel } from '@/lib/scripture';
import type { BreadcrumbItem, VerseFullEditProps } from '@/types';

export default function VerseFullEdit({
    book,
    book_section,
    chapter,
    chapter_section,
    verse,
    admin_entity,
    characters,
    admin_identity_update_href,
    verse_meta,
    admin_meta_update_href,
    admin_translations,
    admin_commentaries,
    admin_content_block_store_href,
    next_content_block_sort_order,
    admin_content_blocks,
    protected_content_blocks,
}: VerseFullEditProps) {
    const fields = admin_entity.fields;
    const chapterTitle = chapterLabel(chapter.number, chapter.title);
    const bookSectionTitle = sectionLabel(
        book_section.number,
        book_section.title,
    );
    const chapterSectionTitle = sectionLabel(
        chapter_section.number,
        chapter_section.title,
    );
    const verseTitle = verseLabel(verse.number);
    const { translationsSurface, commentariesSurface } =
        resolveVerseRelationSurfaces({
            verse,
            verseTitle,
            translationsAdmin: admin_translations,
            commentariesAdmin: admin_commentaries,
            fullEditHref: null,
        });
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: book.title,
            href: book.href,
        },
        {
            title: bookSectionTitle,
            href: book_section.href,
        },
        {
            title: chapterTitle,
            href: chapter.href,
        },
        {
            title: chapterSectionTitle,
            href: chapter_section.href,
        },
        {
            title: `${verseTitle} Full edit`,
            href: verse.admin_full_edit_href,
        },
    ];
    useScriptureAdminTargetNavigation();

    return (
        <ScriptureLayout
            title={`Full edit - ${verseTitle} - ${chapterTitle}`}
            breadcrumbs={breadcrumbs}
        >
            <VerseFullEditIntroCard
                bookTitle={book.title}
                verseTitle={verseTitle}
                verse={verse}
            />

            <ScriptureSection
                adminTargetSection="identity"
                title="Verse Identity"
                description="Canonical verse identity and text for this verse."
            >
                <VerseIdentityEditorCard
                    updateHref={admin_identity_update_href}
                    verse={verse}
                />
            </ScriptureSection>

            <ScriptureSection
                adminTargetSection="meta"
                title="Verse Meta"
                description="Broader editorial metadata for this verse."
            >
                <VerseMetaEditorCard
                    updateHref={admin_meta_update_href}
                    verseMeta={verse_meta}
                    characters={characters}
                />
            </ScriptureSection>

            <ScriptureSection
                adminTargetSection="translations"
                title="Verse Translations"
                description="Review and manage the translations shown with this verse."
                action={
                    <Badge variant="outline">
                        {admin_translations.rows.length} translation
                        {admin_translations.rows.length === 1 ? '' : 's'}
                    </Badge>
                }
            >
                {translationsSurface && (
                    <AdminModuleHost
                        surface={translationsSurface}
                        className="flex flex-wrap items-start gap-1.5"
                    />
                )}
            </ScriptureSection>

            <ScriptureSection
                adminTargetSection="commentaries"
                title="Verse Commentaries"
                description="Review and manage the commentaries shown with this verse."
                action={
                    <Badge variant="outline">
                        {admin_commentaries.rows.length}{' '}
                        {admin_commentaries.rows.length === 1
                            ? 'commentary'
                            : 'commentaries'}
                    </Badge>
                }
            >
                {commentariesSurface && (
                    <AdminModuleHost
                        surface={commentariesSurface}
                        className="flex flex-wrap items-start gap-1.5"
                    />
                )}
            </ScriptureSection>

            <ScriptureSection
                adminTargetSection="content_blocks"
                title="Intro & Note Blocks"
                description="Manage verse-owned text, quote, and image intro or note blocks, including drafts that stay hidden from the public page."
                action={
                    <div className="flex flex-wrap gap-2">
                        <Badge variant="outline">
                            {admin_content_blocks.length} editable
                        </Badge>
                        <Badge variant="outline">
                            {protected_content_blocks.length} protected
                        </Badge>
                    </div>
                }
            >
                <div className="space-y-4">
                    <CreateVerseContentBlockCard
                        storeHref={admin_content_block_store_href}
                        nextSortOrder={next_content_block_sort_order}
                        blockTypeField={fields.content_block_type}
                        titleField={fields.content_block_title}
                        bodyField={fields.content_block_body}
                        mediaUrlField={fields.content_block_media_url}
                        altTextField={fields.content_block_alt_text}
                        regionField={fields.content_block_region}
                        sortOrderField={fields.content_block_sort_order}
                        statusField={fields.content_block_status}
                    />

                    {admin_content_blocks.map((block) => (
                        <VerseContentBlockEditorCard
                            key={block.id}
                            block={block}
                            blockTypeField={fields.content_block_type}
                            titleField={fields.content_block_title}
                            bodyField={fields.content_block_body}
                            mediaUrlField={fields.content_block_media_url}
                            altTextField={fields.content_block_alt_text}
                            regionField={fields.content_block_region}
                            sortOrderField={fields.content_block_sort_order}
                            statusField={fields.content_block_status}
                        />
                    ))}

                    {protected_content_blocks.map((block) => (
                        <ProtectedVerseContentBlockCard
                            key={block.id}
                            block={block}
                        />
                    ))}
                </div>
            </ScriptureSection>
        </ScriptureLayout>
    );
}
