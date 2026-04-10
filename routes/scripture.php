<?php

use App\Http\Controllers\Scripture\AdminContextVisibilityController;
use App\Http\Controllers\Scripture\BookAdminContentBlockController;
use App\Http\Controllers\Scripture\BookAdminCreateController;
use App\Http\Controllers\Scripture\BookAdminDeleteController;
use App\Http\Controllers\Scripture\BookAdminDetailsController;
use App\Http\Controllers\Scripture\BookAdminIdentityController;
use App\Http\Controllers\Scripture\BookAdminMediaAssignmentController;
use App\Http\Controllers\Scripture\BookCanonicalEditController;
use App\Http\Controllers\Scripture\BookController;
use App\Http\Controllers\Scripture\BookFullEditController;
use App\Http\Controllers\Scripture\BookSectionAdminCreateController;
use App\Http\Controllers\Scripture\BookSectionAdminContentBlockController;
use App\Http\Controllers\Scripture\BookSectionAdminDeleteController;
use App\Http\Controllers\Scripture\BookSectionAdminDetailsController;
use App\Http\Controllers\Scripture\ChapterAdminContentBlockController;
use App\Http\Controllers\Scripture\ChapterAdminCreateController;
use App\Http\Controllers\Scripture\ChapterAdminDeleteController;
use App\Http\Controllers\Scripture\ChapterAdminIdentityController;
use App\Http\Controllers\Scripture\ChapterSectionAdminCreateController;
use App\Http\Controllers\Scripture\ChapterSectionAdminContentBlockController;
use App\Http\Controllers\Scripture\ChapterSectionAdminDeleteController;
use App\Http\Controllers\Scripture\ChapterSectionAdminDetailsController;
use App\Http\Controllers\Scripture\ChapterController;
use App\Http\Controllers\Scripture\ChapterFullEditController;
use App\Http\Controllers\Scripture\CharacterController;
use App\Http\Controllers\Scripture\DictionaryEntryController;
use App\Http\Controllers\Scripture\PostponedAdminSurfaceController;
use App\Http\Controllers\Scripture\TopicController;
use App\Http\Controllers\Scripture\VerseAdminContentBlockController;
use App\Http\Controllers\Scripture\VerseAdminCommentaryController;
use App\Http\Controllers\Scripture\VerseAdminCreateController;
use App\Http\Controllers\Scripture\VerseAdminDeleteController;
use App\Http\Controllers\Scripture\VerseAdminIdentityController;
use App\Http\Controllers\Scripture\VerseAdminMetaController;
use App\Http\Controllers\Scripture\VerseAdminTranslationController;
use App\Http\Controllers\Scripture\VerseController;
use App\Http\Controllers\Scripture\VerseFullEditController;
use App\Http\Middleware\EnsureCanAccessAdminContext;
use Illuminate\Support\Facades\Route;

Route::get('characters', [CharacterController::class, 'index'])
    ->name('scripture.characters.index');

Route::get('characters/{character:slug}', [CharacterController::class, 'show'])
    ->name('scripture.characters.show');

// Character admin remains a postponed proof surface. Keep route names stable,
// but disable the workflow while the active CMS scope focuses on scripture pages.
Route::middleware(['auth', EnsureCanAccessAdminContext::class])
    ->prefix('characters/{character:slug}/admin')
    ->name('scripture.characters.admin.')
    ->group(function () {
        Route::get('full-edit', PostponedAdminSurfaceController::class)
            ->name('full-edit');

        Route::patch('details', PostponedAdminSurfaceController::class)
            ->name('details.update');

        Route::post('content-blocks', PostponedAdminSurfaceController::class)
            ->name('content-blocks.store');

        Route::patch(
            'content-blocks/{contentBlock}',
            PostponedAdminSurfaceController::class,
        )->name('content-blocks.update');
    });

Route::get('dictionary', [DictionaryEntryController::class, 'index'])
    ->name('scripture.dictionary.index');

Route::get('dictionary/{dictionaryEntry:slug}', [DictionaryEntryController::class, 'show'])
    ->name('scripture.dictionary.show');

Route::get('topics', [TopicController::class, 'index'])
    ->name('scripture.topics.index');

