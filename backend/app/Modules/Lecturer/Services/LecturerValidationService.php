<?php

namespace Modules\Lecturer\Services;

class LecturerValidationService
{
    public function validateUpdate(array $updateData): array
    {
        $type = $updateData['type'] ?? null;

        if ($type === 'video') {
            return $this->validateVideoType($updateData);
        }

        if ($type === 'file') {
            return $this->validateFileType($updateData);
        }

        return ['valid' => true];
    }

    private function validateVideoType(array $updateData): array
    {
        if (empty($updateData['youtube_link'])) {
            return [
                'valid' => false,
                'message' => 'Youtube link is required for video type'
            ];
        }

        return ['valid' => true];
    }

    private function validateFileType(array $updateData): array
    {
        if (empty($updateData['file'])) {
            return [
                'valid' => false,
                'message' => 'File is required for file type'
            ];
        }

        return ['valid' => true];
    }
}
