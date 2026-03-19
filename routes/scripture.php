<?php

use App\Http\Controllers\Scripture\BookController;
use App\Http\Controllers\Scripture\ChapterController;
use App\Http\Controllers\Scripture\ChapterVerseController;
use Illuminate\Support\Facades\Route;

Route::prefix('books')
    ->name('scripture.')
    ->scopeBindings()
    ->group(function () {
        Route::get('{book:slug}', [BookController::class, 'show'])
            ->name('books.show');

        Route::get(
            '{book:slug}/sections/{bookSection:slug}/chapters/{chapter:slug}',
            [ChapterController::class, 'show'],
        )->name('chapters.show');

        Route::get(
            '{book:slug}/sections/{bookSection:slug}/chapters/{chapter:slug}/verses',
            [ChapterVerseController::class, 'index'],
        )->name('chapters.verses.index');
    });
