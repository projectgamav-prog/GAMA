<?php

namespace Database\Seeders;

use App\Models\Book;
use App\Models\Character;
use App\Models\Topic;
use App\Models\Verse;
use Illuminate\Database\Seeder;

class BhagavadGitaDevelopmentSeeder extends Seeder
{
    /**
     * Seed a minimal Bhagavad Gita dataset for local development.
     */
    public function run(): void
    {
        $book = Book::query()->updateOrCreate(
            ['slug' => 'bhagavad-gita'],
            [
                'title' => 'Bhagavad Gita',
                'description' => 'A minimal development dataset for the Bhagavad Gita canon and related study content.',
                'sort_order' => 1,
            ],
        );

        $bookSection = $book->bookSections()->updateOrCreate(
            ['slug' => 'main-text'],
            [
                'number' => '1',
                'title' => 'Main Text',
                'sort_order' => 1,
            ],
        );

        $chapterOne = $bookSection->chapters()->updateOrCreate(
            ['slug' => 'chapter-1'],
            [
                'number' => '1',
                'title' => 'Arjuna Vishada Yoga',
                'sort_order' => 1,
            ],
        );

        $chapterTwo = $bookSection->chapters()->updateOrCreate(
            ['slug' => 'chapter-2'],
            [
                'number' => '2',
                'title' => 'Sankhya Yoga',
                'sort_order' => 2,
            ],
        );

        $chapterOneSection = $chapterOne->chapterSections()->updateOrCreate(
            ['slug' => 'chapter-1-main'],
            [
                'number' => '1',
                'title' => 'Main Passage',
                'sort_order' => 1,
            ],
        );

        $chapterTwoSection = $chapterTwo->chapterSections()->updateOrCreate(
            ['slug' => 'chapter-2-main'],
            [
                'number' => '1',
                'title' => 'Main Passage',
                'sort_order' => 1,
            ],
        );

        $verseOneOne = $chapterOneSection->verses()->updateOrCreate(
            ['slug' => 'verse-1'],
            [
                'number' => '1',
                'text' => 'धृतराष्ट्र उवाच। धर्मक्षेत्रे कुरुक्षेत्रे समवेता युयुत्सवः। मामकाः पाण्डवाश्चैव किमकुर्वत सञ्जय॥',
                'sort_order' => 1,
            ],
        );

        $verseOneTwentyEight = $chapterOneSection->verses()->updateOrCreate(
            ['slug' => 'verse-28'],
            [
                'number' => '28',
                'text' => 'अर्जुन उवाच। दृष्ट्वेमं स्वजनं कृष्ण युयुत्सुं समुपस्थितम्॥',
                'sort_order' => 2,
            ],
        );

        $verseTwoFortySeven = $chapterTwoSection->verses()->updateOrCreate(
            ['slug' => 'verse-47'],
            [
                'number' => '47',
                'text' => 'कर्मण्येवाधिकारस्ते मा फलेषु कदाचन। मा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि॥',
                'sort_order' => 1,
            ],
        );

        $verseTwoFortyEight = $chapterTwoSection->verses()->updateOrCreate(
            ['slug' => 'verse-48'],
            [
                'number' => '48',
                'text' => 'योगस्थः कुरु कर्माणि सङ्गं त्यक्त्वा धनञ्जय। सिद्ध्यसिद्ध्योः समो भूत्वा समत्वं योग उच्यते॥',
                'sort_order' => 2,
            ],
        );

        $this->seedTranslationPair(
            $verseOneOne,
            'Dhritarashtra said: On the field of dharma at Kurukshetra, what did my people and the Pandavas do, O Sanjaya?',
            'धृतराष्ट्र ने कहा: धर्मभूमि कुरुक्षेत्र में एकत्र मेरे और पाण्डु-पुत्रों ने क्या किया, हे संजय?',
        );

        $this->seedTranslationPair(
            $verseTwoFortySeven,
            'Your responsibility is in action alone, never in its fruits. Do not act for reward, and do not fall into inaction.',
            'तुम्हारा अधिकार केवल कर्म पर है, उसके फलों पर कभी नहीं। फल की इच्छा से कर्म मत करो और अकर्मण्यता से भी मत जुड़ो।',
        );

        $this->seedTranslationPair(
            $verseTwoFortyEight,
            'Established in yoga, perform action without attachment. Stay even in success and failure; that balance is called yoga.',
            'योग में स्थित होकर आसक्ति छोड़े हुए कर्म करो। सफलता और असफलता में समभाव रखना ही योग कहलाता है।',
        );

        $verseTwoFortySeven->commentaries()->updateOrCreate(
            [
                'language_code' => 'en',
                'source_key' => 'dev-commentary',
            ],
            [
                'source_name' => 'Development Notes',
                'author_name' => 'Gama Editorial',
                'title' => 'Action without attachment',
                'body' => 'This verse frames disciplined action as the path forward: act fully, but do not let the outcome become the basis of identity or paralysis.',
                'sort_order' => 1,
            ],
        );

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
                'target_type' => $verseTwoFortySeven->getMorphClass(),
                'target_id' => $verseTwoFortySeven->getKey(),
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

    /**
     * Seed one English and one Hindi translation for a verse.
     */
    private function seedTranslationPair(Verse $verse, string $englishText, string $hindiText): void
    {
        $verse->translations()->updateOrCreate(
            [
                'language_code' => 'en',
                'source_key' => 'dev-en',
            ],
            [
                'source_name' => 'Development English',
                'text' => $englishText,
                'sort_order' => 1,
            ],
        );

        $verse->translations()->updateOrCreate(
            [
                'language_code' => 'hi',
                'source_key' => 'dev-hi',
            ],
            [
                'source_name' => 'Development Hindi',
                'text' => $hindiText,
                'sort_order' => 2,
            ],
        );
    }
}
