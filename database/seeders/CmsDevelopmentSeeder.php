<?php

namespace Database\Seeders;

use App\Models\Page;
use App\Models\PageContainer;
use App\Models\Verse;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CmsDevelopmentSeeder extends Seeder
{
    public function run(): void
    {
        $this->seedHomePrimaryRegion();
        $this->seedPlatformGuidePage();
        $this->seedVerseSupplementaryRegion();
    }

    private function seedHomePrimaryRegion(): void
    {
        $page = Page::query()->updateOrCreate(
            ['exposure_key' => 'home-primary'],
            [
                'title' => 'Home Page Region',
                'slug' => 'region-home-primary',
                'status' => 'published',
                'layout_key' => 'standard',
            ],
        );

        $page->pageContainers()->delete();

        $pathways = $this->createContainer($page, [
            'label' => 'Home Reading Paths',
            'container_type' => 'section',
            'sort_order' => 1,
        ]);

        $this->createBlock($pathways, [
            'module_key' => 'rich_text',
            'data_json' => [
                'eyebrow' => 'Supplemental reading paths',
                'title' => 'Choose the kind of session you want today',
                'lead' => 'The homepage now keeps its protected reading frame while using CMS modules to offer clearer supporting paths into guides, references, and the canonical library.',
                'html' => '<p>Use the shared shell to begin in a stable public flow, then branch into the right next step without losing the difference between canonical scripture and supplemental content.</p><p>This region is intentionally practical: prose for orientation, cards for paths, a supporting media moment, and one clear follow-up call to action.</p>',
            ],
            'config_json' => [
                'align' => 'left',
                'max_width' => 'wide',
            ],
            'sort_order' => 1,
        ]);

        $this->createBlock($pathways, [
            'module_key' => 'button_group',
            'data_json' => [
                'buttons' => [
                    [
                        'label' => 'Browse scripture library',
                        'target' => [
                            'type' => 'route',
                            'value' => [
                                'key' => 'scripture.books.index',
                            ],
                            'behavior' => [
                                'new_tab' => false,
                            ],
                        ],
                        'variant' => 'default',
                        'open_in_new_tab' => false,
                    ],
                    [
                        'label' => 'Read the platform guide',
                        'target' => [
                            'type' => 'cms_page',
                            'value' => [
                                'slug' => 'platform-guide',
                            ],
                            'behavior' => [
                                'new_tab' => false,
                            ],
                        ],
                        'variant' => 'outline',
                        'open_in_new_tab' => false,
                    ],
                    [
                        'label' => 'Open Bhagavad Gita',
                        'target' => [
                            'type' => 'scripture',
                            'value' => [
                                'kind' => 'book',
                                'book_slug' => 'bhagavad-gita',
                                'book_section_slug' => null,
                                'chapter_slug' => null,
                                'chapter_section_slug' => null,
                                'verse_slug' => null,
                                'entry_slug' => null,
                            ],
                            'behavior' => [
                                'new_tab' => false,
                            ],
                        ],
                        'variant' => 'secondary',
                        'open_in_new_tab' => false,
                    ],
                ],
            ],
            'config_json' => [
                'layout' => 'auto',
                'alignment' => 'stretch',
            ],
            'sort_order' => 2,
        ]);

        $highlights = $this->createContainer($page, [
            'label' => 'Home Highlights',
            'container_type' => 'card',
            'sort_order' => 2,
        ]);

        $this->createBlock($highlights, [
            'module_key' => 'card_list',
            'data_json' => [
                'eyebrow' => 'Highlights',
                'title' => 'Use the platform in three distinct ways',
                'intro' => 'The current module set is strongest when it supports clear next-step choices, lightweight structure, and declared supplemental regions.',
                'items' => [
                    [
                        'eyebrow' => 'Canonical',
                        'title' => 'Read through the protected scripture flow',
                        'body' => 'Start with books, move into chapters, and keep the canonical reading path intact all the way to the verse page.',
                        'cta_label' => 'Browse books',
                        'target' => [
                            'type' => 'route',
                            'value' => [
                                'key' => 'scripture.books.index',
                            ],
                            'behavior' => [
                                'new_tab' => false,
                            ],
                        ],
                    ],
                    [
                        'eyebrow' => 'Reference',
                        'title' => 'Use shared lookup pages for study support',
                        'body' => 'Dictionary, topics, and character pages remain separate from canonical scripture while staying easy to reach from the same shell.',
                        'cta_label' => 'Open dictionary',
                        'target' => [
                            'type' => 'route',
                            'value' => [
                                'key' => 'scripture.dictionary.index',
                            ],
                            'behavior' => [
                                'new_tab' => false,
                            ],
                        ],
                    ],
                    [
                        'eyebrow' => 'Guides',
                        'title' => 'Publish practical CMS pages beside the canon',
                        'body' => 'Public CMS pages can now carry structured guide content, action buttons, and grouped cards without pretending to be scripture structure.',
                        'cta_label' => 'Open guide',
                        'target' => [
                            'type' => 'cms_page',
                            'value' => [
                                'slug' => 'platform-guide',
                            ],
                            'behavior' => [
                                'new_tab' => false,
                            ],
                        ],
                    ],
                ],
            ],
            'config_json' => [
                'layout' => 'cards',
                'columns' => 'three',
            ],
            'sort_order' => 2,
        ]);

        $media = $this->createContainer($page, [
            'label' => 'Home Supporting Media',
            'container_type' => 'section',
            'sort_order' => 3,
        ]);

        $this->createBlock($media, [
            'module_key' => 'rich_text',
            'data_json' => [
                'eyebrow' => 'Supporting media',
                'title' => 'The shell stays calm while supplemental content carries the extra context',
                'lead' => 'This region is where visual or editorial support can grow without changing the homepage into a free-form builder.',
                'html' => '<p>The image block below is intentionally simple for now. It works best when paired with prose and actions instead of trying to become a full media workflow before the product needs it.</p>',
            ],
            'config_json' => [
                'align' => 'left',
                'max_width' => 'wide',
            ],
            'sort_order' => 1,
        ]);

        $this->createBlock($media, [
            'module_key' => 'media',
            'data_json' => [
                'media_type' => 'image',
                'url' => 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80',
                'alt_text' => 'Open reading desk with sunlight and notebooks',
                'caption' => 'Supplemental visual context can now sit inside declared regions without taking over the shell.',
            ],
            'config_json' => [
                'aspect_ratio' => 'landscape',
                'width' => 'wide',
            ],
            'sort_order' => 2,
        ]);

        $nextSteps = $this->createContainer($page, [
            'label' => 'Home Secondary Call To Action',
            'container_type' => 'card',
            'sort_order' => 4,
        ]);

        $this->createBlock($nextSteps, [
            'module_key' => 'rich_text',
            'data_json' => [
                'eyebrow' => 'Next step',
                'title' => 'Move from orientation into an actual reading session',
                'lead' => 'The fastest way to evaluate the current modules is to use them to move people into real pages, not to keep stacking demo content.',
                'html' => '<p>Choose a book when you want the protected reading hierarchy. Choose the guide page when you want a more article-shaped explanation. Choose the dictionary when you want reference-first study.</p>',
            ],
            'config_json' => [
                'align' => 'left',
                'max_width' => 'wide',
            ],
            'sort_order' => 1,
        ]);

        $this->createBlock($nextSteps, [
            'module_key' => 'button_group',
            'data_json' => [
                'buttons' => [
                    [
                        'label' => 'Open chapter 2',
                        'target' => [
                            'type' => 'scripture',
                            'value' => [
                                'kind' => 'chapter',
                                'book_slug' => 'bhagavad-gita',
                                'book_section_slug' => 'main',
                                'chapter_slug' => 'chapter-2',
                                'chapter_section_slug' => null,
                                'verse_slug' => null,
                                'entry_slug' => null,
                            ],
                            'behavior' => [
                                'new_tab' => false,
                            ],
                        ],
                        'variant' => 'default',
                        'open_in_new_tab' => false,
                    ],
                    [
                        'label' => 'Explore topics',
                        'target' => [
                            'type' => 'route',
                            'value' => [
                                'key' => 'scripture.topics.index',
                            ],
                            'behavior' => [
                                'new_tab' => false,
                            ],
                        ],
                        'variant' => 'outline',
                        'open_in_new_tab' => false,
                    ],
                ],
            ],
            'config_json' => [
                'layout' => 'auto',
                'alignment' => 'stretch',
            ],
            'sort_order' => 2,
        ]);
    }

    private function seedPlatformGuidePage(): void
    {
        $page = Page::query()->updateOrCreate(
            ['slug' => 'platform-guide'],
            [
                'title' => 'Platform Guide',
                'status' => 'published',
                'layout_key' => 'standard',
                'exposure_key' => null,
            ],
        );

        $page->pageContainers()->delete();

        $hero = $this->createContainer($page, [
            'label' => 'Guide Hero',
            'container_type' => 'card',
            'sort_order' => 1,
        ]);

        $this->createBlock($hero, [
            'module_key' => 'rich_text',
            'data_json' => [
                'eyebrow' => 'Platform guide',
                'title' => 'How the reading platform is structured right now',
                'lead' => 'This page explains the product in the same public shell that readers use, while proving that the current CMS modules can carry real guide content instead of demo fragments.',
                'html' => '<p>The platform now has a stable shell, protected canonical scripture pages, declared supplemental regions, and a first practical CMS module set. This guide pulls those pieces together in one place.</p><p>It is intentionally written like a real public-facing guide: orientation first, structure second, and actions only where they help people move to the next page.</p>',
            ],
            'config_json' => [
                'align' => 'left',
                'max_width' => 'wide',
            ],
            'sort_order' => 1,
        ]);

        $this->createBlock($hero, [
            'module_key' => 'button_group',
            'data_json' => [
                'buttons' => [
                    [
                        'label' => 'Browse the books library',
                        'target' => [
                            'type' => 'route',
                            'value' => [
                                'key' => 'scripture.books.index',
                            ],
                            'behavior' => [
                                'new_tab' => false,
                            ],
                        ],
                        'variant' => 'default',
                        'open_in_new_tab' => false,
                    ],
                    [
                        'label' => 'Return home',
                        'target' => [
                            'type' => 'route',
                            'value' => [
                                'key' => 'home',
                            ],
                            'behavior' => [
                                'new_tab' => false,
                            ],
                        ],
                        'variant' => 'outline',
                        'open_in_new_tab' => false,
                    ],
                ],
            ],
            'config_json' => [
                'layout' => 'auto',
                'alignment' => 'stretch',
            ],
            'sort_order' => 2,
        ]);

        $layers = $this->createContainer($page, [
            'label' => 'Guide Content Layers',
            'container_type' => 'section',
            'sort_order' => 2,
        ]);

        $this->createBlock($layers, [
            'module_key' => 'card_list',
            'data_json' => [
                'eyebrow' => 'Three layers',
                'title' => 'Shell, canon, and supplemental content each have their own job',
                'intro' => 'The current product works best when each layer stays honest about what it owns and what it does not own.',
                'items' => [
                    [
                        'eyebrow' => 'Shell',
                        'title' => 'Shared frame',
                        'body' => 'Header and footer stay stable, structured, and reusable across the public site.',
                        'cta_label' => '',
                        'target' => null,
                    ],
                    [
                        'eyebrow' => 'Canonical',
                        'title' => 'Protected scripture flow',
                        'body' => 'Books, chapters, and verses remain schema-driven and keep their reading hierarchy intact.',
                        'cta_label' => 'Open a chapter',
                        'target' => [
                            'type' => 'scripture',
                            'value' => [
                                'kind' => 'chapter',
                                'book_slug' => 'bhagavad-gita',
                                'book_section_slug' => 'main',
                                'chapter_slug' => 'chapter-2',
                                'chapter_section_slug' => null,
                                'verse_slug' => null,
                                'entry_slug' => null,
                            ],
                            'behavior' => [
                                'new_tab' => false,
                            ],
                        ],
                    ],
                    [
                        'eyebrow' => 'Supplemental',
                        'title' => 'Declared CMS regions',
                        'body' => 'Guides, callouts, and supplementary study content grow only inside approved seams instead of taking over canonical structure.',
                        'cta_label' => 'View verse detail',
                        'target' => [
                            'type' => 'scripture',
                            'value' => [
                                'kind' => 'verse',
                                'book_slug' => 'bhagavad-gita',
                                'book_section_slug' => 'main',
                                'chapter_slug' => 'chapter-2',
                                'chapter_section_slug' => 'section-1',
                                'verse_slug' => 'verse-1',
                                'entry_slug' => null,
                            ],
                            'behavior' => [
                                'new_tab' => false,
                            ],
                        ],
                    ],
                ],
            ],
            'config_json' => [
                'layout' => 'cards',
                'columns' => 'three',
            ],
            'sort_order' => 1,
        ]);

        $media = $this->createContainer($page, [
            'label' => 'Guide Media Section',
            'container_type' => 'section',
            'sort_order' => 3,
        ]);

        $this->createBlock($media, [
            'module_key' => 'rich_text',
            'data_json' => [
                'eyebrow' => 'Layout discipline',
                'title' => 'Declared regions keep the page readable',
                'lead' => 'The first CMS growth phase is strongest when it supports page structure instead of trying to replace page structure.',
                'html' => '<p>This guide uses a media section on purpose: it proves the module can sit inside a real article flow, but it also reveals the current limitation that media authoring still starts from direct URLs instead of a stronger library workflow.</p>',
            ],
            'config_json' => [
                'align' => 'left',
                'max_width' => 'wide',
            ],
            'sort_order' => 1,
        ]);

        $this->createBlock($media, [
            'module_key' => 'media',
            'data_json' => [
                'media_type' => 'image',
                'url' => 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=1400&q=80',
                'alt_text' => 'Desk with notes, books, and a calm work surface',
                'caption' => 'A simple media block is already useful for guides, but its setup still feels more technical than the prose and card modules.',
            ],
            'config_json' => [
                'aspect_ratio' => 'landscape',
                'width' => 'wide',
            ],
            'sort_order' => 2,
        ]);

        $workflow = $this->createContainer($page, [
            'label' => 'Guide Workflow Notes',
            'container_type' => 'card',
            'sort_order' => 4,
        ]);

        $this->createBlock($workflow, [
            'module_key' => 'rich_text',
            'data_json' => [
                'eyebrow' => 'Current workflow',
                'title' => 'What authors can do right now',
                'lead' => 'The current CMS is already good enough for structured prose pages when the content is broken into purposeful sections.',
                'html' => '<ul><li>Create distinct containers when the page needs a new section or card.</li><li>Keep related prose, CTAs, and list content inside the same container when they belong together.</li><li>Use live page editing for routine composition and keep the workspace as support tooling.</li><li>Reuse the shared link-target system instead of inventing page-local link logic.</li></ul>',
            ],
            'config_json' => [
                'align' => 'left',
                'max_width' => 'wide',
            ],
            'sort_order' => 1,
        ]);

        $patterns = $this->createContainer($page, [
            'label' => 'Guide Page Patterns',
            'container_type' => 'section',
            'sort_order' => 5,
        ]);

        $this->createBlock($patterns, [
            'module_key' => 'card_list',
            'data_json' => [
                'eyebrow' => 'Page patterns',
                'title' => 'Use the current module set where it already feels strong',
                'intro' => 'These are the content shapes that already work well without asking the CMS to solve every future need upfront.',
                'items' => [
                    [
                        'eyebrow' => 'Home',
                        'title' => 'Supplemental orientation and next steps',
                        'body' => 'Use rich text, grouped cards, and small CTA sets to support the protected homepage reading frame.',
                        'cta_label' => 'Open home',
                        'target' => [
                            'type' => 'route',
                            'value' => [
                                'key' => 'home',
                            ],
                            'behavior' => [
                                'new_tab' => false,
                            ],
                        ],
                    ],
                    [
                        'eyebrow' => 'CMS page',
                        'title' => 'Article-shaped guides',
                        'body' => 'Use containers to break a longer page into purposeful sections instead of one flat stream of blocks.',
                        'cta_label' => '',
                        'target' => null,
                    ],
                    [
                        'eyebrow' => 'Scripture supplemental',
                        'title' => 'Reflection and study pathways beside canon',
                        'body' => 'Use declared supplemental regions for reflection, related resources, and next-step actions without mutating canonical scripture structure.',
                        'cta_label' => 'Open verse detail',
                        'target' => [
                            'type' => 'scripture',
                            'value' => [
                                'kind' => 'verse',
                                'book_slug' => 'bhagavad-gita',
                                'book_section_slug' => 'main',
                                'chapter_slug' => 'chapter-2',
                                'chapter_section_slug' => 'section-1',
                                'verse_slug' => 'verse-1',
                                'entry_slug' => null,
                            ],
                            'behavior' => [
                                'new_tab' => false,
                            ],
                        ],
                    ],
                ],
            ],
            'config_json' => [
                'layout' => 'cards',
                'columns' => 'three',
            ],
            'sort_order' => 1,
        ]);

        $close = $this->createContainer($page, [
            'label' => 'Guide Closing Actions',
            'container_type' => 'section',
            'sort_order' => 6,
        ]);

        $this->createBlock($close, [
            'module_key' => 'rich_text',
            'data_json' => [
                'eyebrow' => 'Keep going',
                'title' => 'Move from explanation into a real page',
                'lead' => 'The easiest way to judge the current module set is to leave this guide and use the live pages it points to.',
                'html' => '<p>Visit the books library for the canonical reading flow, or open the verse detail page to see how supplementary CMS content can sit beneath protected scripture content without taking it over.</p>',
            ],
            'config_json' => [
                'align' => 'left',
                'max_width' => 'wide',
            ],
            'sort_order' => 1,
        ]);

        $this->createBlock($close, [
            'module_key' => 'button_group',
            'data_json' => [
                'buttons' => [
                    [
                        'label' => 'Open verse detail',
                        'target' => [
                            'type' => 'scripture',
                            'value' => [
                                'kind' => 'verse',
                                'book_slug' => 'bhagavad-gita',
                                'book_section_slug' => 'main',
                                'chapter_slug' => 'chapter-2',
                                'chapter_section_slug' => 'section-1',
                                'verse_slug' => 'verse-1',
                                'entry_slug' => null,
                            ],
                            'behavior' => [
                                'new_tab' => false,
                            ],
                        ],
                        'variant' => 'default',
                        'open_in_new_tab' => false,
                    ],
                    [
                        'label' => 'Browse topics',
                        'target' => [
                            'type' => 'route',
                            'value' => [
                                'key' => 'scripture.topics.index',
                            ],
                            'behavior' => [
                                'new_tab' => false,
                            ],
                        ],
                        'variant' => 'outline',
                        'open_in_new_tab' => false,
                    ],
                ],
            ],
            'config_json' => [
                'layout' => 'auto',
                'alignment' => 'stretch',
            ],
            'sort_order' => 2,
        ]);
    }

    private function seedVerseSupplementaryRegion(): void
    {
        $verse = Verse::query()
            ->where('slug', 'verse-1')
            ->whereHas('chapterSection', function ($chapterSectionQuery): void {
                $chapterSectionQuery
                    ->where('slug', 'section-1')
                    ->whereHas('chapter', function ($chapterQuery): void {
                        $chapterQuery
                            ->where('slug', 'chapter-2')
                            ->whereHas('bookSection', function ($bookSectionQuery): void {
                                $bookSectionQuery
                                    ->where('slug', 'main')
                                    ->whereHas('book', fn ($bookQuery) => $bookQuery->where('slug', 'bhagavad-gita'));
                            });
                    });
            })
            ->first();

        if (! $verse instanceof Verse) {
            return;
        }

        $exposureKey = "scripture-verse-{$verse->id}-supplementary";

        $page = Page::query()->updateOrCreate(
            ['exposure_key' => $exposureKey],
            [
                'title' => "Verse {$verse->id} Supplementary Region",
                'slug' => $this->regionSlug($exposureKey),
                'status' => 'published',
                'layout_key' => 'standard',
            ],
        );

        $page->pageContainers()->delete();

        $reflection = $this->createContainer($page, [
            'label' => 'Verse Reflection',
            'container_type' => 'card',
            'sort_order' => 1,
        ]);

        $this->createBlock($reflection, [
            'module_key' => 'rich_text',
            'data_json' => [
                'eyebrow' => 'Supplementary reflection',
                'title' => 'Read this moment as a threshold, not a replacement for the canon',
                'lead' => 'This CMS region sits below the protected verse detail flow so it can offer context, reflection, and navigation without changing the canonical verse itself.',
                'html' => '<p>In this part of the Bhagavad Gita, the narrative slows down and prepares for a more explicit teaching voice. The supplemental region is useful here because it can point readers toward related study paths without pretending to be the verse.</p>',
            ],
            'config_json' => [
                'align' => 'left',
                'max_width' => 'wide',
            ],
            'sort_order' => 1,
        ]);

        $this->createBlock($reflection, [
            'module_key' => 'button_group',
            'data_json' => [
                'buttons' => [
                    [
                        'label' => 'Return to chapter 2',
                        'target' => [
                            'type' => 'scripture',
                            'value' => [
                                'kind' => 'chapter',
                                'book_slug' => 'bhagavad-gita',
                                'book_section_slug' => 'main',
                                'chapter_slug' => 'chapter-2',
                                'chapter_section_slug' => null,
                                'verse_slug' => null,
                                'entry_slug' => null,
                            ],
                            'behavior' => [
                                'new_tab' => false,
                            ],
                        ],
                        'variant' => 'default',
                        'open_in_new_tab' => false,
                    ],
                    [
                        'label' => 'Open platform guide',
                        'target' => [
                            'type' => 'cms_page',
                            'value' => [
                                'slug' => 'platform-guide',
                            ],
                            'behavior' => [
                                'new_tab' => false,
                            ],
                        ],
                        'variant' => 'outline',
                        'open_in_new_tab' => false,
                    ],
                ],
            ],
            'config_json' => [
                'layout' => 'auto',
                'alignment' => 'stretch',
            ],
            'sort_order' => 2,
        ]);

        $paths = $this->createContainer($page, [
            'label' => 'Verse Related Paths',
            'container_type' => 'section',
            'sort_order' => 2,
        ]);

        $this->createBlock($paths, [
            'module_key' => 'card_list',
            'data_json' => [
                'eyebrow' => 'Continue study',
                'title' => 'Use the supplemental region for related paths, not canonical replacement',
                'intro' => 'This is where the current modules already feel useful on scripture pages: short reflection, related references, and clear next-step actions.',
                'items' => [
                    [
                        'eyebrow' => 'Character',
                        'title' => 'Follow Arjuna as the central listener',
                        'body' => 'Open the character page to stay with the dramatic and personal side of the dialogue.',
                        'cta_label' => 'Open Arjuna',
                        'target' => [
                            'type' => 'scripture',
                            'value' => [
                                'kind' => 'character',
                                'book_slug' => null,
                                'book_section_slug' => null,
                                'chapter_slug' => null,
                                'chapter_section_slug' => null,
                                'verse_slug' => null,
                                'entry_slug' => 'arjuna',
                            ],
                            'behavior' => [
                                'new_tab' => false,
                            ],
                        ],
                    ],
                    [
                        'eyebrow' => 'Topic',
                        'title' => 'Read duty through the Dharma topic page',
                        'body' => 'Use the topic page when you want a broader study path that gathers verses around one teaching theme.',
                        'cta_label' => 'Open Dharma',
                        'target' => [
                            'type' => 'scripture',
                            'value' => [
                                'kind' => 'topic',
                                'book_slug' => null,
                                'book_section_slug' => null,
                                'chapter_slug' => null,
                                'chapter_section_slug' => null,
                                'verse_slug' => null,
                                'entry_slug' => 'dharma',
                            ],
                            'behavior' => [
                                'new_tab' => false,
                            ],
                        ],
                    ],
                    [
                        'eyebrow' => 'Reference',
                        'title' => 'Move into the dictionary when the wording matters',
                        'body' => 'Structured reference pages are often the right next step after a verse because they stay separate from both the canon and the CMS region.',
                        'cta_label' => 'Open dictionary',
                        'target' => [
                            'type' => 'route',
                            'value' => [
                                'key' => 'scripture.dictionary.index',
                            ],
                            'behavior' => [
                                'new_tab' => false,
                            ],
                        ],
                    ],
                ],
            ],
            'config_json' => [
                'layout' => 'cards',
                'columns' => 'three',
            ],
            'sort_order' => 1,
        ]);
    }

    /**
     * @param  array<string, mixed>  $attributes
     */
    private function createContainer(Page $page, array $attributes): PageContainer
    {
        return $page->pageContainers()->create($attributes);
    }

    /**
     * @param  array<string, mixed>  $attributes
     */
    private function createBlock(PageContainer $container, array $attributes): void
    {
        $container->pageBlocks()->create($attributes);
    }

    private function regionSlug(string $key): string
    {
        return 'region-'.Str::slug($key).'-'.substr(md5($key), 0, 6);
    }
}
