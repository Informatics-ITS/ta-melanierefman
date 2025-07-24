<?php

namespace Modules\Publication\Models;

use Modules\Research\Models\Research;
use Modules\User\Models\User;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Publication extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'publication';

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'research_id',
        'title',
        'author',
        'year',
        'name_journal',
        'volume',
        'issue',
        'page',
        'DOI_link',
        'article_link',
        'image',
        'user_id',
    ];

    public function research()
    {
        return $this->belongsTo(Research::class); // Relasi one-to-one
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
