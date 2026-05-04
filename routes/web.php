<?php

use App\Http\Controllers\Admin\ConsciousFullEditController;
use App\Http\Controllers\Admin\ConsciousSchemaActionController;
use App\Http\Controllers\Admin\ConsciousSchemaFieldUpdateController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\HomeController;
use App\Http\Middleware\EnsureCanAccessAdminContext;
use Illuminate\Support\Facades\Route;

Route::get('/', HomeController::class)->name('home');

Route::get('dashboard', DashboardController::class)
    ->middleware('auth')
    ->name('dashboard');

Route::middleware(['auth', EnsureCanAccessAdminContext::class])
    ->prefix('admin/schema')
    ->name('admin.schema.')
    ->group(function () {
        Route::get(
            '{schemaFamily}/{entityType}/{id}/full-edit',
            [ConsciousFullEditController::class, 'show'],
        )->whereNumber('id')->name('full-edit');

        Route::patch(
            '{schemaFamily}/{entityType}/{id}/fields/{fieldName}',
            ConsciousSchemaFieldUpdateController::class,
        )->whereNumber('id')->name('fields.update');

        Route::post(
            '{schemaFamily}/{entityType}/{id}/actions/{actionKey}',
            ConsciousSchemaActionController::class,
        )->whereNumber('id')->name('actions.run');
    });

require __DIR__.'/cms.php';
require __DIR__.'/navigation.php';
require __DIR__.'/scripture.php';
require __DIR__.'/settings.php';
