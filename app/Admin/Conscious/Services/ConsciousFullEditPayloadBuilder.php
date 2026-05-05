<?php

namespace App\Admin\Conscious\Services;

use App\Models\Book;
use App\Models\BookSection;
use App\Models\Chapter;
use App\Models\ChapterSection;
use App\Models\ContentBlock;
use App\Models\Verse;

final class ConsciousFullEditPayloadBuilder
{
    /**
     * @return array<string, mixed>
     */
    public function build(string $schemaFamily, string $entityType, int $id): array
    {
        if ($schemaFamily !== 'scripture') {
            return $this->unsupported($schemaFamily, $entityType, $id);
        }

        return match ($entityType) {
            'book' => $this->book(Book::query()->findOrFail($id)),
            'book_section' => $this->bookSection(
                BookSection::query()
                    ->with('book')
                    ->findOrFail($id),
            ),
            'chapter' => $this->chapter(
                Chapter::query()
                    ->with('bookSection.book')
                    ->findOrFail($id),
            ),
            'chapter_section' => $this->chapterSection(
                ChapterSection::query()
                    ->with('chapter.bookSection.book')
                    ->findOrFail($id),
            ),
            'verse' => $this->verse(
                Verse::query()
                    ->with('chapterSection.chapter.bookSection.book')
                    ->findOrFail($id),
            ),
            'content_block' => $this->contentBlock(ContentBlock::query()->findOrFail($id)),
            default => $this->unsupported($schemaFamily, $entityType, $id),
        };
    }

