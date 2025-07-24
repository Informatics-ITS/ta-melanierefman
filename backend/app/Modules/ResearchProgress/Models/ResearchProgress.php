<?php

namespace Modules\ResearchProgress\Models;

use Modules\Research\Models\Research;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ResearchProgress extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'research_progress';

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'research_id',
        'judul_progres',
        'title_progress',
        'deskripsi',
        'description',
    ];

    public function research()
    {
        return $this->belongsTo(Research::class);
    }

    public function progress_images()
    {
        return $this->hasMany(ProgressImage::class, 'progress_research_id');
    }

    public function progress_videos()
    {
        return $this->hasMany(ProgressVideo::class, 'progress_research_id');
    }

    public function text_editors()
    {
        return $this->hasMany(TextEditor::class, 'progress_research_id');
    }

    public function progress_maps()
    {
        return $this->hasMany(ProgressMap::class, 'progress_research_id');
    }
}
