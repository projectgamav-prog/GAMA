<?php

use App\Models\ContentBlock;
use App\Models\Topic;
use App\Models\User;
use App\Support\AdminContext\AdminContext;
use Database\Seeders\BhagavadGitaDevelopmentSeeder;
use Database\Seeders\DevelopmentUserSeeder;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->withoutVite();

    $this->seed([
        DevelopmentUserSeeder::class,
        BhagavadGitaDevelopmentSeeder::class,
    ]);

    $this->topic = Topic::query()
        ->where('slug', 'dharma')
        ->firstOrFail();

    $this->topicShowRoute = route('scripture.topics.show', $this->topic);
    $this->detailsUpdateRoute = route(
        'scripture.topics.admin.details.update',
        $this->topic,
    );
    $this->fullEditRoute = route(
        'scripture.topics.admin.full-edit',
        $this->topic,
    );
    $this->contentBlockStoreRoute = route(
        'scripture.topics.admin.content-blocks.store',
        $this->topic,
    );
    $this->visibilityRoute = route('scripture.admin-context.visibility.update');
});

test('guests and non editors cannot access protected topic admin context', function () {
    $this->get($this->topicShowRoute)
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('adminContext.canAccess', false)
            ->where('adminContext.isVisible', false)
            ->where('adminContext.visibilityUrl', null)
            ->where('admin', null),
        );

    $this->get($this->fullEditRoute)
        ->assertRedirect(route('login'));

    $nonEditor = User::factory()->create([
        'can_access_admin_context' => false,
    ]);

    $this->actingAs($nonEditor)
        ->get($this->topicShowRoute)
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('adminContext.canAccess', false)
            ->where('adminContext.isVisible', false)
            ->where('adminContext.visibilityUrl', null)
            ->where('admin', null),
        );

    $this->actingAs($nonEditor)
        ->get($this->fullEditRoute)
        ->assertForbidden();

    $this->actingAs($nonEditor)
        ->patch($this->detailsUpdateRoute, [
            'description' => 'Blocked topic update',
        ])
        ->assertForbidden();

    $this->actingAs($nonEditor)
        ->post($this->visibilityRoute, [
            'visible' => true,
        ])
        ->assertForbidden();
});

test('authorized editors can toggle protected admin visibility and receive topic admin props', function () {
    $editor = User::query()->where('email', 'editor1@example.com')->firstOrFail();

    $publishedBlock = $this->topic->contentBlocks()->create([
        'region' => 'study',
        'block_type' => 'text',
        'title' => 'Published topic note',
        'body' => 'Editable topic note shown on the public topic page.',
        'data_json' => null,
        'sort_order' => 10,
        'status' => 'published',
    ]);

    $this->actingAs($editor)
        ->get($this->topicShowRoute)
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('adminContext.canAccess', true)
            ->where('adminContext.isVisible', false)
            ->where('adminContext.visibilityUrl', $this->visibilityRoute)
            ->where('admin', null),
        );

    $response = $this->actingAs($editor)
        ->from($this->topicShowRoute)
        ->post($this->visibilityRoute, [
            'visible' => true,
        ]);

    $response
        ->assertRedirect($this->topicShowRoute)
        ->assertCookie(AdminContext::VISIBILITY_COOKIE, '1');

    $this->actingAs($editor)
        ->withCookie(AdminContext::VISIBILITY_COOKIE, '1')
        ->get($this->topicShowRoute)
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('adminContext.canAccess', true)
            ->where('adminContext.isVisible', true)
            ->where('adminContext.visibilityUrl', $this->visibilityRoute)
            ->where('admin.details_update_href', $this->detailsUpdateRoute)
            ->where('admin.full_edit_href', $this->fullEditRoute)
            ->where(
                "admin.content_block_update_hrefs.{$publishedBlock->id}",
                route('scripture.topics.admin.content-blocks.update', [
                    'topic' => $this->topic,
                    'contentBlock' => $publishedBlock,
                ]),
            ),
        );

    $hideResponse = $this->actingAs($editor)
        ->from($this->topicShowRoute)
        ->post($this->visibilityRoute, [
            'visible' => false,
        ]);

    $hideResponse
        ->assertRedirect($this->topicShowRoute)
        ->assertCookieExpired(AdminContext::VISIBILITY_COOKIE);
});

test('authorized editors can update topic description', function () {
    $editor = User::query()->where('email', 'editor2@example.com')->firstOrFail();

    $this->actingAs($editor)
        ->from($this->topicShowRoute)
        ->patch($this->detailsUpdateRoute, [
            'description' => 'Updated public topic description from admin context.',
        ])
        ->assertRedirect($this->topicShowRoute);

    expect($this->topic->fresh()->description)
        ->toBe('Updated public topic description from admin context.');

    $this->actingAs($editor)
        ->get($this->topicShowRoute)
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where(
                'topic.description',
                'Updated public topic description from admin context.',
            ),
        );
});

