<?php

use App\Support\Scripture\BhagavadGitaJsonImporter;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('scripture:import-bhagavad-gita {path? : Relative or absolute path to a UTF-8 JSON dataset} {--dry-run : Validate the dataset without writing to the database}', function (?string $path = null) {
    try {
        $summary = app(BhagavadGitaJsonImporter::class)->import(
            $path ?? BhagavadGitaJsonImporter::DEFAULT_PATH,
            (bool) $this->option('dry-run'),
        );
    } catch (\Throwable $throwable) {
        $this->error($throwable->getMessage());

        return 1;
    }

    $mode = $summary['dry_run'] ? 'Validated' : 'Imported';

    $this->info(sprintf('%s dataset %s', $mode, $summary['dataset_key']));
    $this->line(sprintf('Path: %s', $summary['path']));
    $this->line(sprintf('Schema version: %d', $summary['schema_version']));

    foreach ($summary['counts'] as $type => $count) {
        $this->line(sprintf('%s: %d', $type, $count));
    }

    if (! $summary['dry_run']) {
        foreach ($summary['changes'] as $type => $states) {
            $this->line(sprintf(
                '%s changes: created=%d updated=%d unchanged=%d',
                $type,
                $states['created'],
                $states['updated'],
                $states['unchanged'],
            ));
        }
    }

    return 0;
})->purpose('Import a UTF-8 Bhagavad Gita JSON dataset into the canonical scripture tables');
