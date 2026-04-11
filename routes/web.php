<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\HomeController;
use Illuminate\Support\Facades\Route;

Route::get('/', HomeController::class)->name('home');

Route::get('dashboard', DashboardController::class)
    ->middleware('auth')
    ->name('dashboard');

require __DIR__.'/cms.php';
require __DIR__.'/navigation.php';
require __DIR__.'/scripture.php';
require __DIR__.'/settings.php';