    /**
     * @return array<string, mixed>
     */
    private function book(Book $book): array
    {
        return [
            'schema_family' => 'scripture',
            'entity_type' => 'book',
            'entity_id' => $book->id,
            'label' => $book->title,
            'description' => 'Schema-aware full edit for the book record.',
            'public_href' => route('scripture.books.show', $book),
            'old_full_edit_href' => null,
            'fields' => [
                $this->field('book', $book->id, 'title', 'Book title', 'Basic Content', 'title', $book->title, true, 'books.title'),
                $this->field('book', $book->id, 'description', 'Book description', 'Basic Content', 'description', $book->description, false, 'books.description', editorType: 'textarea'),
                $this->protectedIdentityField('book', $book->id, 'slug', 'URL slug', 'slug', $book->slug, 'books.slug'),
                $this->protectedIdentityField('book', $book->id, 'number', 'Canonical number', 'number', $book->number, 'books.number'),
                $this->readonlyField('id', 'Database ID', 'Advanced / Technical', 'number', $book->id, 'books.id'),
            ],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function bookSection(BookSection $bookSection): array
    {
        $book = $bookSection->book;

        abort_unless($book instanceof Book, 404);

        return [
            'schema_family' => 'scripture',
            'entity_type' => 'book_section',
            'entity_id' => $bookSection->id,
            'label' => $bookSection->title ?: 'Book section '.$bookSection->number,
            'description' => 'Schema-aware full edit for the book section record.',
            'public_href' => route('scripture.books.show', $book).'#'.($bookSection->slug ?: 'chapter-list'),
            'old_full_edit_href' => null,
            'fields' => [
                $this->field('book_section', $bookSection->id, 'title', 'Book section title', 'Basic Content', 'title', $bookSection->title, false, 'book_sections.title'),
                $this->protectedIdentityField('book_section', $bookSection->id, 'slug', 'URL slug', 'slug', $bookSection->slug, 'book_sections.slug'),
                $this->protectedIdentityField('book_section', $bookSection->id, 'number', 'Canonical number', 'number', $bookSection->number, 'book_sections.number'),
                $this->readonlyField('book_id', 'Parent book', 'Structure & Parentage', 'relation', $book->title, 'book_sections.book_id', 'Parent book is protected canonical structure.', protected: true),
                $this->readonlyField('canonical_path', 'Canonical path', 'Structure & Parentage', 'canonical_identity', $book->title.' / '.($bookSection->title ?: $bookSection->slug), 'book_sections.canonical_path', 'Canonical path is derived from protected hierarchy.', protected: true),
                $this->readonlyField('canonical_order', 'Canonical order', 'Ordering', 'order', $bookSection->number, 'book_sections.number', 'Book section ordering is canonical and not casually editable.', protected: true),
                $this->readonlyField('id', 'Database ID', 'Advanced / Technical', 'number', $bookSection->id, 'book_sections.id'),
            ],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function chapter(Chapter $chapter): array
    {
        $bookSection = $chapter->bookSection;
        $book = $bookSection?->book;

        abort_unless($bookSection && $book, 404);

        return [
            'schema_family' => 'scripture',
            'entity_type' => 'chapter',
            'entity_id' => $chapter->id,
            'label' => $chapter->title ?: 'Chapter '.$chapter->number,
            'description' => 'Schema-aware full edit for the chapter record.',
            'public_href' => route('scripture.chapters.show', [$book, $bookSection, $chapter]),
            'old_full_edit_href' => null,
            'fields' => [
                $this->field('chapter', $chapter->id, 'title', 'Chapter title', 'Basic Content', 'title', $chapter->title, false, 'chapters.title'),
                $this->protectedIdentityField('chapter', $chapter->id, 'slug', 'URL slug', 'slug', $chapter->slug, 'chapters.slug'),
                $this->protectedIdentityField('chapter', $chapter->id, 'number', 'Canonical number', 'number', $chapter->number, 'chapters.number'),
                $this->readonlyField('book_section_id', 'Parent book section', 'Structure & Parentage', 'relation', $bookSection->title ?: $bookSection->slug, 'chapters.book_section_id'),
                $this->readonlyField('id', 'Database ID', 'Advanced / Technical', 'number', $chapter->id, 'chapters.id'),
            ],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function chapterSection(ChapterSection $chapterSection): array
    {
        $chapter = $chapterSection->chapter;
        $bookSection = $chapter?->bookSection;
        $book = $bookSection?->book;

        abort_unless($chapter instanceof Chapter && $bookSection instanceof BookSection && $book instanceof Book, 404);

        return [
            'schema_family' => 'scripture',
            'entity_type' => 'chapter_section',
            'entity_id' => $chapterSection->id,
            'label' => $chapterSection->title ?: 'Chapter section '.$chapterSection->number,
            'description' => 'Schema-aware full edit for the chapter section record.',
            'public_href' => route('scripture.chapters.show', [$book, $bookSection, $chapter]).'#'.($chapterSection->slug ?: 'verse-list'),
            'old_full_edit_href' => null,
            'fields' => [
                $this->field('chapter_section', $chapterSection->id, 'title', 'Chapter section title', 'Basic Content', 'title', $chapterSection->title, false, 'chapter_sections.title'),
                $this->protectedIdentityField('chapter_section', $chapterSection->id, 'slug', 'URL slug', 'slug', $chapterSection->slug, 'chapter_sections.slug'),
                $this->protectedIdentityField('chapter_section', $chapterSection->id, 'number', 'Canonical number', 'number', $chapterSection->number, 'chapter_sections.number'),
                $this->readonlyField('chapter_id', 'Parent chapter', 'Structure & Parentage', 'relation', $chapter->title ?: 'Chapter '.$chapter->number, 'chapter_sections.chapter_id', 'Parent chapter is protected canonical structure.', protected: true),
                $this->readonlyField('canonical_path', 'Canonical path', 'Structure & Parentage', 'canonical_identity', $book->title.' / '.($chapter->title ?: 'Chapter '.$chapter->number).' / '.($chapterSection->title ?: $chapterSection->slug), 'chapter_sections.canonical_path', 'Canonical path is derived from protected hierarchy.', protected: true),
                $this->readonlyField('canonical_order', 'Canonical order', 'Ordering', 'order', $chapterSection->number, 'chapter_sections.number', 'Chapter section ordering is canonical and not casually editable.', protected: true),
                $this->readonlyField('id', 'Database ID', 'Advanced / Technical', 'number', $chapterSection->id, 'chapter_sections.id'),
            ],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function verse(Verse $verse): array
    {
        $chapterSection = $verse->chapterSection;
        $chapter = $chapterSection?->chapter;
        $bookSection = $chapter?->bookSection;
        $book = $bookSection?->book;

        abort_unless($chapterSection && $chapter && $bookSection && $book, 404);

        return [
            'schema_family' => 'scripture',
            'entity_type' => 'verse',
            'entity_id' => $verse->id,
            'label' => 'Verse '.($verse->number ?: $verse->id),
            'description' => 'Schema-aware full edit for the verse record.',
            'public_href' => route('scripture.chapters.verses.show', [$book, $bookSection, $chapter, $chapterSection, $verse]),
            'old_full_edit_href' => null,
            'fields' => [
                $this->field('verse', $verse->id, 'text', 'Verse text', 'Basic Content', 'long_text', $verse->text, true, 'verses.text', editorType: 'textarea'),
                $this->protectedIdentityField('verse', $verse->id, 'slug', 'URL slug', 'slug', $verse->slug, 'verses.slug'),
                $this->protectedIdentityField('verse', $verse->id, 'number', 'Canonical number', 'number', $verse->number, 'verses.number'),
                $this->readonlyField('chapter_section_id', 'Parent chapter section', 'Structure & Parentage', 'relation', $chapterSection->title ?: $chapterSection->slug, 'verses.chapter_section_id'),
                $this->readonlyField('id', 'Database ID', 'Advanced / Technical', 'number', $verse->id, 'verses.id'),
            ],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function contentBlock(ContentBlock $contentBlock): array
    {
        return [
            'schema_family' => 'scripture',
            'entity_type' => 'content_block',
            'entity_id' => $contentBlock->id,
            'label' => $contentBlock->title ?: 'Content block '.$contentBlock->id,
            'description' => 'Schema-aware full edit for this content block. Parent-aware save routes will be connected in a later slice.',
            'public_href' => null,
            'old_full_edit_href' => null,
            'fields' => [
                $this->readonlyField('title', 'Block title', 'Basic Content', 'title', $contentBlock->title, 'content_blocks.title', 'Parent-aware block save route is not available in the Conscious Full Edit shell yet.'),
                $this->readonlyField('body', 'Block body', 'Basic Content', 'long_text', $contentBlock->body, 'content_blocks.body', 'Parent-aware block save route is not available in the Conscious Full Edit shell yet.'),
                $this->protectedField('block_type', 'Block type', 'Structure & Parentage', 'protected_metadata', $contentBlock->block_type, 'content_blocks.block_type'),
                $this->readonlyField('region', 'Region', 'Structure & Parentage', 'short_text', $contentBlock->region, 'content_blocks.region'),
                $this->protectedField('sort_order', 'Sort order', 'Ordering', 'order', $contentBlock->sort_order, 'content_blocks.sort_order'),
                $this->readonlyField('status', 'Publish status', 'Publishing / Visibility', 'enum', $contentBlock->status, 'content_blocks.status'),
                $this->readonlyField('id', 'Database ID', 'Advanced / Technical', 'number', $contentBlock->id, 'content_blocks.id'),
            ],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function unsupported(string $schemaFamily, string $entityType, int $id): array
    {
        return [
            'schema_family' => $schemaFamily,
            'entity_type' => $entityType,
            'entity_id' => $id,
            'label' => 'Unsupported schema entity',
            'description' => 'This entity does not have a Conscious Full Edit schema module yet.',
            'public_href' => null,
            'old_full_edit_href' => null,
            'fields' => [],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function field(
        string $entityType,
        int $entityId,
        string $name,
        string $label,
        string $category,
        string $fieldKind,
        mixed $value,
        bool $required,
        ?string $diagnosticKey,
        string $editorType = 'input',
    ): array {
        return [
            'name' => $name,
            'label' => $label,
            'category' => $category,
            'field_kind' => $fieldKind,
            'editor_type' => $editorType,
            'value' => $this->stringValue($value),
            'display_value' => $this->stringValue($value),
            'editable' => true,
            'protected' => false,
            'readonly' => false,
            'required' => $required,
            'update_href' => route('admin.schema.fields.update', ['scripture', $entityType, $entityId, $name]),
            'method' => 'patch',
            'payload_key' => 'value',
            'hidden_payload_fields' => [],
            'notice' => null,
            'diagnostic_key' => $diagnosticKey,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function protectedIdentityField(
        string $entityType,
        int $entityId,
        string $name,
        string $label,
        string $fieldKind,
        mixed $value,
        string $diagnosticKey,
    ): array {
        return [
            'name' => $name,
            'label' => $label,
            'category' => 'Canonical Identity',
            'field_kind' => $fieldKind,
            'editor_type' => 'input',
            'value' => $this->stringValue($value),
            'display_value' => $this->stringValue($value),
            'editable' => true,
            'protected' => true,
            'readonly' => false,
            'required' => $name === 'slug',
            'update_href' => route('admin.schema.actions.run', ['scripture', $entityType, $entityId, 'protected_identity.update']),
            'method' => 'post',
            'payload_key' => $name,
            'hidden_payload_fields' => [],
            'notice' => 'Protected identity field. Saves through the policy-gated Conscious protected identity action.',
            'diagnostic_key' => $diagnosticKey,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function protectedField(
        string $name,
        string $label,
        string $category,
        string $fieldKind,
        mixed $value,
        string $diagnosticKey,
    ): array {
        return $this->readonlyField(
            $name,
            $label,
            $category,
            $fieldKind,
            $value,
            $diagnosticKey,
            'Protected canonical or structural field. Use an advanced identity workflow when this must change.',
            protected: true,
        );
    }

    /**
     * @return array<string, mixed>
     */
    private function readonlyField(
        string $name,
        string $label,
        string $category,
        string $fieldKind,
        mixed $value,
        string $diagnosticKey,
        ?string $notice = null,
        bool $protected = false,
    ): array {
        return [
            'name' => $name,
            'label' => $label,
            'category' => $category,
            'field_kind' => $fieldKind,
            'editor_type' => 'readonly',
            'value' => $this->stringValue($value),
            'display_value' => $this->stringValue($value),
            'editable' => false,
            'protected' => $protected,
            'readonly' => true,
            'required' => false,
            'update_href' => null,
            'method' => 'patch',
            'payload_key' => $name,
            'hidden_payload_fields' => [],
            'notice' => $notice,
            'diagnostic_key' => $diagnosticKey,
        ];
    }

    private function stringValue(mixed $value): string
    {
        if ($value === null) {
            return '';
        }

        if (is_bool($value)) {
            return $value ? 'true' : 'false';
        }

        return (string) $value;
    }
}
