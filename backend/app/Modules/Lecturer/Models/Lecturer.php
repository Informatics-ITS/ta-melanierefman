<?php

namespace Modules\Lecturer\Models;

use Modules\User\Models\User;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Lecturer extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'lecturers';

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'user_id',
        'judul',
        'title',
        'type',
        'file',
        'doc_type',
        'thumbnail',
        'youtube_link',
        'kata_kunci',
        'keyword'
    ];

    public static function validTypes()
    {
        return ['file', 'video'];
    }

    public static function validDocTypes()
    {
        return ['lecturer', 'guideline'];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
