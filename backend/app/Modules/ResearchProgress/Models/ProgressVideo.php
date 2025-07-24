<?php

namespace Modules\ResearchProgress\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ProgressVideo extends Model
{
    use HasFactory;

    protected $table = 'progress_videos';

    protected $fillable = [
        'progress_research_id',
        'youtube_link',
        'index_order',
    ];

    public function research_progress()
    {
        return $this->belongsTo(ResearchProgress::class, 'progress_research_id');
    }
}
