<?php

namespace App\Admin\Conscious\Schema;

final class ConsciousProtectedCanonicalFieldPolicy
{
    public function assertCanUpdate(
        ConsciousSchemaFieldDefinition $field,
    ): void {
        abort_if(
            ! $field->canQuickEdit(),
            422,
            sprintf(
                '%s is protected or not available for safe field update.',
                $field->label,
            ),
        );
    }
}
