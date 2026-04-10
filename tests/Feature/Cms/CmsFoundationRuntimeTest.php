<?php

use App\Models\Page;
use App\Models\PageBlock;
use App\Models\PageContainer;
use App\Support\Cms\PageBlockOrdering;
use App\Support\Cms\PageContainerOrdering;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

function cmsForeignKeysFor(string $table): Collection
{
    return match (DB::getDriverName()) {
        'sqlite' => collect(DB::select("PRAGMA foreign_key_list('{$table}')")),
        'mysql' => collect(DB::select(
            <<<'SQL'
                SELECT
                    COLUMN_NAME AS `from`,
                    REFERENCED_TABLE_NAME AS `table`,
                    REFERENCED_COLUMN_NAME AS `to`,
                    DELETE_RULE AS on_delete
                FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
                JOIN INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS
                    ON REFERENTIAL_CONSTRAINTS.CONSTRAINT_SCHEMA = KEY_COLUMN_USAGE.TABLE_SCHEMA
                    AND REFERENTIAL_CONSTRAINTS.CONSTRAINT_NAME = KEY_COLUMN_USAGE.CONSTRAINT_NAME
                WHERE KEY_COLUMN_USAGE.TABLE_SCHEMA = DATABASE()
                    AND KEY_COLUMN_USAGE.TABLE_NAME = ?
                    AND KEY_COLUMN_USAGE.REFERENCED_TABLE_NAME IS NOT NULL
            SQL,
            [$table],
        )),
        default => collect(),
    };
}

function makePage(string $suffix): Page
{
    return Page::query()->create([
        'title' => "CMS Test {$suffix}",
        'slug' => "cms-test-{$suffix}",
        'status' => 'draft',
        'layout_key' => 'standard',
    ]);
}

function makeContainer(
    Page $page,
    string $label,
    int $sortOrder,
): PageContainer {
    return $page->pageContainers()->create([
        'label' => $label,
        'container_type' => 'card',
        'sort_order' => $sortOrder,
    ]);
}

function makeBlock(
    PageContainer $pageContainer,
    string $label,
    int $sortOrder,
): PageBlock {
    return $pageContainer->pageBlocks()->create([
        'module_key' => 'rich_text',
        'data_json' => [
            'debug_label' => $label,
            'html' => "<p>{$label}</p>",
        ],
        'config_json' => [
            'align' => 'left',
            'max_width' => 'content',
        ],
        'sort_order' => $sortOrder,
    ]);
}

function orderedContainerLabels(Page $page): array
{
    return $page->pageContainers()
        ->orderBy('sort_order')
        ->pluck('label')
        ->all();
}

function orderedBlockLabels(PageContainer $pageContainer): array
{
    return $pageContainer->pageBlocks()
        ->orderBy('sort_order')
        ->get()
        ->map(fn (PageBlock $pageBlock): ?string => $pageBlock->data_json['debug_label'] ?? null)
        ->all();
}

test('cms migrations create the expected tables and foreign keys', function () {
    expect(Schema::hasTable('pages'))->toBeTrue();
    expect(Schema::hasTable('page_containers'))->toBeTrue();
    expect(Schema::hasTable('page_blocks'))->toBeTrue();

    $containerForeignKey = cmsForeignKeysFor('page_containers')
        ->firstWhere('from', 'page_id');
    $blockForeignKey = cmsForeignKeysFor('page_blocks')
        ->firstWhere('from', 'page_container_id');

    expect($containerForeignKey)->not->toBeNull();
    expect(strtolower((string) $containerForeignKey->table))->toBe('pages');
    expect(strtolower((string) $containerForeignKey->to))->toBe('id');
    expect(strtoupper((string) $containerForeignKey->on_delete))->toBe('CASCADE');

    expect($blockForeignKey)->not->toBeNull();
    expect(strtolower((string) $blockForeignKey->table))->toBe('page_containers');
    expect(strtolower((string) $blockForeignKey->to))->toBe('id');
    expect(strtoupper((string) $blockForeignKey->on_delete))->toBe('CASCADE');
});

test('deleting a page cascades to its containers and blocks', function () {
    $page = makePage('cascade-page');
    $firstContainer = makeContainer($page, 'Hero', 1);
    $secondContainer = makeContainer($page, 'Details', 2);

    $firstBlock = makeBlock($firstContainer, 'Hero body', 1);
    $secondBlock = makeBlock($secondContainer, 'Details body', 1);

    $page->delete();

    expect(Page::query()->count())->toBe(0);
    expect(PageContainer::query()->count())->toBe(0);
    expect(PageBlock::query()->count())->toBe(0);
    expect(PageContainer::query()->whereKey($firstContainer->id)->exists())->toBeFalse();
    expect(PageBlock::query()->whereKey($firstBlock->id)->exists())->toBeFalse();
    expect(PageBlock::query()->whereKey($secondBlock->id)->exists())->toBeFalse();
});

