<?php

use App\Models\Page;
use App\Models\PageContainer;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->withoutVite();

    $this->pageRecord = Page::query()->create([
        'title' => 'Live Composition Page',
        'slug' => 'live-composition-page',
        'status' => 'published',
        'layout_key' => 'standard',
    ]);

    $this->container = $this->pageRecord->pageContainers()->create([
        'label' => 'Hero',
        'container_type' => 'card',
        'sort_order' => 1,
    ]);

    $this->block = $this->container->pageBlocks()->create([
        'module_key' => 'rich_text',
        'data_json' => [
            'html' => '<p>Live content</p>',
        ],
        'config_json' => [
            'align' => 'left',
            'max_width' => 'content',
        ],
        'sort_order' => 1,
    ]);

    $this->publicRoute = route('pages.show', $this->pageRecord);
});

test('public cms page does not expose live composition payload to guests', function () {
    $this->get($this->publicRoute)
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('cms/pages/public-show')
            ->where('isAdmin', false)
            ->where('admin', null)
            ->where('page.slug', 'live-composition-page')
            ->has('containers', 1),
        );
});

test('public cms page exposes live composition payload to permitted users', function () {
    $editor = User::factory()->create([
        'can_access_admin_context' => true,
    ]);

    $this->actingAs($editor)
        ->get($this->publicRoute)
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('cms/pages/public-show')
            ->where('isAdmin', true)
            ->where('page.slug', 'live-composition-page')
            ->where('admin.page.workspace_href', route('cms.pages.show', $this->pageRecord, false))
            ->where('admin.page.container_store_href', route('cms.pages.containers.store', $this->pageRecord, false))
            ->where('admin.containers.0.id', $this->container->id)
            ->where(
                'admin.containers.0.block_store_href',
                route('cms.pages.containers.blocks.store', [
                    'page' => $this->pageRecord,
                    'pageContainer' => $this->container,
                ], false),
            )
            ->where('admin.containers.0.blocks.0.id', $this->block->id),
        );
});
