<?php

namespace Modules\ResearchProgress\Services;

use Illuminate\Support\Facades\Storage;

class ProgressImageFileService
{
    public function storeImageFile($file, $index): string
    {
        return $file->storeAs(
            'documentation',
            now()->format('YmdHis') . "_{$index}." . $file->getClientOriginalExtension(),
            'public'
        );
    }

    public function deleteImageFile(?string $imagePath): bool
    {
        if ($imagePath && Storage::disk('public')->exists($imagePath)) {
            return Storage::disk('public')->delete($imagePath);
        }

        return false;
    }
}
