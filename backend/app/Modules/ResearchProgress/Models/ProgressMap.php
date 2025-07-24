<?php

namespace Modules\ResearchProgress\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ProgressMap extends Model
{
    use HasFactory;

    protected $table = 'progress_maps';

    protected $fillable = [
        'progress_research_id',
        'latitude',
        'longitude',
        'zoom',
        'index_order',
    ];

    public function research_progress()
    {
        return $this->belongsTo(ResearchProgress::class, 'progress_research_id');
    }
}
