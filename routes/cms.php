<?php

use App\Http\Controllers\Cms\PageAdminCreateController;
use App\Http\Controllers\Cms\PageAdminUpdateController;
use App\Http\Controllers\Cms\PageBlockAdminController;
use App\Http\Controllers\Cms\PageContainerAdminController;
use App\Http\Controllers\Cms\PageController;
use App\Http\Controllers\Cms\PageWorkspaceController;
use App\Http\Middleware\EnsureCanAccessAdminContext;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', EnsureCanAccessAdminContext::class])
    ->prefix('cms/pages')
    ->name('cms.pages.')
    ->scopeBindings()
    ->group(function () {
        Route::get('/', [PageWorkspaceController::class, 'index'])
            ->name('index');

        Route::post('/', [PageAdminCreateController::class, 'store'])
            ->name('store');

        Route::get('{page:slug}', [PageWorkspaceController::class, 'show'])
            ->name('show');

        Route::patch('{page:slug}', [PageAdminUpdateController::class, 'update'])
            ->name('update');

        Route::post('{page:slug}/containers', [PageContainerAdminController::class, 'store'])
            ->name('containers.store');

        Route::patch(
            '{page:slug}/containers/{pageContainer}',
            [PageContainerAdminController::class, 'update'],
        )->name('containers.update');

        Route::delete(
            '{page:slug}/containers/{pageContainer}',
            [PageContainerAdminController::class, 'destroy'],
        )->name('containers.destroy');

        Route::post(
            '{page:slug}/containers/{pageContainer}/blocks',
            [PageBlockAdminController::class, 'store'],
        )->name('containers.blocks.store');

        Route::patch(
            '{page:slug}/containers/{pageContainer}/blocks/{pageBlock}',
            [PageBlockAdminController::class, 'update'],
        )->name('containers.blocks.update');

        Route::delete(
            '{page:slug}/containers/{pageContainer}/blocks/{pageBlock}',
            [PageBlockAdminController::class, 'destroy'],
        )->name('containers.blocks.destroy');
    });

Route::get('pages/{page:slug}', [PageController::class, 'show'])
    ->name('pages.show');
