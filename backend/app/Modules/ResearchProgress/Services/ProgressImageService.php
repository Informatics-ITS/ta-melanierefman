<?php

namespace Modules\ResearchProgress\Services;

use Modules\ResearchProgress\Models\ProgressImage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProgressImageService
{
    protected $progressImageFileService;

    public function __construct(ProgressImageFileService $progressImageFileService)
    {
        $this->progressImageFileService = $progressImageFileService;
    }

    public function createProgressImages($progressId, array $images, Request $request)
    {
        foreach ($images as $index => $imgData) {
            $file = $request->file("images.$index.image");

            $filePath = $this->progressImageFileService->storeImageFile($file, $index);

            ProgressImage::create([
                'progress_research_id' => $progressId,
                'image' => $filePath,
                'keterangan' => $imgData['keterangan'],
                'caption' => $imgData['caption'],
                'index_order' => $imgData['index_order'],
            ]);
        }
    }

    public function updateProgressImages($progressId, Request $request)
    {
        $existingImageIds = collect($request->input('images', []))
            ->pluck('id')
            ->filter()
            ->toArray();

        $this->deleteUnusedImages($progressId, $existingImageIds);

        foreach ($request->input('images', []) as $index => $imgData) {
            $existingId = $imgData['id'] ?? null;
            $file = $request->file("images.$index.image");
            $imagePath = null;

            if ($file) {
                $imagePath = $this->progressImageFileService->storeImageFile($file, $index);
            }

            if ($existingId) {
                $this->updateExistingImage($existingId, $file, $imagePath, $imgData);
            } else {
                $this->createNewImage($progressId, $file, $imagePath, $imgData);
            }
        }
    }

    private function deleteUnusedImages($progressId, array $existingImageIds)
    {
        ProgressImage::where('progress_research_id', $progressId)
            ->whereNotIn('id', $existingImageIds)
            ->each(function ($image) {
                $this->progressImageFileService->deleteImageFile($image->image);
                $image->delete();
            });
    }

    private function updateExistingImage($existingId, $file, $imagePath, array $imgData)
    {
        $progressImage = ProgressImage::find($existingId);
        if ($progressImage) {
            if ($file && $progressImage->image) {
                $this->progressImageFileService->deleteImageFile($progressImage->image);
            }

            $progressImage->update([
                'image' => $imagePath ?? $progressImage->image,
                'caption' => $imgData['caption'] ?? $progressImage->caption,
                'keterangan' => $imgData['keterangan'] ?? $progressImage->keterangan,
                'index_order' => $imgData['index_order'] ?? $progressImage->index_order,
            ]);
        }
    }

    private function createNewImage($progressId, $file, $imagePath, array $imgData)
    {
        if ($file) {
            ProgressImage::create([
                'progress_research_id' => $progressId,
                'image' => $imagePath,
                'caption' => $imgData['caption'] ?? null,
                'keterangan' => $imgData['keterangan'] ?? null,
                'index_order' => $imgData['index_order'],
            ]);
        }
    }
}
