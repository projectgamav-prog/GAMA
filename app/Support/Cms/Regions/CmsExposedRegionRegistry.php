<?php

namespace App\Support\Cms\Regions;

use App\Models\Verse;
use Illuminate\Support\Str;

class CmsExposedRegionRegistry
{
    public function homePrimary(string $returnTo): CmsExposedRegionDefinition
    {
        return new CmsExposedRegionDefinition(
            'home-primary',
            'Home Page Region',
            'Supplementary CMS content on the public home page.',
            'Home Page Region',
            $this->slugFor('home-primary'),
            $returnTo,
        );
    }

    public function verseSupplementary(Verse $verse, string $returnTo): CmsExposedRegionDefinition
    {
        return new CmsExposedRegionDefinition(
            "scripture-verse-{$verse->id}-supplementary",
            'Verse Supplementary Region',
            'Supplementary CMS content below the canonical verse detail content.',
            "Verse {$verse->id} Supplementary Region",
            $this->slugFor("scripture-verse-{$verse->id}-supplementary"),
            $returnTo,
        );
    }

    public function definitionForKey(string $key, string $returnTo): ?CmsExposedRegionDefinition
    {
        if ($key === 'home-primary') {
            return $this->homePrimary($returnTo);
        }

        if (preg_match('/^scripture-verse-(\d+)-supplementary$/', $key, $matches) !== 1) {
            return null;
        }

        $verse = Verse::query()->find((int) $matches[1]);

        if (! $verse instanceof Verse) {
            return null;
        }

        return $this->verseSupplementary($verse, $returnTo);
    }

    private function slugFor(string $key): string
    {
        $base = Str::slug($key);

        return 'region-'.$base.'-'.substr(md5($key), 0, 6);
    }
}
