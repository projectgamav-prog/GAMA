<?php

use App\Models\Character;
use App\Models\ContentBlock;
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

    $this->character = Character::query()
        ->where('slug', 'arjuna')
        ->firstOrFail();

    $this->characterShowRoute = route('scripture.characters.show', $this->character);
    $this->detailsUpdateRoute = route(
        'scripture.characters.admin.details.update',
        $this->character,
    );
    $this->fullEditRoute = route(
        'scripture.characters.admin.full-edit',
        $this->character,
    );
    $this->contentBlockStoreRoute = route(
        'scripture.characters.admin.content-blocks.store',
        $this->character,
    );
    $this->visibilityRoute = route('scripture.admin-context.visibility.update');
});

test('guests and non editors cannot access protected character admin context', function () {
    $this->get($this->characterShowRoute)
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
        ->get($this->characterShowRoute)
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
            'description' => 'Blocked character update',
        ])
        ->assertForbidden();

    $this->actingAs($nonEditor)
        ->post($this->visibilityRoute, [
            'visible' => true,
        ])
        ->assertForbidden();
});

test('authorized editors can toggle protected admin visibility and receive character admin props', function () {
    $editor = User::query()->where('email', 'editor1@example.com')->firstOrFail();

    $publishedBlock = $this->character->contentBlocks()->create([
        'region' => 'study',
        'block_type' => 'text',
        'title' => 'Published character note',
        'body' => 'Editable character note shown on the public character page.',
        'data_json' => null,
        'sort_order' => 10,
        'status' => 'published',
    ]);

    $this->actingAs($editor)
        ->get($this->characterShowRoute)
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('adminContext.canAccess', true)
            ->where('adminContext.isVisible', false)
            ->where('adminContext.visibilityUrl', $this->visibilityRoute)
            ->where('admin', null),
        );

    $response = $this->actingAs($editor)
        ->from($this->characterShowRoute)
        ->post($this->visibilityRoute, [
            'visible' => true,
        ]);

    $response
        ->assertRedirect($this->characterShowRoute)
        ->assertCookie(AdminContext::VISIBILITY_COOKIE, '1');

    $this->actingAs($editor)
        ->withCookie(AdminContext::VISIBILITY_COOKIE, '1')
        ->get($this->characterShowRoute)
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('adminContext.canAccess', true)
            ->where('adminContext.isVisible', true)
            ->where('adminContext.visibilityUrl', $this->visibilityRoute)
            ->where('admin.details_update_href', $this->detailsUpdateRoute)
            ->where('admin.full_edit_href', $this->fullEditRoute)
            ->where(
                "admin.content_block_update_hrefs.{$publishedBlock->id}",
                route('scripture.characters.admin.content-blocks.update', [
                    'character' => $this->character,
                    'contentBlock' => $publishedBlock,
                ]),
            ),
        );

    $hideResponse = $this->actingAs($editor)
        ->from($this->characterShowRoute)
        ->post($this->visibilityRoute, [
            'visible' => false,
        ]);

    $hideResponse
        ->assertRedirect($this->characterShowRoute)
        ->assertCookieExpired(AdminContext::VISIBILITY_COOKIE);
});

test('authorized editors can update character description', function () {
    $editor = User::query()->where('email', 'editor2@example.com')->firstOrFail();

    $this->actingAs($editor)
        ->from($this->characterShowRoute)
        ->patch($this->detailsUpdateRoute, [
            'description' => 'Updated public character description from admin context.',
        ])
        ->assertRedirect($this->characterShowRoute);

    expect($this->character->fresh()->description)
        ->toBe('Updated public character description from admin context.');

    $this->actingAs($editor)
        ->get($this->characterShowRoute)
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where(
                'character.description',
                'Updated public character description from admin context.',
            ),
        );
});

