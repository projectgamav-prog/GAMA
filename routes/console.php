<?php

use App\Support\Scripture\ScriptureJsonImporter;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('scripture:import {target? : Book slug or relative/absolute chapter JSON path} {--dry-run : Validate the dataset without writing to the database}', function (?string $target = null) {
    try {
        $summary = app(ScriptureJsonImporter::class)->import(
            $target,
            (bool) $this->option('dry-run'),
        );
    } catch (\Throwable $throwable) {
        $this->error($throwable->getMessage());

        return 1;
    }

    $mode = $summary['dry_run'] ? 'Validated' : 'Imported';

    $this->info(sprintf('%s scripture import (%s)', $mode, $summary['mode']));
    $this->line(sprintf('Target: %s', $summary['target']));
    $this->line(sprintf('Schema version: %d', $summary['schema_version']));
    $this->line(sprintf('Processed books: %d', $summary['processed_books']));
    $this->line(sprintf('Processed files: %d', $summary['processed_files']));

    foreach ($summary['counts'] as $type => $count) {
        $this->line(sprintf('%s: %d', $type, $count));
    }

    if (! $summary['dry_run']) {
        foreach ($summary['changes'] as $type => $states) {
            $formattedStates = collect($states)
                ->map(fn (int $count, string $state): string => sprintf('%s=%d', $state, $count))
                ->implode(' ');

            $this->line(sprintf('%s changes: %s', $type, $formattedStates));
        }
    }

    return 0;
})->purpose('Import scripture JSON data into the canonical scripture tables');

Artisan::command('scripture:import-bhagavad-gita {path? : Relative or absolute path to a UTF-8 JSON chapter dataset} {--dry-run : Validate the dataset without writing to the database}', function (?string $path = null) {
    return $this->call('scripture:import', [
        'target' => $path ?? 'bhagavad-gita',
        '--dry-run' => (bool) $this->option('dry-run'),
    ]);
})->purpose('Deprecated wrapper for importing Bhagavad Gita scripture JSON data');
