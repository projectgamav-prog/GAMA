<?php

use App\Models\Character;
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

test('character public page no longer exposes character-specific admin props', function () {
    $editor = User::query()->where('email', 'editor1@example.com')->firstOrFail();

    $this->actingAs($editor)
        ->withCookie(AdminContext::VISIBILITY_COOKIE, '1')
        ->get($this->characterShowRoute)
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('adminContext.canAccess', true)
            ->where('adminContext.isVisible', true)
            ->where('adminContext.visibilityUrl', $this->visibilityRoute)
            ->where('admin', null),
        );
});

test('postponed character admin routes are unavailable while guards still apply', function () {
    $this->get($this->fullEditRoute)
        ->assertRedirect(route('login'));

    $nonEditor = User::factory()->create([
        'can_access_admin_context' => false,
    ]);

    $this->actingAs($nonEditor)
        ->get($this->fullEditRoute)
        ->assertForbidden();

    $editor = User::query()->where('email', 'editor2@example.com')->firstOrFail();

    $this->actingAs($editor)
        ->get($this->fullEditRoute)
        ->assertNotFound();

    $this->actingAs($editor)
        ->patch($this->detailsUpdateRoute, [
            'description' => 'This postponed route should stay unavailable.',
        ])
        ->assertNotFound();

    $this->actingAs($editor)
        ->post($this->contentBlockStoreRoute, [
            'title' => 'Postponed character note',
            'body' => 'This postponed route should stay unavailable.',
            'region' => 'study',
            'sort_order' => 1,
            'status' => 'draft',
        ])
        ->assertNotFound();
});
