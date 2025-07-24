<?php

namespace Modules\ResearchProgress\Services;

use Modules\ResearchProgress\Models\TextEditor;

class ProgressTextEditorService
{
    public function createTextEditors($progressId, array $textEditors)
    {
        foreach ($textEditors as $editor) {
            TextEditor::create([
                'progress_research_id' => $progressId,
                'text_editor_id' => $editor['text_editor_id'],
                'text_editor_en' => $editor['text_editor_en'],
                'index_order' => $editor['index_order'],
            ]);
        }
    }

    public function updateTextEditors($progressId, array $textEditors)
    {
        $existingIds = collect($textEditors)->pluck('id')->filter()->toArray();

        TextEditor::where('progress_research_id', $progressId)
            ->whereNotIn('id', $existingIds)
            ->delete();

        foreach ($textEditors as $editor) {
            if (!empty($editor['id'])) {
                $existingEditor = TextEditor::find($editor['id']);
                if ($existingEditor) {
                    $existingEditor->update([
                        'text_editor_id' => $editor['text_editor_id'] ?? $existingEditor->text_editor_id,
                        'text_editor_en' => $editor['text_editor_en'] ?? $existingEditor->text_editor_en,
                        'index_order' => $editor['index_order'],
                    ]);
                }
            } else {
                TextEditor::create([
                    'progress_research_id' => $progressId,
                    'text_editor_id' => $editor['text_editor_id'] ?? null,
                    'text_editor_en' => $editor['text_editor_en'] ?? null,
                    'index_order' => $editor['index_order'],
                ]);
            }
        }
    }
}