Route::get('topics/{topic:slug}', [TopicController::class, 'show'])
    ->name('scripture.topics.show');

// Topic admin remains a postponed proof surface. Keep route names stable,
// but disable the workflow while the active CMS scope focuses on scripture pages.
Route::middleware(['auth', EnsureCanAccessAdminContext::class])
    ->prefix('topics/{topic:slug}/admin')
    ->name('scripture.topics.admin.')
    ->group(function () {
        Route::get('full-edit', PostponedAdminSurfaceController::class)
            ->name('full-edit');

        Route::patch('details', PostponedAdminSurfaceController::class)
            ->name('details.update');

        Route::post('content-blocks', PostponedAdminSurfaceController::class)
            ->name('content-blocks.store');

        Route::patch(
            'content-blocks/{contentBlock}',
            PostponedAdminSurfaceController::class,
        )->name('content-blocks.update');
    });

Route::middleware(['auth', EnsureCanAccessAdminContext::class])
    ->prefix('scripture/admin-context')
    ->name('scripture.admin-context.')
    ->group(function () {
        Route::post('visibility', [AdminContextVisibilityController::class, 'update'])
            ->name('visibility.update');
    });

Route::prefix('books')
    ->name('scripture.')
    ->scopeBindings()
    ->group(function () {
        Route::get('/', [BookController::class, 'index'])
            ->name('books.index');

        Route::get('{book:slug}', [BookController::class, 'show'])
            ->name('books.show');

        Route::middleware(['auth', EnsureCanAccessAdminContext::class])
            ->prefix('admin')
            ->name('books.admin.')
            ->group(function () {
                Route::post('/', [BookAdminCreateController::class, 'store'])
                    ->name('store');
            });

        Route::middleware(['auth', EnsureCanAccessAdminContext::class])
            ->prefix('{book:slug}/admin')
            ->name('books.admin.')
            ->group(function () {
                Route::get('full-edit', [BookFullEditController::class, 'show'])
                    ->name('full-edit');

                Route::get('canonical-edit', [BookCanonicalEditController::class, 'show'])
                    ->name('canonical-edit');

                Route::patch('identity', [BookAdminIdentityController::class, 'update'])
                    ->name('identity.update');

                Route::patch('details', [BookAdminDetailsController::class, 'update'])
                    ->name('details.update');

                Route::delete('', [BookAdminDeleteController::class, 'destroy'])
                    ->name('destroy');

                // Transitional fallback only: protected full-edit maintenance
                // for already-saved book editorial blocks.
                Route::post('content-blocks', [BookAdminContentBlockController::class, 'store'])
                    ->name('content-blocks.store');

                Route::patch(
                    'content-blocks/{contentBlock}',
                    [BookAdminContentBlockController::class, 'update'],
                )->name('content-blocks.update');

                Route::post(
                    'content-blocks/{contentBlock}/move-up',
                    [BookAdminContentBlockController::class, 'moveUp'],
                )->name('content-blocks.move-up');

                Route::post(
                    'content-blocks/{contentBlock}/move-down',
                    [BookAdminContentBlockController::class, 'moveDown'],
                )->name('content-blocks.move-down');

                Route::post(
                    'content-blocks/{contentBlock}/move',
                    [BookAdminContentBlockController::class, 'move'],
                )->name('content-blocks.move');

                Route::post(
                    'content-blocks/{contentBlock}/duplicate',
                    [BookAdminContentBlockController::class, 'duplicate'],
                )->name('content-blocks.duplicate');

                Route::delete(
                    'content-blocks/{contentBlock}',
                    [BookAdminContentBlockController::class, 'destroy'],
                )->name('content-blocks.destroy');

                Route::post(
                    'media-assignments',
                    [BookAdminMediaAssignmentController::class, 'store'],
                )->name('media-assignments.store');

                Route::patch(
                    'media-assignments/{mediaAssignment}',
                    [BookAdminMediaAssignmentController::class, 'update'],
                )->name('media-assignments.update');

                Route::delete(
                    'media-assignments/{mediaAssignment}',
                    [BookAdminMediaAssignmentController::class, 'destroy'],
                )->name('media-assignments.destroy');
            });

        Route::middleware(['auth', EnsureCanAccessAdminContext::class])
            ->prefix('{book:slug}/sections/admin')
            ->name('book-sections.admin.')
            ->group(function () {
                Route::post('/', [BookSectionAdminCreateController::class, 'store'])
                    ->name('store');
            });

        Route::get(
            '{book:slug}/sections/{bookSection:slug}/chapters/{chapter:slug}',
            [ChapterController::class, 'show'],
        )->name('chapters.show');

        Route::middleware(['auth', EnsureCanAccessAdminContext::class])
            ->prefix('{book:slug}/sections/{bookSection:slug}/admin')
            ->name('book-sections.admin.')
            ->group(function () {
                Route::patch('details', [BookSectionAdminDetailsController::class, 'update'])
                    ->name('details.update');

                Route::delete('', [BookSectionAdminDeleteController::class, 'destroy'])
                    ->name('destroy');

                Route::post(
                    'content-blocks',
                    [BookSectionAdminContentBlockController::class, 'store'],
                )->name('content-blocks.store');

                Route::patch(
                    'content-blocks/{contentBlock}',
                    [BookSectionAdminContentBlockController::class, 'update'],
                )->name('content-blocks.update');

                Route::delete(
                    'content-blocks/{contentBlock}',
                    [BookSectionAdminContentBlockController::class, 'destroy'],
                )->name('content-blocks.destroy');
            });

        Route::middleware(['auth', EnsureCanAccessAdminContext::class])
            ->prefix('{book:slug}/sections/{bookSection:slug}/chapters/admin')
            ->name('chapters.admin.')
            ->group(function () {
                Route::post('/', [ChapterAdminCreateController::class, 'store'])
                    ->name('store');
            });

        Route::middleware(['auth', EnsureCanAccessAdminContext::class])
            ->prefix('{book:slug}/sections/{bookSection:slug}/chapters/{chapter:slug}/admin')
            ->name('chapters.admin.')
            ->group(function () {
                Route::get('full-edit', [ChapterFullEditController::class, 'show'])
                    ->name('full-edit');

                Route::patch('identity', [ChapterAdminIdentityController::class, 'update'])
                    ->name('identity.update');

                Route::delete('', [ChapterAdminDeleteController::class, 'destroy'])
                    ->name('destroy');

                // Transitional fallback only: protected full-edit maintenance
                // for already-saved chapter editorial blocks.
                Route::post('content-blocks', [ChapterAdminContentBlockController::class, 'store'])
                    ->name('content-blocks.store');

                Route::patch(
                    'content-blocks/{contentBlock}',
                    [ChapterAdminContentBlockController::class, 'update'],
                )->name('content-blocks.update');

                Route::post(
                    'content-blocks/{contentBlock}/move-up',
                    [ChapterAdminContentBlockController::class, 'moveUp'],
                )->name('content-blocks.move-up');

                Route::post(
                    'content-blocks/{contentBlock}/move-down',
                    [ChapterAdminContentBlockController::class, 'moveDown'],
                )->name('content-blocks.move-down');

                Route::post(
                    'content-blocks/{contentBlock}/move',
                    [ChapterAdminContentBlockController::class, 'move'],
                )->name('content-blocks.move');

                Route::post(
                    'content-blocks/{contentBlock}/duplicate',
                    [ChapterAdminContentBlockController::class, 'duplicate'],
                )->name('content-blocks.duplicate');

                Route::delete(
                    'content-blocks/{contentBlock}',
                    [ChapterAdminContentBlockController::class, 'destroy'],
                )->name('content-blocks.destroy');
            });

        Route::middleware(['auth', EnsureCanAccessAdminContext::class])
            ->prefix(
                '{book:slug}/sections/{bookSection:slug}/chapters/{chapter:slug}/sections/admin',
            )
            ->name('chapter-sections.admin.')
            ->group(function () {
                Route::post('/', [ChapterSectionAdminCreateController::class, 'store'])
                    ->name('store');
            });

        Route::middleware(['auth', EnsureCanAccessAdminContext::class])
            ->prefix(
                '{book:slug}/sections/{bookSection:slug}/chapters/{chapter:slug}/sections/{chapterSection:slug}/admin',
            )
            ->name('chapter-sections.admin.')
            ->group(function () {
                Route::patch('details', [ChapterSectionAdminDetailsController::class, 'update'])
                    ->name('details.update');

                Route::delete('', [ChapterSectionAdminDeleteController::class, 'destroy'])
                    ->name('destroy');

                Route::post(
                    'content-blocks',
                    [ChapterSectionAdminContentBlockController::class, 'store'],
                )->name('content-blocks.store');

                Route::patch(
                    'content-blocks/{contentBlock}',
                    [ChapterSectionAdminContentBlockController::class, 'update'],
                )->name('content-blocks.update');

                Route::delete(
                    'content-blocks/{contentBlock}',
                    [ChapterSectionAdminContentBlockController::class, 'destroy'],
                )->name('content-blocks.destroy');
            });

        Route::get(
            '{book:slug}/sections/{bookSection:slug}/chapters/{chapter:slug}/sections/{chapterSection:slug}/verses/{verse:slug}',
            [VerseController::class, 'show'],
        )->name('chapters.verses.show');

        Route::middleware(['auth', EnsureCanAccessAdminContext::class])
            ->prefix(
                '{book:slug}/sections/{bookSection:slug}/chapters/{chapter:slug}/sections/{chapterSection:slug}/verses/admin',
            )
            ->name('chapters.verses.admin.')
            ->group(function () {
                Route::post('/', [VerseAdminCreateController::class, 'store'])
                    ->name('store');
            });

        Route::middleware(['auth', EnsureCanAccessAdminContext::class])
            ->prefix(
                '{book:slug}/sections/{bookSection:slug}/chapters/{chapter:slug}/sections/{chapterSection:slug}/verses/{verse:slug}/admin',
            )
            ->name('chapters.verses.admin.')
            ->group(function () {
                Route::get('full-edit', [VerseFullEditController::class, 'show'])
                    ->name('full-edit');

                Route::patch('identity', [VerseAdminIdentityController::class, 'update'])
                    ->name('identity.update');

                Route::delete('', [VerseAdminDeleteController::class, 'destroy'])
                    ->name('destroy');

                Route::patch('meta', [VerseAdminMetaController::class, 'update'])
                    ->name('meta.update');

                Route::post('translations', [VerseAdminTranslationController::class, 'store'])
                    ->name('translations.store');

                Route::patch(
                    'translations/{translation}',
                    [VerseAdminTranslationController::class, 'update'],
                )->name('translations.update');

                Route::delete(
                    'translations/{translation}',
                    [VerseAdminTranslationController::class, 'destroy'],
                )->name('translations.destroy');

                Route::post('commentaries', [VerseAdminCommentaryController::class, 'store'])
                    ->name('commentaries.store');

                Route::patch(
                    'commentaries/{commentary}',
                    [VerseAdminCommentaryController::class, 'update'],
                )->name('commentaries.update');

                Route::delete(
                    'commentaries/{commentary}',
                    [VerseAdminCommentaryController::class, 'destroy'],
                )->name('commentaries.destroy');

                // Transitional fallback only: protected full-edit maintenance
                // for already-saved verse note blocks.
                Route::post('content-blocks', [VerseAdminContentBlockController::class, 'store'])
                    ->name('content-blocks.store');

                Route::patch(
                    'content-blocks/{contentBlock}',
                    [VerseAdminContentBlockController::class, 'update'],
                )->name('content-blocks.update');

                Route::post(
                    'content-blocks/{contentBlock}/move-up',
                    [VerseAdminContentBlockController::class, 'moveUp'],
                )->name('content-blocks.move-up');

                Route::post(
                    'content-blocks/{contentBlock}/move-down',
                    [VerseAdminContentBlockController::class, 'moveDown'],
                )->name('content-blocks.move-down');

                Route::post(
                    'content-blocks/{contentBlock}/move',
                    [VerseAdminContentBlockController::class, 'move'],
                )->name('content-blocks.move');

                Route::post(
                    'content-blocks/{contentBlock}/duplicate',
                    [VerseAdminContentBlockController::class, 'duplicate'],
                )->name('content-blocks.duplicate');

                Route::delete(
                    'content-blocks/{contentBlock}',
                    [VerseAdminContentBlockController::class, 'destroy'],
                )->name('content-blocks.destroy');
            });
    });
