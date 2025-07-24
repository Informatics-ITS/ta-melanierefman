<?php

namespace Modules\ResearchProgress\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TextEditor extends Model
{
    use HasFactory;

    protected $table = 'text_editors';

    protected $fillable = [
        'progress_research_id',
        'text_editor_id',
        'text_editor_en',
        'index_order',
    ];

    public function research_progress()
    {
        return $this->belongsTo(ResearchProgress::class);
    }
}
