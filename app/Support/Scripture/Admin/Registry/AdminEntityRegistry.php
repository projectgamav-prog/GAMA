<?php

namespace App\Support\Scripture\Admin\Registry;

use App\Support\Scripture\Admin\Registry\Definitions\AdminEntityDefinitionProvider;
use App\Support\Scripture\Admin\Registry\Definitions\BookAdminEntityDefinitionProvider;
use App\Support\Scripture\Admin\Registry\Definitions\ChapterAdminEntityDefinitionProvider;
use App\Support\Scripture\Admin\Registry\Definitions\CharacterAdminEntityDefinitionProvider;
use App\Support\Scripture\Admin\Registry\Definitions\TopicAdminEntityDefinitionProvider;
use App\Support\Scripture\Admin\Registry\Definitions\VerseAdminEntityDefinitionProvider;

class AdminEntityRegistry
{
    /**
     * @var array<string, AdminEntityDefinition>|null
     */
    private ?array $definitions = null;

    public function definition(string $key): AdminEntityDefinition
    {
        $definitions = $this->definitions();

        if (! array_key_exists($key, $definitions)) {
            throw new \InvalidArgumentException("Admin entity [{$key}] is not registered.");
        }

        return $definitions[$key];
    }

    /**
     * @return array<string, AdminEntityDefinition>
     */
    public function definitions(): array
    {
        if ($this->definitions !== null) {
            return $this->definitions;
        }

        $definitions = [];

        foreach ($this->providers() as $provider) {
            $definitions[$provider->key()] = $provider->definition();
        }

        return $this->definitions = $definitions;
    }

    /**
     * @return list<AdminEntityDefinitionProvider>
     */
    private function providers(): array
    {
        return [
            new BookAdminEntityDefinitionProvider(),
            new ChapterAdminEntityDefinitionProvider(),
            new VerseAdminEntityDefinitionProvider(),
            new TopicAdminEntityDefinitionProvider(),
            new CharacterAdminEntityDefinitionProvider(),
        ];
    }
}
