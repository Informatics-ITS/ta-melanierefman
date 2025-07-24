<?php

namespace Modules\Documentation\Models;

use Modules\About\Models\About;
use Modules\Research\Models\Research;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Documentation extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'documentation';

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'judul',
        'title',
        'type',
        'image',
        'youtube_link',
        'keterangan',
        'caption',
        'about_type',
    ];

    public static function validTypes()
    {
        return ['image', 'video'];
    }

    public static function validAboutTypes()
    {
        return ['section1', 'section2'];
    }

    public function about()
    {
        return $this->belongsTo(About::class);
    }

    public function research()
    {
        return $this->belongsToMany(Research::class, 'documentation_research', 'documentation_id', 'research_id')
            ->withPivot('is_thumbnail')
            ->withTimestamps();
    }
}
