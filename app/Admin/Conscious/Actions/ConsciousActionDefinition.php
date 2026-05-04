<?php

namespace App\Admin\Conscious\Actions;

use Illuminate\Database\Eloquent\Model;

final readonly class ConsciousActionDefinition
{
    /**
     * @param  class-string<Model>  $modelClass
     * @param  class-string<ConsciousActionHandler>|null  $handlerClass
     */
    public function __construct(
        public string $schemaFamily,
        public string $entityType,
        public string $modelClass,
        public string $actionKey,
        public string $label,
        public string $actionKind,
        public string $riskLevel,
        public bool $enabled,
        public bool $requiresExplicitPolicy,
        public ?string $policyKey = null,
        public ?string $handlerClass = null,
        public ?string $disabledReason = null,
    ) {}

    public function key(): string
    {
        return self::makeKey($this->schemaFamily, $this->entityType, $this->actionKey);
    }

    public static function makeKey(string $schemaFamily, string $entityType, string $actionKey): string
    {
        return sprintf('%s:%s:%s', $schemaFamily, $entityType, $actionKey);
    }
}