test('deleting a container removes only its blocks and keeps container ordering movable', function () {
    $page = makePage('container-delete');
    $firstContainer = makeContainer($page, 'Intro', 1);
    $middleContainer = makeContainer($page, 'Middle', 2);
    $lastContainer = makeContainer($page, 'Outro', 3);

    $introBlock = makeBlock($firstContainer, 'Intro block', 1);
    $middleBlockA = makeBlock($middleContainer, 'Middle A', 1);
    $middleBlockB = makeBlock($middleContainer, 'Middle B', 2);
    $outroBlock = makeBlock($lastContainer, 'Outro block', 1);

    $ordering = app(PageContainerOrdering::class);

    $ordering->remove($page, $middleContainer);

    expect(PageContainer::query()->whereKey($middleContainer->id)->exists())->toBeFalse();
    expect(PageBlock::query()->whereKey($middleBlockA->id)->exists())->toBeFalse();
    expect(PageBlock::query()->whereKey($middleBlockB->id)->exists())->toBeFalse();
    expect(PageBlock::query()->whereKey($introBlock->id)->exists())->toBeTrue();
    expect(PageBlock::query()->whereKey($outroBlock->id)->exists())->toBeTrue();

    expect(orderedContainerLabels($page))->toBe(['Intro', 'Outro']);
    expect(
        $page->pageContainers()->orderBy('sort_order')->pluck('sort_order')->all(),
    )->toBe([1, 2]);

    $firstFreshContainer = $page->pageContainers()
        ->orderBy('sort_order')
        ->firstOrFail();

    expect($ordering->moveDown($page, $firstFreshContainer))->toBeTrue();
    expect(orderedContainerLabels($page))->toBe(['Outro', 'Intro']);

    $introFreshContainer = $page->pageContainers()
        ->where('label', 'Intro')
        ->firstOrFail();

    expect($ordering->moveUp($page, $introFreshContainer))->toBeTrue();
    expect(orderedContainerLabels($page))->toBe(['Intro', 'Outro']);
});

test('deleting a block keeps unrelated ordering stable and block moves still work after delete', function () {
    $page = makePage('block-delete');
    $primaryContainer = makeContainer($page, 'Primary', 1);
    $secondaryContainer = makeContainer($page, 'Secondary', 2);

    $firstBlock = makeBlock($primaryContainer, 'First', 1);
    $deletedBlock = makeBlock($primaryContainer, 'Second', 2);
    $thirdBlock = makeBlock($primaryContainer, 'Third', 3);
    $fourthBlock = makeBlock($primaryContainer, 'Fourth', 4);

    makeBlock($secondaryContainer, 'Secondary A', 1);
    makeBlock($secondaryContainer, 'Secondary B', 2);

    $ordering = app(PageBlockOrdering::class);

    $ordering->remove($primaryContainer, $deletedBlock);

    expect(PageBlock::query()->whereKey($deletedBlock->id)->exists())->toBeFalse();
    expect(orderedBlockLabels($primaryContainer))->toBe([
        'First',
        'Third',
        'Fourth',
    ]);
    expect(
        $primaryContainer->pageBlocks()->orderBy('sort_order')->pluck('sort_order')->all(),
    )->toBe([1, 2, 3]);
    expect(orderedBlockLabels($secondaryContainer))->toBe([
        'Secondary A',
        'Secondary B',
    ]);
    expect(
        $secondaryContainer->pageBlocks()->orderBy('sort_order')->pluck('sort_order')->all(),
    )->toBe([1, 2]);

    expect(
        $ordering->moveDown(
            $primaryContainer->fresh(),
            PageBlock::query()->findOrFail($firstBlock->id),
        ),
    )->toBeTrue();
    expect(orderedBlockLabels($primaryContainer->fresh()))->toBe([
        'Third',
        'First',
        'Fourth',
    ]);

    expect(
        $ordering->moveUp(
            $primaryContainer->fresh(),
            PageBlock::query()->findOrFail($firstBlock->id),
        ),
    )->toBeTrue();
    expect(orderedBlockLabels($primaryContainer->fresh()))->toBe([
        'First',
        'Third',
        'Fourth',
    ]);
    expect(PageBlock::query()->whereKey($thirdBlock->id)->exists())->toBeTrue();
    expect(PageBlock::query()->whereKey($fourthBlock->id)->exists())->toBeTrue();
});