test('authorized editors can manage character note blocks while public character page stays published only', function () {
    $editor = User::query()->where('email', 'editor3@example.com')->firstOrFail();

    $character = Character::query()->create([
        'slug' => 'krishna-character-admin',
        'name' => 'Krishna Character Admin',
        'description' => 'Character used for admin-context block management tests.',
        'sort_order' => 99,
    ]);

    $showRoute = route('scripture.characters.show', $character);
    $fullEditRoute = route('scripture.characters.admin.full-edit', $character);
    $storeRoute = route('scripture.characters.admin.content-blocks.store', $character);

    $publishedBlock = $character->contentBlocks()->create([
        'region' => 'study',
        'block_type' => 'text',
        'title' => 'Published character note',
        'body' => 'Visible on the public character page.',
        'data_json' => null,
        'sort_order' => 1,
        'status' => 'published',
    ]);

    $draftBlock = $character->contentBlocks()->create([
        'region' => 'study',
        'block_type' => 'text',
        'title' => 'Draft character note',
        'body' => 'Still hidden publicly.',
        'data_json' => null,
        'sort_order' => 2,
        'status' => 'draft',
    ]);

    $this->actingAs($editor)
        ->from($fullEditRoute)
        ->post($storeRoute, [
            'title' => 'Fresh draft character note',
            'body' => 'Created from the character full editor.',
            'region' => 'study',
            'sort_order' => 3,
            'status' => 'draft',
        ])
        ->assertRedirect($fullEditRoute);

    $newDraftBlock = $character->contentBlocks()
        ->where('title', 'Fresh draft character note')
        ->firstOrFail();

    $this->actingAs($editor)
        ->from($fullEditRoute)
        ->patch(route('scripture.characters.admin.content-blocks.update', [
            'character' => $character,
            'contentBlock' => $draftBlock,
        ]), [
            'title' => 'Updated draft character note',
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
            ->component('scripture/characters/full-edit')
            ->has('admin_content_blocks', 3)
            ->where('admin_content_blocks.0.title', 'Published character note')
            ->where('admin_content_blocks.1.title', 'Updated draft character note')
            ->where('admin_content_blocks.1.status', 'draft')
            ->where('admin_content_blocks.2.title', 'Fresh draft character note')
            ->where('admin_content_blocks.2.status', 'draft'),
        );

    $this->get($showRoute)
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('content_blocks', 1)
            ->where('content_blocks.0.title', 'Published character note'),
        );

    expect($newDraftBlock->status)->toBe('draft');
    expect($publishedBlock->status)->toBe('published');
});

test('content block update hard fails when the block is not owned by the current character', function () {
    $editor = User::query()->where('email', 'admin@example.com')->firstOrFail();

    $foreignCharacter = Character::query()->create([
        'slug' => 'foreign-character-admin',
        'name' => 'Foreign Character Admin',
        'description' => 'A foreign character for ownership checks.',
        'sort_order' => 100,
    ]);

    $foreignBlock = $foreignCharacter->contentBlocks()->create([
        'region' => 'study',
        'block_type' => 'text',
        'title' => 'Other character block',
        'body' => 'Not owned by the current character.',
        'data_json' => null,
        'sort_order' => 1,
        'status' => 'draft',
    ]);

    $this->actingAs($editor)
        ->patch(route('scripture.characters.admin.content-blocks.update', [
            'character' => $this->character,
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
        ->toBe('Other character block');
});

test('phase one character block editing is limited to character owned text notes', function () {
    $editor = User::query()->where('email', 'admin@example.com')->firstOrFail();

    $character = Character::query()->create([
        'slug' => 'character-note-scope',
        'name' => 'Character Note Scope',
        'description' => 'Character used to verify editable text-note limits.',
        'sort_order' => 101,
    ]);

    $showRoute = route('scripture.characters.show', $character);
    $fullEditRoute = route('scripture.characters.admin.full-edit', $character);

    $textBlock = $character->contentBlocks()->create([
        'region' => 'study',
        'block_type' => 'text',
        'title' => 'Editable text note',
        'body' => 'This note should stay editable.',
        'data_json' => null,
        'sort_order' => 1,
        'status' => 'published',
    ]);

    $videoBlock = $character->contentBlocks()->create([
        'region' => 'study',
        'block_type' => 'video',
        'title' => 'Protected video block',
        'body' => null,
        'data_json' => ['url' => 'https://example.test/character-video.mp4'],
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
                route('scripture.characters.admin.content-blocks.update', [
                    'character' => $character,
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
        ->patch(route('scripture.characters.admin.content-blocks.update', [
            'character' => $character,
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
