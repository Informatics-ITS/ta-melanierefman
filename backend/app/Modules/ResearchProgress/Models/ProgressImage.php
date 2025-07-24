<?php

namespace Modules\ResearchProgress\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ProgressImage extends Model
{
    use HasFactory;

    protected $table = 'progress_images';

    protected $fillable = [
        'progress_research_id',
        'image',
        'keterangan',
        'caption',
        'index_order',
    ];

    public function research_progress()
    {
        return $this->belongsTo(ResearchProgress::class);
    }
}
