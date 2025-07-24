<?php

namespace Modules\Publication\Services;

class PublicationFileService
{
    public function handleImageUpload($file): string
    {
        return $file->storeAs(
            'documentation/publication',
            now()->format('YmdHis') . '.' . $file->getClientOriginalExtension(),
            'public'
        );
    }
}
