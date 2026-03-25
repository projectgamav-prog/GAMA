<?php

namespace Database\Seeders;

use App\Models\Book;
use App\Models\Character;
use App\Models\Topic;
use App\Support\Scripture\ScriptureJsonImporter;
use Illuminate\Database\Seeder;

class BhagavadGitaDevelopmentSeeder extends Seeder
{
    /**
     * Seed a minimal Bhagavad Gita dataset for local development.
     */
    public function run(): void
    {
        app(ScriptureJsonImporter::class)->import('bhagavad-gita');

        $book = Book::query()
            ->where('slug', 'bhagavad-gita')
            ->firstOrFail();

        $bookSection = $book->bookSections()
            ->where('slug', 'main')
            ->firstOrFail();

        $chapterOneSection = $bookSection->chapters()
            ->where('slug', 'chapter-1')
            ->firstOrFail()
            ->chapterSections()
            ->where('slug', 'section-4-main')
            ->firstOrFail();

        $chapterTwoSection = $bookSection->chapters()
            ->where('slug', 'chapter-2')
            ->firstOrFail()
            ->chapterSections()
            ->where('slug', 'section-1')
            ->firstOrFail();

        $verseOneTwentyEight = $chapterOneSection->verses()
            ->where('slug', 'verse-28')
            ->firstOrFail();

        $verseTwoOne = $chapterTwoSection->verses()
            ->where('slug', 'verse-1')
            ->firstOrFail();

        $topic = Topic::query()->updateOrCreate(
            ['slug' => 'dharma'],
            [
                'name' => 'Dharma',
                'description' => 'Duty, right action, and moral responsibility in context.',
                'sort_order' => 1,
            ],
        );

        $character = Character::query()->updateOrCreate(
            ['slug' => 'arjuna'],
            [
                'name' => 'Arjuna',
                'description' => 'The warrior disciple whose moral crisis opens the dialogue of the Gita.',
                'sort_order' => 1,
            ],
        );

        $book->contentBlocks()->updateOrCreate(
            [
                'region' => 'overview',
                'block_type' => 'text',
                'title' => 'What this seed includes',
            ],
            [
                'body' => 'This local dataset includes two chapters, a handful of verses, selected translations, and a small set of study objects to exercise the schema.',
                'data_json' => null,
                'sort_order' => 1,
                'status' => 'published',
            ],
        );

        $book->contentBlocks()->updateOrCreate(
            [
                'region' => 'highlights',
                'block_type' => 'quote',
                'title' => 'Seed Highlight',
            ],
            [
                'body' => 'Act with steadiness, without making the result the center of your identity.',
                'data_json' => null,
                'sort_order' => 2,
                'status' => 'published',
            ],
        );

        $book->contentBlocks()->updateOrCreate(
            [
                'region' => 'overview',
                'block_type' => 'video',
                'title' => 'Bhagavad Gita Overview',
            ],
            [
                'body' => 'Development placeholder video overview for the Bhagavad Gita library card.',
                'data_json' => [
                    'url' => 'https://example.test/assets/bhagavad-gita-overview.mp4',
                    'poster' => 'https://example.test/assets/bhagavad-gita-overview-poster.jpg',
                ],
                'sort_order' => 3,
                'status' => 'published',
            ],
        );

        $topic->contentBlocks()->updateOrCreate(
            [
                'region' => 'hero',
                'block_type' => 'image',
                'title' => 'Dharma Illustration',
            ],
            [
                'body' => 'Development placeholder image metadata for the Dharma topic page.',
                'data_json' => [
                    'url' => 'https://example.test/assets/dharma-wheel.jpg',
                    'alt' => 'Illustrated dharma wheel',
                    'caption' => 'Placeholder artwork for local development only.',
                ],
                'sort_order' => 1,
                'status' => 'published',
            ],
        );

        $character->contentBlocks()->updateOrCreate(
            [
                'region' => 'media',
                'block_type' => 'video',
                'title' => 'Arjuna Context Clip',
            ],
            [
                'body' => 'Development placeholder video metadata for the Arjuna character page.',
                'data_json' => [
                    'url' => 'https://example.test/assets/arjuna-context.mp4',
                    'poster' => 'https://example.test/assets/arjuna-context-poster.jpg',
                ],
                'sort_order' => 1,
                'status' => 'published',
            ],
        );

        $topic->outgoingEntityRelations()->updateOrCreate(
            [
                'target_type' => $verseTwoOne->getMorphClass(),
                'target_id' => $verseTwoOne->getKey(),
                'relation_type' => 'explains',
            ],
            [
                'sort_order' => 1,
                'meta_json' => [
                    'note' => 'Development cross-link from topic to key verse.',
                ],
            ],
        );

        $character->outgoingEntityRelations()->updateOrCreate(
            [
                'target_type' => $verseOneTwentyEight->getMorphClass(),
                'target_id' => $verseOneTwentyEight->getKey(),
                'relation_type' => 'speaks_in',
            ],
            [
                'sort_order' => 1,
                'meta_json' => [
                    'note' => 'Development cross-link from character to speech verse.',
                ],
            ],
        );
    }
}
