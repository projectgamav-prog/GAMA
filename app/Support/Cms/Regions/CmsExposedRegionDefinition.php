<?php

namespace App\Support\Cms\Regions;

final readonly class CmsExposedRegionDefinition
{
    public function __construct(
        public string $key,
        public string $label,
        public ?string $description,
        public string $pageTitle,
        public string $pageSlug,
        public string $returnTo,
    ) {}
}
