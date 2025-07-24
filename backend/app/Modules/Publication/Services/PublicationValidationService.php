<?php

namespace Modules\Publication\Services;

class PublicationValidationService
{
    public function validateYear(string $year): bool
    {
        return is_numeric($year) && $year > 0;
    }
}
