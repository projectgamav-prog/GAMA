<?php

namespace App\Http\Requests\Navigation;

class SiteNavigationItemUpdateRequest extends SiteNavigationItemRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return $this->baseRules();
    }
}