test('authorized editors can manage topic note blocks while public topic page stays published only', function () {
    $editor = User::query()->where('email', 'editor3@example.com')->firstOrFail();

    $topic = Topic::query()->create([
        'slug' => 'karma-topic-admin',
        'name' => 'Karma Topic Admin',
        'description' => 'Topic used for admin-context block management tests.',
        'sort_order' => 99,
    ]);

    $showRoute = route('scripture.topics.show', $topic);
    $fullEditRoute = route('scripture.topics.admin.full-edit', $topic);
    $storeRoute = route('scripture.topics.admin.content-blocks.store', $topic);

    $publishedBlock = $topic->contentBlocks()->create([
        'region' => 'study',
        'block_type' => 'text',
        'title' => 'Published topic note',
        'body' => 'Visible on the public topic page.',
        'data_json' => null,
        'sort_order' => 1,
        'status' => 'published',
    ]);

    $draftBlock = $topic->contentBlocks()->create([
        'region' => 'study',
        'block_type' => 'text',
        'title' => 'Draft topic note',
        'body' => 'Still hidden publicly.',
        'data_json' => null,
        'sort_order' => 2,
        'status' => 'draft',
    ]);

    $this->actingAs($editor)
        ->from($fullEditRoute)
        ->post($storeRoute, [
            'title' => 'Fresh draft topic note',
            'body' => 'Created from the topic full editor.',
            'region' => 'study',
            'sort_order' => 3,
            'status' => 'draft',
        ])
        ->assertRedirect($fullEditRoute);

    $newDraftBlock = $topic->contentBlocks()
        ->where('title', 'Fresh draft topic note')
        ->firstOrFail();

    $this->actingAs($editor)
        ->from($fullEditRoute)
        ->patch(route('scripture.topics.admin.content-blocks.update', [
            'topic' => $topic,
            'contentBlock' => $draftBlock,
        ]), [
            'title' => 'Updated draft topic note',
            'body' => 'Still hidden publicly after update.',
            'region' => 'study',
            'sort_order' => 2,
            'status' => 'draft',
        ])
        ->assertRedirect($fullEditRoute);

    $this->actingAs($editor)
        ->get($fullEditRoute)
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('scripture/topics/full-edit')
            ->has('admin_content_blocks', 3)
            ->where('admin_content_blocks.0.title', 'Published topic note')
            ->where('admin_content_blocks.1.title', 'Updated draft topic note')
            ->where('admin_content_blocks.1.status', 'draft')
            ->where('admin_content_blocks.2.title', 'Fresh draft topic note')
            ->where('admin_content_blocks.2.status', 'draft'),
        );

    $this->get($showRoute)
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('content_blocks', 1)
            ->where('content_blocks.0.title', 'Published topic note'),
        );

    expect($newDraftBlock->status)->toBe('draft');
    expect($publishedBlock->status)->toBe('published');
});

test('content block update hard fails when the block is not owned by the current topic', function () {
    $editor = User::query()->where('email', 'admin@example.com')->firstOrFail();

    $foreignTopic = Topic::query()->create([
        'slug' => 'foreign-topic-admin',
        'name' => 'Foreign Topic Admin',
        'description' => 'A foreign topic for ownership checks.',
        'sort_order' => 100,
    ]);

    $foreignBlock = $foreignTopic->contentBlocks()->create([
        'region' => 'study',
        'block_type' => 'text',
        'title' => 'Other topic block',
        'body' => 'Not owned by the current topic.',
        'data_json' => null,
        'sort_order' => 1,
        'status' => 'draft',
    ]);

    $this->actingAs($editor)
        ->patch(route('scripture.topics.admin.content-blocks.update', [
            'topic' => $this->topic,
            'contentBlock' => $foreignBlock,
        ]), [
            'title' => 'Should not update',
            'body' => 'No change should happen.',
            'region' => 'study',
            'sort_order' => 1,
            'status' => 'draft',
        ])
        ->assertNotFound();

    expect(ContentBlock::query()->findOrFail($foreignBlock->id)->title)
        ->toBe('Other topic block');
});

test('phase one topic block editing is limited to topic owned text notes', function () {
    $editor = User::query()->where('email', 'admin@example.com')->firstOrFail();

    $topic = Topic::query()->create([
        'slug' => 'topic-note-scope',
        'name' => 'Topic Note Scope',
        'description' => 'Topic used to verify editable text-note limits.',
        'sort_order' => 101,
    ]);

    $showRoute = route('scripture.topics.show', $topic);
    $fullEditRoute = route('scripture.topics.admin.full-edit', $topic);

    $textBlock = $topic->contentBlocks()->create([
        'region' => 'study',
        'block_type' => 'text',
        'title' => 'Editable text note',
        'body' => 'This note should stay editable.',
        'data_json' => null,
        'sort_order' => 1,
        'status' => 'published',
    ]);

    $videoBlock = $topic->contentBlocks()->create([
        'region' => 'study',
        'block_type' => 'video',
        'title' => 'Protected video block',
        'body' => null,
        'data_json' => ['url' => 'https://example.test/topic-video.mp4'],
        'sort_order' => 2,
        'status' => 'published',
    ]);

    $this->actingAs($editor)
        ->withCookie(AdminContext::VISIBILITY_COOKIE, '1')
        ->get($showRoute)
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where(
                "admin.content_block_update_hrefs.{$textBlock->id}",
                route('scripture.topics.admin.content-blocks.update', [
                    'topic' => $topic,
                    'contentBlock' => $textBlock,
                ]),
            )
            ->missing("admin.content_block_update_hrefs.{$videoBlock->id}"),
        );

    $this->actingAs($editor)
        ->get($fullEditRoute)
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('admin_content_blocks', 1)
            ->where('admin_content_blocks.0.title', 'Editable text note')
            ->where('admin_content_blocks.0.block_type', 'text')
            ->where('next_content_block_sort_order', 3),
        );

    $this->actingAs($editor)
        ->patch(route('scripture.topics.admin.content-blocks.update', [
            'topic' => $topic,
            'contentBlock' => $videoBlock,
        ]), [
            'title' => 'Should stay protected',
            'body' => 'No update should be allowed.',
            'region' => 'study',
            'sort_order' => 2,
            'status' => 'published',
        ])
        ->assertNotFound();

    expect(ContentBlock::query()->findOrFail($videoBlock->id)->title)
        ->toBe('Protected video block');
});
