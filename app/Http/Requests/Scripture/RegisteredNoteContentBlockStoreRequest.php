<?php

namespace App\Http\Requests\Scripture;

abstract class RegisteredNoteContentBlockStoreRequest extends OrderedRegistryContentBlockStoreRequest
{
    /**
     * The chapter entity definition already owns the shared registered note
     * block field rules used by chapter, verse, and section intro blocks.
     */
    protected function adminEntityKey(): string
    {
        return 'chapter';
    }
}
